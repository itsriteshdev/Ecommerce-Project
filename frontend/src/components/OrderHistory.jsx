import React, { useEffect, useState } from 'react';
import { ShieldCheck, Truck, Clock, RefreshCw, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../api';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomerOrders();
      setOrders(res.content || res || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setActionLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      await api.cancelOrder(orderId);
      // Refresh list
      await fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to cancel order');
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const getStatusBadge = (status, type) => {
    const s = (status || '').toUpperCase();
    if (type === 'delivery') {
      switch (s) {
        case 'DELIVERED':
          return <span className="badge badge-success">Delivered</span>;
        case 'SHIPPED':
          return <span className="badge badge-info">Shipped</span>;
        case 'PENDING':
          return <span className="badge badge-warning">Pending</span>;
        case 'CANCELLED':
          return <span className="badge badge-danger">Cancelled</span>;
        default:
          return <span className="badge">{status}</span>;
      }
    } else {
      // Payment status
      switch (s) {
        case 'PAID':
          return <span className="badge badge-success">Paid</span>;
        case 'PENDING':
          return <span className="badge badge-warning">Unpaid</span>;
        case 'FAILED':
          return <span className="badge badge-danger">Failed</span>;
        case 'REFUNDED':
          return <span className="badge badge-info">Refunded</span>;
        default:
          return <span className="badge">{status}</span>;
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.75rem' }}>Your Orders</h2>
        <button className="btn btn-secondary" onClick={fetchOrders} style={{ padding: '8px 12px' }}>
          <RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <div className="qty-val" style={{ color: 'hsl(var(--text-muted))' }}>Retrieving your purchases...</div>
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-panel" style={{ padding: '80px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>No orders placed yet</h3>
          <p style={{ color: 'hsl(var(--text-muted))' }}>You haven't ordered any premium products yet. Browse catalog to start!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => {
            const isExpanded = !!expandedOrders[order.orderId];
            const dateStr = order.orderDate ? new Date(order.orderDate).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'Recent';
            return (
              <div key={order.orderId} className="glass-panel" style={{ overflow: 'hidden' }}>
                <div
                  onClick={() => toggleExpand(order.orderId)}
                  style={{
                    padding: '24px 30px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '20px',
                    background: isExpanded ? 'hsla(var(--bg-surface-elevated)/0.2)' : 'transparent',
                    transition: 'background var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>
                      ORDER #{order.orderId}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>
                      {dateStr}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    {getStatusBadge(order.deliveryStatus, 'delivery')}
                    {getStatusBadge(order.paymentStatus, 'payment')}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Total Amount</span>
                      <span style={{ fontWeight: 800, fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>
                        ₹{order.totalAmount}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: '30px', borderTop: '1px solid hsla(var(--border-glass))' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
                      {/* Items Info */}
                      <div>
                        <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--text-muted))', marginBottom: '16px' }}>
                          Items Ordered ({order.items?.length || 0})
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {order.items?.map((item) => (
                            <div key={item.orderItemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsla(var(--border-glass))', paddingBottom: '12px' }}>
                              <div>
                                <h5 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{item.productName}</h5>
                                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                                  SKU: {item.productSku || 'N/A'} • Qty: {item.quantity}
                                </span>
                              </div>
                              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                                ₹{item.price} <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 'normal' }}>each</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery and Address */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--text-muted))', marginBottom: '8px' }}>
                            Delivery Address
                          </h4>
                          <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))', whiteSpace: 'pre-wrap' }}>
                            {order.shippingAddress}
                          </p>
                        </div>

                        <div className="form-grid-2">
                          <div>
                            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--text-muted))', marginBottom: '4px' }}>
                              Payment Method
                            </h4>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                              {order.paymentMethod}
                            </span>
                          </div>
                          {order.trackingId && (
                            <div>
                              <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--text-muted))', marginBottom: '4px' }}>
                                Tracking ID
                              </h4>
                              <span className="badge badge-info" style={{ fontSize: '0.8rem' }}>
                                {order.trackingId}
                              </span>
                            </div>
                          )}
                        </div>

                        {order.deliveryStatus === 'PENDING' && (
                          <button
                            className="btn btn-danger"
                            onClick={() => handleCancelOrder(order.orderId)}
                            disabled={actionLoading[order.orderId]}
                            style={{ alignSelf: 'flex-start', marginTop: '10px' }}
                          >
                            <XCircle size={16} />
                            {actionLoading[order.orderId] ? 'Cancelling...' : 'Cancel Order'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
