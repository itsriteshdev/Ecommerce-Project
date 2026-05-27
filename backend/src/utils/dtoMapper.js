const toCustomerResponseDto = (customer) => {
  if (!customer) return null;
  return {
    id: parseInt(customer.id || customer.customer_id, 10),
    fullName: customer.full_name,
    email: customer.email,
    phoneNumber: customer.phone_number,
    profileImage: customer.profile_image,
    gender: customer.gender,
    address: customer.address,
    city: customer.city,
    state: customer.state,
    pincode: customer.pincode,
    accountStatus: customer.account_status,
    createdAt: customer.created_at,
    updatedAt: customer.updated_at
  };
};

const toSellerResponseDto = (seller) => {
  if (!seller) return null;
  return {
    sellerId: parseInt(seller.seller_id, 10),
    sellerName: seller.seller_name,
    businessName: seller.business_name,
    gstNumber: seller.gst_number,
    email: seller.email,
    phoneNumber: seller.phone_number,
    warehouseAddress: seller.warehouse_address,
    bankDetails: seller.bank_details,
    sellerLogo: seller.seller_logo,
    verificationStatus: seller.verification_status,
    revenue: parseFloat(seller.revenue || 0),
    ratings: parseFloat(seller.ratings || 0),
    createdAt: seller.created_at,
    updatedAt: seller.updated_at
  };
};

const toProductResponseDto = (product, images = [], specs = {}) => {
  if (!product) return null;
  return {
    productId: parseInt(product.product_id, 10),
    productName: product.product_name,
    description: product.description,
    category: product.category,
    brand: product.brand,
    sku: product.sku,
    price: parseFloat(product.price),
    discountPrice: product.discount_price ? parseFloat(product.discount_price) : null,
    stockQuantity: parseInt(product.stock_quantity, 10),
    productImages: images || [],
    specifications: specs || {},
    ratings: parseFloat(product.ratings || 0),
    deliveryInfo: product.delivery_info,
    sellerId: product.seller_id ? parseInt(product.seller_id, 10) : null,
    sellerBusinessName: product.business_name || null,
    createdAt: product.created_at,
    updatedAt: product.updated_at
  };
};

const toCartItemDto = (item) => {
  if (!item) return null;
  return {
    cartItemId: parseInt(item.cart_item_id, 10),
    productId: parseInt(item.product_id, 10),
    productName: item.product_name,
    productSku: item.sku,
    productImage: item.image_url || null,
    price: parseFloat(item.discount_price || item.price),
    originalPrice: parseFloat(item.price),
    discountPrice: item.discount_price ? parseFloat(item.discount_price) : null,
    brand: item.brand || null,
    quantity: parseInt(item.quantity, 10),
    subtotal: parseFloat(item.subtotal)
  };
};

const toCartDto = (cart, items = []) => {
  if (!cart) return null;
  return {
    cartId: parseInt(cart.cart_id, 10),
    customerId: parseInt(cart.customer_id, 10),
    items: (items || []).map(toCartItemDto),
    totalAmount: parseFloat(cart.total_amount || 0)
  };
};

const toOrderItemDto = (item) => {
  if (!item) return null;
  return {
    orderItemId: parseInt(item.order_item_id, 10),
    productId: parseInt(item.product_id, 10),
    productName: item.product_name,
    productSku: item.sku,
    quantity: parseInt(item.quantity, 10),
    price: parseFloat(item.price),
    subtotal: parseFloat(item.subtotal)
  };
};

const toOrderResponseDto = (order, items = []) => {
  if (!order) return null;
  return {
    orderId: parseInt(order.order_id, 10),
    customerId: parseInt(order.customer_id, 10),
    customerName: order.customer_name || order.full_name || null,
    sellerId: parseInt(order.seller_id, 10),
    sellerBusinessName: order.business_name || null,
    items: (items || []).map(toOrderItemDto),
    totalAmount: parseFloat(order.total_amount),
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    shippingAddress: order.shipping_address,
    deliveryStatus: order.delivery_status,
    trackingId: order.tracking_id,
    orderDate: order.order_date,
    deliveryDate: order.delivery_date
  };
};

const toReviewResponseDto = (review) => {
  if (!review) return null;
  return {
    id: parseInt(review.id, 10),
    rating: parseFloat(review.rating),
    comment: review.comment,
    customerId: parseInt(review.customer_id, 10),
    customerName: review.customer_name || null,
    productId: parseInt(review.product_id, 10),
    createdAt: review.created_at
  };
};

const toCouponDto = (coupon) => {
  if (!coupon) return null;
  return {
    id: parseInt(coupon.id, 10),
    code: coupon.code,
    discountPercentage: parseFloat(coupon.discount_percentage),
    maxDiscountAmount: coupon.max_discount_amount ? parseFloat(coupon.max_discount_amount) : null,
    expiryDate: coupon.expiry_date,
    active: !!coupon.active
  };
};

const toNotificationDto = (notification) => {
  if (!notification) return null;
  return {
    id: parseInt(notification.id, 10),
    userId: parseInt(notification.user_id, 10),
    message: notification.message,
    read: !!notification.is_read,
    createdAt: notification.created_at
  };
};

const paginate = (content, page, size, totalElements) => {
  const totalPages = Math.ceil(totalElements / size);
  return {
    content,
    pageable: {
      sort: { sorted: false, unsorted: true, empty: true },
      offset: page * size,
      pageNumber: page,
      pageSize: size,
      paged: true,
      unpaged: false
    },
    totalPages,
    totalElements,
    last: page >= totalPages - 1,
    size,
    number: page,
    sort: { sorted: false, unsorted: true, empty: true },
    numberOfElements: content.length,
    first: page === 0,
    empty: content.length === 0
  };
};

module.exports = {
  toCustomerResponseDto,
  toSellerResponseDto,
  toProductResponseDto,
  toCartItemDto,
  toCartDto,
  toOrderItemDto,
  toOrderResponseDto,
  toReviewResponseDto,
  toCouponDto,
  toNotificationDto,
  paginate
};
