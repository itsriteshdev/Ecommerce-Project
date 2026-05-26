import React, { useEffect, useState } from 'react';
import { LayoutDashboard, IndianRupee, Package, ShoppingCart, Star, Plus, RefreshCw, Edit, Trash2, X, Check, Save } from 'lucide-react';
import { api } from '../api';

export default function SellerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('metrics'); // 'metrics' | 'orders' | 'inventory'
  const [loading, setLoading] = useState(false);

  // Product Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // if null, adding new product
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    category: 'Sarees',
    brand: '',
    sku: '',
    price: '',
    discountPrice: '',
    stockQuantity: '',
    productImages: '',
    specificationsText: '',
    deliveryInfo: ''
  });

  // Order update states
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [tempDeliveryStatus, setTempDeliveryStatus] = useState('');
  const [tempPaymentStatus, setTempPaymentStatus] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [activeSubTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'metrics') {
        const dashRes = await api.getSellerDashboard();
        setDashboard(dashRes);
      } else if (activeSubTab === 'orders') {
        const orderRes = await api.getSellerOrders();
        setOrders(orderRes.content || orderRes || []);
      } else if (activeSubTab === 'inventory') {
        // We can get products from dashboard or getProducts and filter by seller id.
        // Actually, getSellerDashboard returns topProducts or all products?
        // Let's call dashboard to get products or load seller's products.
        const dashRes = await api.getSellerDashboard();
        setDashboard(dashRes);
      }
    } catch (err) {
      console.error('Failed to load seller data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddForm = () => {
    setEditingProduct(null);
    setFormData({
      productName: '',
      description: '',
      category: 'Sarees',
      brand: '',
      sku: 'SKU-' + Math.floor(Math.random() * 900000 + 100000),
      price: '',
      discountPrice: '',
      stockQuantity: '',
      productImages: '',
      specificationsText: 'Fabric: Silk, Origin: India',
      deliveryInfo: 'Delivered within 3-5 business days.'
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (prod) => {
    setEditingProduct(prod);

    // Parse specs map to comma separated text
    let specText = '';
    if (prod.specifications) {
      specText = Object.entries(prod.specifications)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
    }

    setFormData({
      productName: prod.productName,
      description: prod.description || '',
      category: prod.category || 'Electronics',
      brand: prod.brand || '',
      sku: prod.sku || '',
      price: prod.price || '',
      discountPrice: prod.discountPrice || '',
      stockQuantity: prod.stockQuantity || '',
      productImages: prod.productImages ? prod.productImages.join(', ') : '',
      specificationsText: specText,
      deliveryInfo: prod.deliveryInfo || ''
    });
    setIsFormOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    // Parse specifications text e.g., "Color: Black, Material: Leather" -> { Color: "Black", Material: "Leather" }
    const specsMap = {};
    if (formData.specificationsText) {
      const pairs = formData.specificationsText.split(',');
      pairs.forEach((pair) => {
        const [k, v] = pair.split(':');
        if (k && v) {
          specsMap[k.trim()] = v.trim();
        }
      });
    }

    const payload = {
      productName: formData.productName,
      description: formData.description,
      category: formData.category,
      brand: formData.brand,
      sku: formData.sku,
      price: Number(formData.price),
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
      stockQuantity: Number(formData.stockQuantity),
      productImages: formData.productImages ? formData.productImages.split(',').map((s) => s.trim()) : [],
      specifications: specsMap,
      deliveryInfo: formData.deliveryInfo
    };

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
      } else {
        await api.addProduct(payload);
      }
      setIsFormOpen(false);
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await api.deleteProduct(id);
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const startEditOrder = (order) => {
    setUpdatingOrderId(order.orderId);
    setTempDeliveryStatus(order.deliveryStatus);
    setTempPaymentStatus(order.paymentStatus);
  };

  const saveOrderStatus = async (orderId) => {
    try {
      await api.updateOrderStatus(orderId, tempDeliveryStatus, tempPaymentStatus);
      setUpdatingOrderId(null);
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const cancelEditOrder = () => {
    setUpdatingOrderId(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem' }}>Seller Portal</h2>
          <p style={{ color: 'hsl(var(--text-muted))' }}>
            Manage your store business: {dashboard?.businessName || 'Authorized Vendor'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={fetchDashboardData} style={{ padding: '8px 12px' }}>
            <RefreshCw size={16} />
          </button>
          <button className="btn btn-primary" onClick={handleOpenAddForm}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="tab-switcher" style={{ marginBottom: '24px' }}>
        <button
          className={`tab-btn ${activeSubTab === 'metrics' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('metrics')}
        >
          Overview & Metrics
        </button>
        <button
          className={`tab-btn ${activeSubTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('orders')}
        >
          Customer Orders
        </button>
        <button
          className={`tab-btn ${activeSubTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('inventory')}
        >
          Product Catalog
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <div className="qty-val" style={{ color: 'hsl(var(--text-muted))' }}>Updating panel...</div>
        </div>
      ) : (
        <>
          {activeSubTab === 'metrics' && (
            <div>
              {/* Metrics Grid */}
              <div className="metrics-grid">
                <div className="metric-card glass-panel">
                  <div className="metric-icon">
                    <IndianRupee size={24} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">Total Revenue</span>
                    <span className="metric-value">₹{dashboard?.totalRevenue || 0}</span>
                  </div>
                </div>

                <div className="metric-card glass-panel">
                  <div className="metric-icon" style={{ background: 'hsla(var(--accent) / 0.15)', color: 'hsl(var(--accent))' }}>
                    <ShoppingCart size={24} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">Total Orders</span>
                    <span className="metric-value">{dashboard?.totalOrdersPlaced || 0}</span>
                  </div>
                </div>

                <div className="metric-card glass-panel">
                  <div className="metric-icon" style={{ background: 'hsla(var(--success) / 0.15)', color: 'hsl(var(--success))' }}>
                    <Package size={24} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">Items Listed</span>
                    <span className="metric-value">{dashboard?.totalProducts || 0}</span>
                  </div>
                </div>

                <div className="metric-card glass-panel">
                  <div className="metric-icon" style={{ background: 'hsla(var(--warning) / 0.15)', color: 'hsl(var(--warning))' }}>
                    <Star size={24} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">Store Rating</span>
                    <span className="metric-value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {dashboard?.sellerRating || 5.0} <Star size={16} fill="hsl(var(--warning))" style={{ color: 'hsl(var(--warning))' }} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Selling Products List */}
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Top Products Catalog</h3>
              {(!dashboard?.topProducts || dashboard.topProducts.length === 0) ? (
                <p style={{ color: 'hsl(var(--text-muted))', fontStyle: 'italic' }}>No sales data available yet.</p>
              ) : (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock Status</th>
                        <th>SKU</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.topProducts.map((p) => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 600 }}>{p.productName}</td>
                          <td>{p.category}</td>
                          <td>₹{p.price}</td>
                          <td>
                            {p.stockQuantity > 0 ? (
                              <span className="badge badge-success">{p.stockQuantity} In Stock</span>
                            ) : (
                              <span className="badge badge-danger">Out of Stock</span>
                            )}
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{p.sku}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'orders' && (
            <div className="table-container">
              {orders.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                  No incoming orders received yet.
                </div>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items Purchased</th>
                      <th>Total</th>
                      <th>Delivery</th>
                      <th>Payment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => {
                      const isEditing = updatingOrderId === o.orderId;
                      return (
                        <tr key={o.orderId}>
                          <td style={{ fontWeight: 600 }}>#{o.orderId}</td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span>{o.customerName || 'Anonymous'}</span>
                              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>{o.shippingAddress}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.85rem' }}>
                              {o.items?.map((item) => (
                                <div key={item.orderItemId}>
                                  • {item.productName} (x{item.quantity})
                                </div>
                              ))}
                            </div>
                          </td>
                          <td style={{ fontWeight: 700 }}>₹{o.totalAmount}</td>
                          <td>
                            {isEditing ? (
                              <select
                                className="input-field"
                                value={tempDeliveryStatus}
                                onChange={(e) => setTempDeliveryStatus(e.target.value)}
                                style={{ padding: '4px 8px', background: 'hsl(var(--bg-surface-elevated))', fontSize: '0.85rem' }}
                              >
                                <option value="PENDING">Pending</option>
                                <option value="SHIPPED">Shipped</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                              </select>
                            ) : (
                              <span className={`badge ${o.deliveryStatus === 'DELIVERED' ? 'badge-success' : o.deliveryStatus === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>
                                {o.deliveryStatus}
                              </span>
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <select
                                className="input-field"
                                value={tempPaymentStatus}
                                onChange={(e) => setTempPaymentStatus(e.target.value)}
                                style={{ padding: '4px 8px', background: 'hsl(var(--bg-surface-elevated))', fontSize: '0.85rem' }}
                              >
                                <option value="PENDING">Pending</option>
                                <option value="PAID">Paid</option>
                                <option value="FAILED">Failed</option>
                                <option value="REFUNDED">Refunded</option>
                              </select>
                            ) : (
                              <span className={`badge ${o.paymentStatus === 'PAID' ? 'badge-success' : o.paymentStatus === 'FAILED' ? 'badge-danger' : 'badge-warning'}`}>
                                {o.paymentStatus}
                              </span>
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-ghost" onClick={() => saveOrderStatus(o.orderId)} style={{ padding: '4px 8px', color: 'hsl(var(--success))' }}>
                                  <Save size={16} />
                                </button>
                                <button className="btn btn-ghost" onClick={cancelEditOrder} style={{ padding: '4px 8px', color: 'hsl(var(--danger))' }}>
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <button className="btn btn-secondary" onClick={() => startEditOrder(o)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                                Edit Status
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeSubTab === 'inventory' && (
            <div className="table-container">
              {(!dashboard?.topProducts || dashboard.topProducts.length === 0) ? (
                <div style={{ padding: '60px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                  No products listed yet. Create one!
                </div>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>SKU</th>
                      <th>Price</th>
                      <th>Stock Qty</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.topProducts.map((p) => {
                      const img = p.productImages?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';
                      return (
                        <tr key={p.id}>
                          <td>
                            <img src={img} alt={p.productName} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />
                          </td>
                          <td style={{ fontWeight: 600 }}>{p.productName}</td>
                          <td>{p.category}</td>
                          <td style={{ fontFamily: 'monospace' }}>{p.sku}</td>
                          <td style={{ fontWeight: 700 }}>
                            ₹{p.price}
                            {p.discountPrice && p.discountPrice < p.price && (
                              <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'hsl(var(--text-muted))', marginLeft: '6px' }}>
                                ₹{p.discountPrice}
                              </span>
                            )}
                          </td>
                          <td>
                            {p.stockQuantity === 0 ? (
                              <span className="badge badge-danger">Out of Stock</span>
                            ) : p.stockQuantity < 5 ? (
                              <span className="badge badge-warning">{p.stockQuantity} Low Stock</span>
                            ) : (
                              <span className="badge badge-success">{p.stockQuantity} In Stock</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button className="btn btn-secondary" onClick={() => handleOpenEditForm(p)} style={{ padding: '6px' }} title="Edit Product">
                                <Edit size={14} />
                              </button>
                              <button className="btn btn-danger" onClick={() => handleDeleteProduct(p.id)} style={{ padding: '6px' }} title="Delete Product">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {/* Product Form Modal (Add / Edit) */}
      {isFormOpen && (
        <div className="modal-overlay open" onClick={() => setIsFormOpen(false)}>
          <div
            className="modal-content glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '650px', padding: '30px' }}
          >
            <button className="modal-close" onClick={() => setIsFormOpen(false)}>
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>
              {editingProduct ? 'Update Product Details' : 'List New Product'}
            </h3>

            <form onSubmit={handleProductSubmit} style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '4px' }}>
              <div className="input-group">
                <label className="input-label">Product Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Premium Noise Cancelling Headphones"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Tell customers what makes this product unique..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ resize: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div className="form-grid-2">
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select
                    className="input-field"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ background: 'hsl(var(--bg-surface-elevated))' }}
                  >
                    <option value="Sarees">Sarees</option>
                    <option value="Salwar Kameez">Salwar Kameez</option>
                    <option value="Lehengas">Lehengas</option>
                    <option value="Indo Western">Indo Western</option>
                    <option value="Men">Men</option>
                    <option value="Jewellery">Jewellery</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Brand</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Sony, Nike"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    placeholder="299.99"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Discount Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    placeholder="e.g. 249.99"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Stock Quantity</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="50"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Product Image URLs (Comma Separated)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="https://image-url-1.jpg, https://image-url-2.jpg"
                  value={formData.productImages}
                  onChange={(e) => setFormData({ ...formData, productImages: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Specifications (Format: Key: Value, Key: Value)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Color: Blue, Warranty: 2 Years"
                  value={formData.specificationsText}
                  onChange={(e) => setFormData({ ...formData, specificationsText: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Delivery Policy Info</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Dispatched in 24 hours. Standard 3-5 days delivery."
                  value={formData.deliveryInfo}
                  onChange={(e) => setFormData({ ...formData, deliveryInfo: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                {editingProduct ? 'Update Product Listing' : 'Publish Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
