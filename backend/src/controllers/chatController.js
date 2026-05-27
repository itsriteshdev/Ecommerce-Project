const db = require('../config/db');
const { AppError } = require('../middlewares/errorHandler');

// Simple in-memory rate limiter to prevent API abuse in development
const ipRequestCounts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 15; // Max 15 requests per minute

const cleanRateLimits = () => {
  const now = Date.now();
  for (const [ip, data] of ipRequestCounts.entries()) {
    if (now - data.resetTime > RATE_LIMIT_WINDOW) {
      ipRequestCounts.delete(ip);
    }
  }
};

const sendMessage = async (req, res, next) => {
  const { message, history } = req.body;
  const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';

  if (!message || typeof message !== 'string') {
    return next(new AppError('Message is required and must be a string', 400));
  }

  // 1. Rate Limiting Check
  cleanRateLimits();
  const now = Date.now();
  let limitData = ipRequestCounts.get(clientIp);

  if (!limitData) {
    limitData = { count: 1, resetTime: now };
    ipRequestCounts.set(clientIp, limitData);
  } else {
    if (now - limitData.resetTime < RATE_LIMIT_WINDOW) {
      limitData.count++;
      if (limitData.count > MAX_REQUESTS_PER_WINDOW) {
        return next(new AppError('Too many requests, please try again in a minute.', 429));
      }
    } else {
      limitData.count = 1;
      limitData.resetTime = now;
    }
  }

  try {
    // 2. Fetch active catalog products from DB, including primary image
    const catalogRes = await db.query(
      `SELECT p.product_id, p.product_name, p.price, p.discount_price, p.category, p.brand, p.stock_quantity, p.ratings, p.delivery_info,
              (SELECT image_url FROM product_images WHERE product_id = p.product_id LIMIT 1) as image_url
       FROM products p
       WHERE p.stock_quantity > 0`
    );

    const products = catalogRes.rows.map(p => ({
      productId: parseInt(p.product_id, 10),
      productName: p.product_name,
      price: parseFloat(p.price),
      discountPrice: p.discount_price ? parseFloat(p.discount_price) : null,
      category: p.category,
      brand: p.brand,
      stockQuantity: p.stock_quantity,
      ratings: parseFloat(p.ratings || 0),
      deliveryInfo: p.delivery_info,
      imageUrl: p.image_url || null
    }));

    // 3. Construct System Prompt
    const systemPrompt = `You are a premium AI fashion stylist and shopping assistant for 'FRAIS', an elite multi-vendor Indian ethnic couture boutique.
You guide customers to discover sarees, salwar kameez, lehengas, Indo-western wear, menswear, and jewellery.

Here is our current in-stock database catalog:
${JSON.stringify(products, null, 2)}

Instructions:
1. ONLY suggest and recommend products that exist in the active catalog list above. Do NOT recommend external brands or invent non-existent products.
2. If the user describes an occasion (wedding, sangeet, haldi, casual, etc.), recommend matching items from the catalog.
3. Keep your conversation warm, sophisticated, fashion-knowledgeable, and concise. Avoid overly long replies.
4. AT THE END OF YOUR RESPONSE: If you recommend any products, you MUST append a specific instruction tag so the UI can render interactive product cards for the customer.
   Format the tag exactly like this: [RECOMMEND_PRODUCTS: id1, id2, ...]
   Example: If you recommend 'Sage Green Silk Saree' (ID 1) and 'Banarasi Silk Saree in Pink' (ID 2), end your response with:
   "These selections would look gorgeous on you!
   [RECOMMEND_PRODUCTS: 1, 2]"
   If no products are recommended in your message, do NOT include the tag.
5. You can answer general FAQ questions:
   - Shipping: Free delivery on orders above ₹1,999. Under 1999, shipping is ₹100.
   - Transit times: Standard transit takes 2-4 business days.
   - Return policy: 3-day reverse pickup returns supported.
   - Authentic: All items are certified handcrafted handloom weaves.`;

    // 4. Map message history into Google Gemini API format
    let rawContents = (history || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
    
    // Add current user message
    rawContents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Gemini API constraints:
    // - Must start with 'user'
    // - Must alternate between 'user' and 'model' roles
    const contents = [];
    for (const item of rawContents) {
      if (contents.length === 0) {
        if (item.role === 'user') {
          contents.push(item);
        }
      } else {
        const lastItem = contents[contents.length - 1];
        if (lastItem.role !== item.role) {
          contents.push(item);
        } else {
          // Merge consecutive messages of the same role
          lastItem.parts[0].text += '\n' + item.parts[0].text;
        }
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return next(new AppError('Gemini API key is not configured on the server', 500));
    }

    // 5. Send POST request to Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      return next(new AppError('Error communicating with AI service', 502));
    }

    const resJson = await geminiResponse.json();
    const aiText = resJson.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract recommendations of form [RECOMMEND_PRODUCTS: id1, id2, ...]
    const recommendRegex = /\[RECOMMEND_PRODUCTS:\s*([^[\]]+)\]/gi;
    let match;
    const recommendedIds = new Set();
    let cleanText = aiText;

    while ((match = recommendRegex.exec(aiText)) !== null) {
      const idsStr = match[1];
      idsStr.split(',').forEach(idPart => {
        const id = parseInt(idPart.trim(), 10);
        if (!isNaN(id)) {
          recommendedIds.add(id);
        }
      });
    }

    // Remove all occurrences of the tag from the text and trim
    cleanText = cleanText.replace(recommendRegex, '').trim();

    const recommendations = products.filter(p => recommendedIds.has(p.productId));

    // 6. Return response to client
    res.json({
      response: cleanText,
      recommendations
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  sendMessage
};
