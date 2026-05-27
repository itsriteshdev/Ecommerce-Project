const db = require('../config/db');
const { AppError } = require('../middlewares/errorHandler');
const { toCartDto } = require('../utils/dtoMapper');

// Helper to retrieve or create cart for a customer
const getOrCreateCart = async (customerId) => {
  let cartRes = await db.query('SELECT * FROM carts WHERE customer_id = $1', [customerId]);
  if (cartRes.rows.length === 0) {
    cartRes = await db.query(
      'INSERT INTO carts (customer_id, total_amount) VALUES ($1, $2) RETURNING *',
      [customerId, 0.00]
    );
  }
  return cartRes.rows[0];
};

// Helper to retrieve cart items with product details
const getCartItemsWithProduct = async (cartId) => {
  const itemsRes = await db.query(
    `SELECT ci.*, p.product_name, p.sku, p.price, p.discount_price, p.brand,
            (SELECT image_url FROM product_images WHERE product_id = p.product_id LIMIT 1) as image_url
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.product_id
     WHERE ci.cart_id = $1`,
    [cartId]
  );
  return itemsRes.rows;
};

// Helper to recalculate cart total amount
const recalculateCartTotal = async (cartId) => {
  const sumRes = await db.query(
    'SELECT COALESCE(SUM(subtotal), 0.00) as total FROM cart_items WHERE cart_id = $1',
    [cartId]
  );
  const total = parseFloat(sumRes.rows[0].total);
  await db.query('UPDATE carts SET total_amount = $1 WHERE cart_id = $2', [total, cartId]);
};

const getCart = async (req, res, next) => {
  const customerId = req.user.id;

  try {
    const cart = await getOrCreateCart(customerId);
    const items = await getCartItemsWithProduct(cart.cart_id);
    res.json(toCartDto(cart, items));
  } catch (err) {
    next(err);
  }
};

const addItemToCart = async (req, res, next) => {
  const customerId = req.user.id;
  const { productId, quantity } = req.body;
  const qty = parseInt(quantity || 1, 10);

  if (!productId) {
    return next(new AppError('productId is required', 400));
  }

  try {
    const cart = await getOrCreateCart(customerId);

    // Verify product exists and check stock
    const prodRes = await db.query('SELECT price, discount_price, stock_quantity FROM products WHERE product_id = $1', [productId]);
    if (prodRes.rows.length === 0) {
      return next(new AppError('Product not found with id: ' + productId, 404));
    }
    const product = prodRes.rows[0];

    // Check if item already in cart
    const itemRes = await db.query(
      'SELECT cart_item_id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cart.cart_id, productId]
    );

    const basePrice = product.discount_price ? parseFloat(product.discount_price) : parseFloat(product.price);
    const existingItem = itemRes.rows[0];
    const totalRequestedQty = existingItem ? (parseInt(existingItem.quantity, 10) + qty) : qty;

    if (product.stock_quantity < totalRequestedQty) {
      return next(new AppError(`Requested quantity exceeds available stock (${product.stock_quantity})`, 400));
    }

    await db.query('BEGIN');

    if (existingItem) {
      const newSubtotal = basePrice * totalRequestedQty;
      await db.query(
        'UPDATE cart_items SET quantity = $1, subtotal = $2 WHERE cart_item_id = $3',
        [totalRequestedQty, newSubtotal, existingItem.cart_item_id]
      );
    } else {
      const subtotal = basePrice * qty;
      await db.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity, subtotal) VALUES ($1, $2, $3, $4)',
        [cart.cart_id, productId, qty, subtotal]
      );
    }

    await recalculateCartTotal(cart.cart_id);

    await db.query('COMMIT');

    // Retrieve updated cart
    const updatedCart = await getOrCreateCart(customerId);
    const items = await getCartItemsWithProduct(updatedCart.cart_id);
    res.json(toCartDto(updatedCart, items));
  } catch (err) {
    await db.query('ROLLBACK');
    next(err);
  }
};

const updateItemQuantity = async (req, res, next) => {
  const customerId = req.user.id;
  const { cartItemId } = req.params;
  const quantity = parseInt(req.query.quantity || req.body.quantity, 10);

  if (quantity === undefined || isNaN(quantity) || quantity <= 0) {
    return next(new AppError('Quantity must be a positive integer', 400));
  }

  try {
    const cart = await getOrCreateCart(customerId);

    // Verify cart item exists and belongs to customer's cart
    const ciRes = await db.query(
      `SELECT ci.*, p.stock_quantity, p.price, p.discount_price 
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.product_id
       WHERE ci.cart_item_id = $1`,
      [cartItemId]
    );

    if (ciRes.rows.length === 0) {
      return next(new AppError('Cart item not found with id: ' + cartItemId, 404));
    }

    const cartItem = ciRes.rows[0];
    if (parseInt(cartItem.cart_id, 10) !== parseInt(cart.cart_id, 10)) {
      return next(new AppError('Cart item does not belong to your cart', 400));
    }

    if (parseInt(cartItem.stock_quantity, 10) < quantity) {
      return next(new AppError(`Requested quantity exceeds available stock (${cartItem.stock_quantity})`, 400));
    }

    const basePrice = cartItem.discount_price ? parseFloat(cartItem.discount_price) : parseFloat(cartItem.price);
    const subtotal = basePrice * quantity;

    await db.query('BEGIN');

    await db.query(
      'UPDATE cart_items SET quantity = $1, subtotal = $2 WHERE cart_item_id = $3',
      [quantity, subtotal, cartItemId]
    );

    await recalculateCartTotal(cart.cart_id);

    await db.query('COMMIT');

    const updatedCart = await getOrCreateCart(customerId);
    const items = await getCartItemsWithProduct(updatedCart.cart_id);
    res.json(toCartDto(updatedCart, items));
  } catch (err) {
    await db.query('ROLLBACK');
    next(err);
  }
};

const removeItemFromCart = async (req, res, next) => {
  const customerId = req.user.id;
  const { cartItemId } = req.params;

  try {
    const cart = await getOrCreateCart(customerId);

    // Verify item belongs to customer's cart
    const ciRes = await db.query('SELECT cart_id FROM cart_items WHERE cart_item_id = $1', [cartItemId]);
    if (ciRes.rows.length === 0) {
      return next(new AppError('Cart item not found with id: ' + cartItemId, 404));
    }

    if (parseInt(ciRes.rows[0].cart_id, 10) !== parseInt(cart.cart_id, 10)) {
      return next(new AppError('Cart item does not belong to your cart', 400));
    }

    await db.query('BEGIN');

    await db.query('DELETE FROM cart_items WHERE cart_item_id = $1', [cartItemId]);

    await recalculateCartTotal(cart.cart_id);

    await db.query('COMMIT');

    const updatedCart = await getOrCreateCart(customerId);
    const items = await getCartItemsWithProduct(updatedCart.cart_id);
    res.json(toCartDto(updatedCart, items));
  } catch (err) {
    await db.query('ROLLBACK');
    next(err);
  }
};

const clearCart = async (req, res, next) => {
  const customerId = req.user.id;

  try {
    const cart = await getOrCreateCart(customerId);

    await db.query('BEGIN');

    await db.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.cart_id]);
    await db.query('UPDATE carts SET total_amount = 0.00 WHERE cart_id = $1', [cart.cart_id]);

    await db.query('COMMIT');

    res.json('Cart cleared successfully');
  } catch (err) {
    await db.query('ROLLBACK');
    next(err);
  }
};

module.exports = {
  getCart,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  clearCart
};
