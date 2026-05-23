import React, { useEffect, useState } from 'react';
import { ShieldCheck, Users, Ticket, Trash2, Check, X, RefreshCw, Layers, ShieldAlert, Percent, Plus } from 'lucide-react';
import { api } from '../api';

export default function AdminDashboard() {
  const [activeSubTab, setActiveSubTab] = useState('metrics'); // 'metrics' | 'sellers' | 'coupons'
  const [loading, setLoading] = useState(false);
  
  // Data States
  const [sellers, setSellers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  
  // Coupon Form States
  const [isCouponFormOpen, setIsCouponFormOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'metrics' || activeSubTab === 'sellers') {
        const sellersRes = await api.getAllSellers();
        setSellers(sellersRes || []);
      }
      if (activeSubTab === 'metrics' || activeSubTab === 'coupons') {
        const couponsRes = await api.getAllCoupons();
        setCoupons(couponsRes || []);
      }
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySeller = async (sellerId, status) => {
    if (!window.confirm(`Are you sure you want to set the status of this seller to ${status}?`)) return;
    try {
      await api.verifySeller(sellerId, status);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update verification status');
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Delete this coupon permanently?')) return;
    try {
      await api.deleteCoupon(couponId);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete coupon');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!couponCode.trim()) {
      setFormError('Coupon code is required');
      return;
    }
    if (!discountPercentage || Number(discountPercentage) <= 0 || Number(discountPercentage) > 100) {
      setFormError('Discount percentage must be between 1 and 100');
      return;
    }
    if (!expiryDate) {
      setFormError('Expiry date is required');
      return;
    }

    try {
      const payload = {
        code: couponCode.toUpperCase().trim(),
        discountPercentage: Number(discountPercentage),
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        expiryDate: new Date(expiryDate).toISOString(), // Format to ISO LocalDateTime string
        active: true
      };

      await api.createCoupon(payload);
      setIsCouponFormOpen(false);
      
      // Clear form fields
      setCouponCode('');
      setDiscountPercentage('');
      setMaxDiscountAmount('');
      setExpiryDate('');
      
      await fetchData();
    } catch (err) {
      setFormError(err.message || 'Failed to create coupon');
    }
  };

  // Helper computations
  const totalSellers = sellers.length;
  const pendingSellersCount = sellers.filter(s => s.verificationStatus === 'PENDING').length;
  const activeCouponsCount = coupons.length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem' }}>Admin Control Panel</h2>
          <p style={{ color: 'hsl(var(--text-muted))' }}>
            Verify vendors, manage discount offers, and monitor site activities.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={fetchData} style={{ padding: '8px 12px' }}>
            <RefreshCw size={16} />
          </button>
          {activeSubTab === 'coupons' && (
            <button className="btn btn-primary" onClick={() => setIsCouponFormOpen(true)}>
              <Plus size={16} /> Create Coupon
            </button>
          )}
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
          className={`tab-btn ${activeSubTab === 'sellers' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('sellers')}
        >
          Sellers ({sellers.length})
        </button>
        <button
          className={`tab-btn ${activeSubTab === 'coupons' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('coupons')}
        >
          Coupons ({coupons.length})
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <div className="qty-val" style={{ color: 'hsl(var(--text-muted))' }}>Updating administration panel...</div>
        </div>
      ) : (
        <>
          {activeSubTab === 'metrics' && (
            <div>
              {/* Metrics Grid */}
              <div className="metrics-grid">
                <div className="metric-card glass-panel">
                  <div className="metric-icon" style={{ background: 'hsla(var(--success) / 0.15)', color: 'hsl(var(--success))' }}>
                    <Users size={24} />
                  </div>
                  <div className="metric-info" style={{ marginTop: '10px' }}>
                    <span className="metric-label">Total Sellers</span>
                    <span className="metric-value">{totalSellers}</span>
                  </div>
                </div>

                <div className="metric-card glass-panel">
                  <div className="metric-icon" style={{ background: 'hsla(var(--warning) / 0.15)', color: 'hsl(var(--warning))' }}>
                    <ShieldAlert size={24} />
                  </div>
                  <div className="metric-info" style={{ marginTop: '10px' }}>
                    <span className="metric-label">Pending Verifications</span>
                    <span className="metric-value">{pendingSellersCount}</span>
                  </div>
                </div>

                <div className="metric-card glass-panel">
                  <div className="metric-icon" style={{ background: 'hsla(var(--accent) / 0.15)', color: 'hsl(var(--accent))' }}>
                    <Ticket size={24} />
                  </div>
                  <div className="metric-info" style={{ marginTop: '10px' }}>
                    <span className="metric-label">Active Coupons</span>
                    <span className="metric-value">{activeCouponsCount}</span>
                  </div>
                </div>
              </div>

              {/* Pending Verifications Strip */}
              {pendingSellersCount > 0 && (
                <div className="toast-msg toast-danger" style={{ borderRadius: '8px', marginBottom: '30px' }}>
                  <ShieldAlert size={18} />
                  <span>You have <strong>{pendingSellersCount}</strong> seller request(s) waiting for verification approval.</span>
                  <button 
                    onClick={() => setActiveSubTab('sellers')}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    View Requests
                  </button>
                </div>
              )}

              {/* Quick Table of Pending Sellers */}
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Pending Approvals</h3>
              {sellers.filter(s => s.verificationStatus === 'PENDING').length === 0 ? (
                <p style={{ color: 'hsl(var(--text-muted))', fontStyle: 'italic' }}>No pending seller verification requests.</p>
              ) : (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Business Name</th>
                        <th>Seller Name</th>
                        <th>GST Number</th>
                        <th>Email / Contact</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sellers.filter(s => s.verificationStatus === 'PENDING').map((s) => (
                        <tr key={s.sellerId}>
                          <td style={{ fontWeight: 600 }}>{s.businessName}</td>
                          <td>{s.sellerName}</td>
                          <td style={{ fontFamily: 'monospace' }}>{s.gstNumber}</td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span>{s.email}</span>
                              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>{s.phoneNumber}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button className="btn btn-ghost" onClick={() => handleVerifySeller(s.sellerId, 'APPROVED')} style={{ color: 'hsl(var(--success))', border: '1px solid #c8e6c9', padding: '6px' }} title="Approve">
                                <Check size={16} /> Approve
                              </button>
                              <button className="btn btn-ghost" onClick={() => handleVerifySeller(s.sellerId, 'REJECTED')} style={{ color: 'hsl(var(--danger))', border: '1px solid #ffcdd2', padding: '6px' }} title="Reject">
                                <X size={16} /> Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'sellers' && (
            <div className="table-container">
              {sellers.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                  No sellers registered yet on this platform.
                </div>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Seller ID</th>
                      <th>Business Profile</th>
                      <th>GST Number</th>
                      <th>Revenue</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellers.map((s) => (
                      <tr key={s.sellerId}>
                        <td style={{ fontWeight: 600 }}>#{s.sellerId}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600 }}>{s.businessName}</span>
                            <span style={{ fontSize: '0.85rem' }}>{s.sellerName} • {s.email}</span>
                            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>{s.warehouseAddress}</span>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{s.gstNumber}</td>
                        <td style={{ fontWeight: 700 }}>₹{s.revenue || 0}</td>
                        <td>
                          <span className={`badge ${s.verificationStatus === 'APPROVED' ? 'badge-success' : s.verificationStatus === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                            {s.verificationStatus}
                          </span>
                        </td>
                        <td>
                          {s.verificationStatus === 'PENDING' ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button className="btn btn-ghost" onClick={() => handleVerifySeller(s.sellerId, 'APPROVED')} style={{ color: 'hsl(var(--success))', border: '1px solid #c8e6c9', padding: '4px 8px', fontSize: '0.8rem' }} title="Approve">
                                Approve
                              </button>
                              <button className="btn btn-ghost" onClick={() => handleVerifySeller(s.sellerId, 'REJECTED')} style={{ color: 'hsl(var(--danger))', border: '1px solid #ffcdd2', padding: '4px 8px', fontSize: '0.8rem' }} title="Reject">
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Verified</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeSubTab === 'coupons' && (
            <div>
              <div className="table-container">
                {coupons.length === 0 ? (
                  <div style={{ padding: '60px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                    No active discount coupons found. Create one to get started!
                  </div>
                ) : (
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Coupon Code</th>
                        <th>Discount Value</th>
                        <th>Max Cap Amount</th>
                        <th>Expiry Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((c) => {
                        const isExpired = new Date(c.expiryDate) < new Date();
                        const expiryStr = c.expiryDate ? new Date(c.expiryDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'N/A';
                        return (
                          <tr key={c.id}>
                            <td style={{ fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.05em' }}>{c.code}</td>
                            <td style={{ fontWeight: 600 }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                {c.discountPercentage}% <Percent size={14} />
                              </span>
                            </td>
                            <td>{c.maxDiscountAmount ? `₹${c.maxDiscountAmount}` : 'No Limit'}</td>
                            <td>
                              <span style={{ color: isExpired ? 'hsl(var(--danger))' : 'inherit' }}>
                                {expiryStr} {isExpired && '(Expired)'}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${(!isExpired && c.active) ? 'badge-success' : 'badge-danger'}`}>
                                {(!isExpired && c.active) ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <button className="btn btn-danger" onClick={() => handleDeleteCoupon(c.id)} style={{ padding: '6px' }} title="Delete Coupon">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Coupon Modal Form */}
      {isCouponFormOpen && (
        <div className="modal-overlay open" onClick={() => setIsCouponFormOpen(false)}>
          <div
            className="modal-content glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '500px', padding: '30px' }}
          >
            <button className="modal-close" onClick={() => setIsCouponFormOpen(false)}>
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Create New Promo Code</h3>

            {formError && (
              <div className="toast-msg toast-danger" style={{ padding: '10px 14px', borderRadius: '10px', marginBottom: '15px' }}>
                <ShieldAlert size={18} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCoupon}>
              <div className="input-group">
                <label className="input-label">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. SUMMER50"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="input-group">
                  <label className="input-label">Discount (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="input-field"
                    placeholder="e.g. 15"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Max Cap Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input-field"
                    placeholder="e.g. 50 (Optional)"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Expiry Date</label>
                <input
                  type="datetime-local"
                  className="input-field"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Generate Coupon
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
