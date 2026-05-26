const db = require('../config/db');
const crypto = require('crypto');
const { AppError } = require('../middlewares/errorHandler');
const { toOrderResponseDto, paginate } = require('../utils/dtoMapper');

const getOrderItems = async (orderIds) => {
  if (!orderIds || orderIds.length === 0) return {};
  const itemsRes = await db.query(
    `SELECT oi.*, p.product_name, p.sku 
     FROM order_items oi 
     JOIN products p ON oi.product_id = p.product_id 
     WHERE oi.order_id = ANY($1)`,
    [orderIds]
  );
  const map = {};
  itemsRes.rows.forEach(row => {
    if (!map[row.order_id]) map[row.order_id] = [];
    map[row.order_id].push(row);
  });
  return map;
};

const placeOrders = async (req, res, next) => {
  const customerId = req.user.id;
  const { shippingAddress, paymentMethod, couponCode } = req.body;

  if (!shippingAddress || !paymentMethod) {
    return next(new AppError('Required fields: shippingAddress, paymentMethod', 400));
  }

  try {
    // 1. Get Cart
    const cartRes = await db.query('SELECT * FROM carts WHERE customer_id = $1', [customerId]);
    if (cartRes.rows.length === 0) {
      return next(new AppError('Your cart is empty', 400));
    }
    const cart = cartRes.rows[0];

    // 2. Get Cart Items
    const itemsRes = await db.query(
      `SELECT ci.*, p.product_name, p.price, p.discount_price, p.stock_quantity, p.seller_id, s.business_name
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.product_id
       JOIN sellers s ON p.seller_id = s.seller_id
       WHERE ci.cart_id = $1`,
      [cart.cart_id]
    );

    if (itemsRes.rows.length === 0) {
      return next(new AppError('Your cart is empty', 400));
    }

    // 3. Validate and apply coupon
    let discountFactor = 1.0;
    if (couponCode && couponCode.trim()) {
      const couponRes = await db.query('SELECT * FROM coupons WHERE LOWER(code) = LOWER($1)', [couponCode.trim()]);
      if (couponRes.rows.length === 0) {
        return next(new AppError('Coupon code not found', 404));
      }
      const coupon = couponRes.rows[0];

      if (!coupon.active || new Date(coupon.expiry_date) < new Date()) {
        return next(new AppError('Coupon is expired or inactive', 400));
      }

      const discountPct = parseFloat(coupon.discount_percentage);
      discountFactor = 1.0 - (discountPct / 100.0);
    }

    // 4. Group cart items by seller
    const itemsBySeller = {};
    itemsRes.rows.forEach(item => {
      if (!itemsBySeller[item.seller_id]) {
        itemsBySeller[item.seller_id] = [];
      }
      itemsBySeller[item.seller_id].push(item);
    });

    const createdOrders = [];

    await db.query('BEGIN');

    // 5. Place order for each seller group
    for (const [sellerId, sellerItems] of Object.entries(itemsBySeller)) {
      const trackingId = 'TRK-' + crypto.randomUUID().substring(0, 8).toUpperCase();

      // Create Order
      const orderRes = await db.query(
        `INSERT INTO orders (customer_id, seller_id, total_amount, payment_method, payment_status, shipping_address, delivery_status, tracking_id, order_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *`,
        [customerId, sellerId, 0.00, paymentMethod, 'PENDING', shippingAddress, 'PENDING', trackingId]
      );
      const order = orderRes.rows[0];
      const orderId = order.order_id;

      let orderTotal = 0.00;
      const orderItemsToInsert = [];

      for (const item of sellerItems) {
        // Stock check
        if (parseInt(item.stock_quantity, 10) < parseInt(item.quantity, 10)) {
          throw new AppError(
            `Insufficient stock for product: ${item.product_name}. Available: ${item.stock_quantity}, Requested: ${item.quantity}`,
            400
          );
        }

        // Deduct stock
        const newStock = parseInt(item.stock_quantity, 10) - parseInt(item.quantity, 10);
        await db.query('UPDATE products SET stock_quantity = $1 WHERE product_id = $2', [newStock, item.product_id]);

        // Calculate pricing
        const basePrice = item.discount_price ? parseFloat(item.discount_price) : parseFloat(item.price);
        const discountedPrice = parseFloat((basePrice * discountFactor).toFixed(2));
        const subtotal = discountedPrice * parseInt(item.quantity, 10);

        orderTotal += subtotal;

        // Insert Order Item
        const oiRes = await db.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price, subtotal)
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [orderId, item.product_id, item.quantity, discountedPrice, subtotal]
        );
        
        // Attach fields for DTO mapper
        const oi = oiRes.rows[0];
        oi.product_name = item.product_name;
        oi.sku = item.sku;
        orderItemsToInsert.push(oi);
      }

      // Update Order Total
      const finalOrderRes = await db.query(
        'UPDATE orders SET total_amount = $1 WHERE order_id = $2 RETURNING *',
        [orderTotal, orderId]
      );
      const finalOrder = finalOrderRes.rows[0];

      // Retrieve names for mapper
      const custRes = await db.query('SELECT full_name FROM customers WHERE id = $1', [customerId]);
      finalOrder.customer_name = custRes.rows[0]?.full_name;

      const selRes = await db.query('SELECT business_name FROM sellers WHERE seller_id = $1', [sellerId]);
      finalOrder.business_name = selRes.rows[0]?.business_name;

      finalOrder.items = orderItemsToInsert;
      createdOrders.push(finalOrder);
    }

    // 6. Clear Cart
    await db.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.cart_id]);
    await db.query('UPDATE carts SET total_amount = 0.00 WHERE cart_id = $1', [cart.cart_id]);

    await db.query('COMMIT');

    const result = createdOrders.map(o => toOrderResponseDto(o, o.items));
    res.status(201).json(result);
  } catch (err) {
    await db.query('ROLLBACK');
    next(err);
  }
};

const getCustomerOrders = async (req, res, next) => {
  const customerId = req.user.id;
  const page = parseInt(req.query.page || 0, 10);
  const size = parseInt(req.query.size || 10, 10);
  const offset = page * size;

  try {
    const countRes = await db.query('SELECT COUNT(*) FROM orders WHERE customer_id = $1', [customerId]);
    const totalElements = parseInt(countRes.rows[0].count, 10);

    const ordersRes = await db.query(
      `SELECT o.*, c.full_name as customer_name, s.business_name
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       JOIN sellers s ON o.seller_id = s.seller_id
       WHERE o.customer_id = $1
       ORDER BY o.order_date DESC
       LIMIT $2 OFFSET $3`,
      [customerId, size, offset]
    );

    const orderIds = ordersRes.rows.map(o => parseInt(o.order_id, 10));
    const itemsMap = await getOrderItems(orderIds);

    const content = ordersRes.rows.map(o => toOrderResponseDto(o, itemsMap[o.order_id] || []));
    res.json(paginate(content, page, size, totalElements));
  } catch (err) {
    next(err);
  }
};

const getSellerOrders = async (req, res, next) => {
  const sellerId = req.user.id;
  const page = parseInt(req.query.page || 0, 10);
  const size = parseInt(req.query.size || 10, 10);
  const offset = page * size;

  try {
    const countRes = await db.query('SELECT COUNT(*) FROM orders WHERE seller_id = $1', [sellerId]);
    const totalElements = parseInt(countRes.rows[0].count, 10);

    const ordersRes = await db.query(
      `SELECT o.*, c.full_name as customer_name, s.business_name
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       JOIN sellers s ON o.seller_id = s.seller_id
       WHERE o.seller_id = $1
       ORDER BY o.order_date DESC
       LIMIT $2 OFFSET $3`,
      [sellerId, size, offset]
    );

    const orderIds = ordersRes.rows.map(o => parseInt(o.order_id, 10));
    const itemsMap = await getOrderItems(orderIds);

    const content = ordersRes.rows.map(o => toOrderResponseDto(o, itemsMap[o.order_id] || []));
    res.json(paginate(content, page, size, totalElements));
  } catch (err) {
    next(err);
  }
};

const getOrderById = async (req, res, next) => {
  const { orderId } = req.params;
  const userEmail = req.user.email;
  const userRole = req.user.role;

  try {
    const orderRes = await db.query(
      `SELECT o.*, c.full_name as customer_name, c.email as customer_email, s.business_name, s.email as seller_email
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       JOIN sellers s ON o.seller_id = s.seller_id
       WHERE o.order_id = $1`,
      [orderId]
    );

    if (orderRes.rows.length === 0) {
      return next(new AppError('Order not found with id: ' + orderId, 404));
    }

    const order = orderRes.rows[0];

    // Auth check
    const isCustomer = order.customer_email === userEmail;
    const isSeller = order.seller_email === userEmail;
    const isAdmin = userRole === 'ROLE_ADMIN';

    if (!isCustomer && !isSeller && !isAdmin) {
      return next(new AppError('You are not authorized to view this order', 403));
    }

    const itemsMap = await getOrderItems([parseInt(order.order_id, 10)]);
    res.json(toOrderResponseDto(order, itemsMap[order.order_id] || []));
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  const { orderId } = req.params;
  const { deliveryStatus, paymentStatus, trackingId } = req.body;

  try {
    const orderRes = await db.query('SELECT * FROM orders WHERE order_id = $1', [orderId]);
    if (orderRes.rows.length === 0) {
      return next(new AppError('Order not found with id: ' + orderId, 404));
    }
    const order = orderRes.rows[0];

    await db.query('BEGIN');

    let updatedDeliveryStatus = order.delivery_status;
    let updatedPaymentStatus = order.payment_status;
    let updatedTrackingId = order.tracking_id;
    let deliveryDate = order.delivery_date;

    if (deliveryStatus !== undefined) {
      updatedDeliveryStatus = deliveryStatus;
      if (deliveryStatus === 'DELIVERED') {
        deliveryDate = new Date();
        
        // Credit seller revenue if paid
        if (updatedPaymentStatus === 'PAID') {
          await db.query(
            'UPDATE sellers SET revenue = revenue + $1 WHERE seller_id = $2',
            [parseFloat(order.total_amount), order.seller_id]
          );
        }
      }
    }

    if (paymentStatus !== undefined) {
      const oldPaymentStatus = order.payment_status;
      updatedPaymentStatus = paymentStatus;

      // Credit seller revenue if paid and delivered
      if (oldPaymentStatus !== 'PAID' && paymentStatus === 'PAID' && updatedDeliveryStatus === 'DELIVERED') {
        await db.query(
          'UPDATE sellers SET revenue = revenue + $1 WHERE seller_id = $2',
          [parseFloat(order.total_amount), order.seller_id]
        );
      }
    }

    if (trackingId !== undefined) {
      updatedTrackingId = trackingId;
    }

    const finalOrderRes = await db.query(
      `UPDATE orders 
       SET delivery_status = $1, payment_status = $2, tracking_id = $3, delivery_date = $4, updated_at = NOW() 
       WHERE order_id = $5 RETURNING *`,
      [updatedDeliveryStatus, updatedPaymentStatus, updatedTrackingId, deliveryDate, orderId]
    );
    const finalOrder = finalOrderRes.rows[0];

    await db.query('COMMIT');

    // Retrieve details for mapper
    const custRes = await db.query('SELECT full_name FROM customers WHERE id = $1', [finalOrder.customer_id]);
    finalOrder.customer_name = custRes.rows[0]?.full_name;

    const selRes = await db.query('SELECT business_name FROM sellers WHERE seller_id = $1', [finalOrder.seller_id]);
    finalOrder.business_name = selRes.rows[0]?.business_name;

    const itemsMap = await getOrderItems([parseInt(orderId, 10)]);

    res.json(toOrderResponseDto(finalOrder, itemsMap[orderId] || []));
  } catch (err) {
    await db.query('ROLLBACK');
    next(err);
  }
};

const cancelOrder = async (req, res, next) => {
  const { orderId } = req.params;
  const userEmail = req.user.email;

  try {
    const orderRes = await db.query(
      `SELECT o.*, c.email as customer_email, s.email as seller_email
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       JOIN sellers s ON o.seller_id = s.seller_id
       WHERE o.order_id = $1`,
      [orderId]
    );

    if (orderRes.rows.length === 0) {
      return next(new AppError('Order not found with id: ' + orderId, 404));
    }

    const order = orderRes.rows[0];

    // Auth check
    if (order.customer_email !== userEmail && order.seller_email !== userEmail) {
      return next(new AppError('You are not authorized to cancel this order', 403));
    }

    if (order.delivery_status === 'DELIVERED' || order.delivery_status === 'CANCELLED') {
      return next(new AppError(`Order cannot be cancelled as it is already ${order.delivery_status}`, 400));
    }

    await db.query('BEGIN');

    // Restore stock levels
    const itemsRes = await db.query('SELECT product_id, quantity FROM order_items WHERE order_id = $1', [orderId]);
    for (const item of itemsRes.rows) {
      await db.query(
        'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE product_id = $2',
        [parseInt(item.quantity, 10), item.product_id]
      );
    }

    let finalPaymentStatus = order.payment_status;
    if (order.payment_status === 'PAID') {
      finalPaymentStatus = 'REFUNDED';
    }

    const finalOrderRes = await db.query(
      `UPDATE orders SET delivery_status = $1, payment_status = $2, updated_at = NOW() WHERE order_id = $3 RETURNING *`,
      ['CANCELLED', finalPaymentStatus, orderId]
    );
    const finalOrder = finalOrderRes.rows[0];

    await db.query('COMMIT');

    const custRes = await db.query('SELECT full_name FROM customers WHERE id = $1', [finalOrder.customer_id]);
    finalOrder.customer_name = custRes.rows[0]?.full_name;

    const selRes = await db.query('SELECT business_name FROM sellers WHERE seller_id = $1', [finalOrder.seller_id]);
    finalOrder.business_name = selRes.rows[0]?.business_name;

    const itemsMap = await getOrderItems([parseInt(orderId, 10)]);

    res.json(toOrderResponseDto(finalOrder, itemsMap[orderId] || []));
  } catch (err) {
    await db.query('ROLLBACK');
    next(err);
  }
};

module.exports = {
  placeOrders,
  getCustomerOrders,
  getSellerOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
};
