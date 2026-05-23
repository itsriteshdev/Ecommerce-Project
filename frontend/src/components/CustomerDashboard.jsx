import React, { useEffect, useState } from 'react';
import { User, ShoppingBag, Heart, Save, RefreshCw, ShieldAlert, ShoppingCart, Trash2 } from 'lucide-react';
import { api } from '../api';
import OrderHistory from './OrderHistory';

export default function CustomerDashboard({ onAddToCart }) {
  const [activeSubTab, setActiveSubTab] = useState('profile'); // 'profile' | 'orders' | 'wishlist'
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Profile data state
  const [profile, setProfile] = useState({
    fullName: '',
    phoneNumber: '',
    gender: 'MALE',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Wishlist state
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  const fetchData = async () => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      if (activeSubTab === 'profile') {
        const profileRes = await api.getProfile();
        if (profileRes) {
          setProfile({
            fullName: profileRes.fullName || '',
            phoneNumber: profileRes.phoneNumber || '',
            gender: profileRes.gender || 'MALE',
            address: profileRes.address || '',
            city: profileRes.city || '',
            state: profileRes.state || '',
            pincode: profileRes.pincode || ''
          });
        }
      } else if (activeSubTab === 'wishlist') {
        setWishlistLoading(true);
        const wishlistRes = await api.getWishlist();
        setWishlist(wishlistRes || []);
      }
    } catch (err) {
      console.error("Failed to load customer dashboard data:", err);
      setErrorMsg(err.message || 'Failed to retrieve details');
    } finally {
      setLoading(false);
      setWishlistLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);
    try {
      const updated = await api.updateProfile(profile);
      if (updated) {
        setProfile({
          fullName: updated.fullName || '',
          phoneNumber: updated.phoneNumber || '',
          gender: updated.gender || 'MALE',
          address: updated.address || '',
          city: updated.city || '',
          state: updated.state || '',
          pincode: updated.pincode || ''
        });
      }
      setSuccessMsg('Your profile has been updated successfully.');
      setIsEditingProfile(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await api.removeFromWishlist(productId);
      setWishlist(prev => prev.filter(item => item.id !== productId));
      setSuccessMsg('Product removed from wishlist.');
    } catch (err) {
      alert(err.message || 'Failed to remove product from wishlist');
    }
  };

  const handleWishlistAddToCart = async (productId) => {
    try {
      if (onAddToCart) {
        await onAddToCart(productId, 1);
        await api.removeFromWishlist(productId);
        setWishlist(prev => prev.filter(item => item.id !== productId));
        alert('Product added to cart!');
      }
    } catch (err) {
      alert(err.message || 'Failed to add product to cart');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem' }}>My Account</h2>
          <p style={{ color: 'hsl(var(--text-muted))' }}>
            Manage your personal profile, track shopping orders, and view wishlist items.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={fetchData} style={{ padding: '8px 12px' }}>
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="tab-switcher" style={{ marginBottom: '24px' }}>
        <button
          className={`tab-btn ${activeSubTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('profile')}
        >
          My Profile
        </button>
        <button
          className={`tab-btn ${activeSubTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('orders')}
        >
          Order History
        </button>
        <button
          className={`tab-btn ${activeSubTab === 'wishlist' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('wishlist')}
        >
          My Wishlist ({wishlist.length})
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="toast-msg toast-success" style={{ borderRadius: '8px', marginBottom: '20px' }}>
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="toast-msg toast-danger" style={{ borderRadius: '8px', marginBottom: '20px' }}>
          <ShieldAlert size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading && activeSubTab !== 'wishlist' ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <div className="qty-val" style={{ color: 'hsl(var(--text-muted))' }}>Loading account info...</div>
        </div>
      ) : (
        <>
          {activeSubTab === 'profile' && (
            <div className="glass-panel" style={{ padding: '30px', maxWidth: '800px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Contact Details & Address</h3>
                {!isEditingProfile ? (
                  <button className="btn btn-primary" onClick={() => setIsEditingProfile(true)}>
                    Edit Profile
                  </button>
                ) : (
                  <button className="btn btn-secondary" onClick={() => setIsEditingProfile(false)}>
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleProfileSubmit}>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    disabled={!isEditingProfile}
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <div className="input-group">
                    <label className="input-label">Phone Number</label>
                    <input
                      type="text"
                      className="input-field"
                      value={profile.phoneNumber}
                      onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                      disabled={!isEditingProfile}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Gender</label>
                    <select
                      className="input-field"
                      value={profile.gender}
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                      disabled={!isEditingProfile}
                      style={{ background: 'hsl(var(--bg-surface-elevated))' }}
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Address</label>
                  <input
                    type="text"
                    className="input-field"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    disabled={!isEditingProfile}
                    placeholder="Street, Building, Apt/Suite"
                  />
                </div>

                <div className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div className="input-group">
                    <label className="input-label">City</label>
                    <input
                      type="text"
                      className="input-field"
                      value={profile.city}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      disabled={!isEditingProfile}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">State</label>
                    <input
                      type="text"
                      className="input-field"
                      value={profile.state}
                      onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                      disabled={!isEditingProfile}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Pincode</label>
                    <input
                      type="text"
                      className="input-field"
                      value={profile.pincode}
                      onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                      disabled={!isEditingProfile}
                    />
                  </div>
                </div>

                {isEditingProfile && (
                  <button type="submit" className="btn btn-primary" style={{ marginTop: '20px', width: '100%' }}>
                    <Save size={16} /> Save Profile Changes
                  </button>
                )}
              </form>
            </div>
          )}

          {activeSubTab === 'orders' && (
            <div>
              <OrderHistory />
            </div>
          )}

          {activeSubTab === 'wishlist' && (
            <div>
              {wishlistLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                  <div className="qty-val" style={{ color: 'hsl(var(--text-muted))' }}>Retrieving wishlist items...</div>
                </div>
              ) : wishlist.length === 0 ? (
                <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                  <Heart size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                  <h3>Your wishlist is empty</h3>
                  <p>Browse products and click the heart icon to save products here!</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))', gap: '30px' }}>
                  {wishlist.map((prod) => {
                    const img = prod.productImages?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=280';
                    return (
                      <div key={prod.id} className="product-card glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div className="product-image-container" style={{ aspectRatio: '1.2' }}>
                          <img src={img} alt={prod.productName} className="product-card-img" />
                          <button
                            onClick={() => handleRemoveFromWishlist(prod.id)}
                            style={{
                              position: 'absolute',
                              top: '15px',
                              right: '15px',
                              background: 'hsl(var(--bg-white))',
                              border: 'none',
                              borderRadius: '50%',
                              width: '36px',
                              height: '36px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: 'hsl(var(--danger))',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                            }}
                            title="Remove from Wishlist"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="product-card-body" style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                          <span className="product-card-brand">{prod.brand}</span>
                          <h4 className="product-card-title" style={{ fontSize: '1.25rem', margin: '4px 0 10px 0' }}>{prod.productName}</h4>
                          <p className="product-card-desc" style={{ fontSize: '0.8rem', height: '3.2em', overflow: 'hidden' }}>{prod.description}</p>
                          <div className="product-card-footer" style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', width: '100%' }}>
                            <div className="product-price-wrapper">
                              <span className="product-price">₹{prod.price}</span>
                            </div>
                            <button className="btn btn-primary" onClick={() => handleWishlistAddToCart(prod.id)} style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                              <ShoppingCart size={14} /> Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
