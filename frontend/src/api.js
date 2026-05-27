const BASE_URL = 'http://localhost:8080';

function getHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const mergedOptions = {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  };

  const response = await fetch(url, mergedOptions);
  
  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    const errorText = await response.text();
    let errorJson;
    try {
      errorJson = JSON.parse(errorText);
    } catch (e) {
      errorJson = { message: errorText };
    }
    throw new Error(errorJson.message || errorJson.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email, password) => 
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
    
  registerCustomer: (data) =>
    request('/api/auth/register/customer', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  registerSeller: (data) =>
    request('/api/auth/register/seller', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Products
  getProducts: (page = 0, size = 12) =>
    request(`/api/products?page=${page}&size=${size}`),

  searchProducts: (query, page = 0, size = 12) =>
    request(`/api/products/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`),

  filterProducts: (category, page = 0, size = 12) => {
    let url = `/api/products/filter?page=${page}&size=${size}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    return request(url);
  },

  getProduct: (id) =>
    request(`/api/products/${id}`),

  addProduct: (productData) =>
    request('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    }),

  updateProduct: (id, productData) =>
    request(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    }),

  deleteProduct: (id) =>
    request(`/api/products/${id}`, {
      method: 'DELETE',
    }),

  // Cart
  getCart: () =>
    request('/api/cart'),

  addToCart: (productId, quantity = 1) =>
    request('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),

  updateCartItem: (cartItemId, quantity) =>
    request(`/api/cart/items/${cartItemId}?quantity=${quantity}`, {
      method: 'PUT',
    }),

  removeFromCart: (cartItemId) =>
    request(`/api/cart/items/${cartItemId}`, {
      method: 'DELETE',
    }),

  clearCart: () =>
    request('/api/cart', {
      method: 'DELETE',
    }),

  // Orders
  placeOrder: (shippingAddress, paymentMethod, couponCode) =>
    request('/api/orders/place', {
      method: 'POST',
      body: JSON.stringify({ shippingAddress, paymentMethod, couponCode: couponCode || null }),
    }),

  getCustomerOrders: (page = 0, size = 10) =>
    request(`/api/orders/customer?page=${page}&size=${size}`),

  getSellerOrders: (page = 0, size = 10) =>
    request(`/api/orders/seller?page=${page}&size=${size}`),

  updateOrderStatus: (orderId, deliveryStatus, paymentStatus) =>
    request(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ deliveryStatus, paymentStatus }),
    }),

  cancelOrder: (orderId) =>
    request(`/api/orders/${orderId}/cancel`, {
      method: 'POST',
    }),

  // Seller Dashboard
  getSellerDashboard: () =>
    request('/api/seller/dashboard'),

  // Admin
  getAllSellers: () =>
    request('/api/admin/sellers'),
  
  verifySeller: (sellerId, status) =>
    request(`/api/admin/sellers/${sellerId}/verify?status=${status}`, {
      method: 'PUT',
    }),

  createCoupon: (couponDto) =>
    request('/api/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(couponDto),
    }),

  getAllCoupons: () =>
    request('/api/admin/coupons'),

  deleteCoupon: (couponId) =>
    request(`/api/admin/coupons/${couponId}`, {
      method: 'DELETE',
    }),

  getAdminDashboardStats: () =>
    request('/api/admin/metrics'),

  getAdminOrders: () =>
    request('/api/admin/orders'),

  getAdminProducts: () =>
    request('/api/admin/products'),

  deleteProductAdmin: (productId) =>
    request(`/api/admin/products/${productId}`, {
      method: 'DELETE',
    }),

  getAdminCustomers: () =>
    request('/api/admin/customers'),

  toggleCustomerStatus: (customerId, status) =>
    request(`/api/admin/customers/${customerId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  getAdminReviews: () =>
    request('/api/admin/reviews'),

  deleteReviewAdmin: (reviewId) =>
    request(`/api/admin/reviews/${reviewId}`, {
      method: 'DELETE',
    }),

  getAdminCategories: () =>
    request('/api/admin/categories'),

  // Customer Profile & Wishlist
  getProfile: () =>
    request('/api/customer/profile'),

  updateProfile: (profileData) =>
    request('/api/customer/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  addToWishlist: (productId) =>
    request(`/api/customer/wishlist/${productId}`, {
      method: 'POST',
    }),

  removeFromWishlist: (productId) =>
    request(`/api/customer/wishlist/${productId}`, {
      method: 'DELETE',
    }),

  getWishlist: () =>
    request('/api/customer/wishlist'),

  // AI Chatbot
  sendChatMessage: (message, history = []) =>
    request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    }),
};
