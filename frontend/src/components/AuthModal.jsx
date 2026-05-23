import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldAlert } from 'lucide-react';
import { api } from '../api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register_customer' | 'register_seller'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Customer register states
  const [customerData, setCustomerData] = useState({
    fullName: '',
    phoneNumber: '',
    gender: 'MALE',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Seller register states
  const [sellerData, setSellerData] = useState({
    sellerName: '',
    businessName: '',
    gstNumber: '',
    phoneNumber: '',
    warehouseAddress: '',
    bankDetails: ''
  });

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.login(email, password);
      const normalizedRole = response.role ? response.role.replace('ROLE_', '') : '';
      const normalizedResponse = { ...response, role: normalizedRole };
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(normalizedResponse));
      onAuthSuccess(normalizedResponse);
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterCustomer = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        email,
        password,
        ...customerData
      };
      const response = await api.registerCustomer(payload);
      // Auto login after registration
      const loginRes = await api.login(email, password);
      const normalizedRole = loginRes.role ? loginRes.role.replace('ROLE_', '') : '';
      const normalizedResponse = { ...loginRes, role: normalizedRole };
      localStorage.setItem('token', loginRes.token);
      localStorage.setItem('user', JSON.stringify(normalizedResponse));
      onAuthSuccess(normalizedResponse);
      onClose();
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSeller = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        email,
        password,
        ...sellerData
      };
      const response = await api.registerSeller(payload);
      // Auto login after registration
      const loginRes = await api.login(email, password);
      const normalizedRole = loginRes.role ? loginRes.role.replace('ROLE_', '') : '';
      const normalizedResponse = { ...loginRes, role: normalizedRole };
      localStorage.setItem('token', loginRes.token);
      localStorage.setItem('user', JSON.stringify(normalizedResponse));
      onAuthSuccess(normalizedResponse);
      onClose();
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="tab-switcher">
          <button
            className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setError(''); }}
          >
            Sign In
          </button>
          <button
            className={`tab-btn ${activeTab === 'register_customer' ? 'active' : ''}`}
            onClick={() => { setActiveTab('register_customer'); setError(''); }}
          >
            Join as Customer
          </button>
          <button
            className={`tab-btn ${activeTab === 'register_seller' ? 'active' : ''}`}
            onClick={() => { setActiveTab('register_seller'); setError(''); }}
          >
            Become a Seller
          </button>
        </div>

        {error && (
          <div className="toast-msg toast-danger" style={{ padding: '10px 14px', borderRadius: '10px' }}>
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        {activeTab === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
                <input
                  type="email"
                  className="input-field"
                  placeholder="name@example.com"
                  style={{ paddingLeft: '40px', width: '100%' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  style={{ paddingLeft: '40px', width: '100%' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        )}

        {activeTab === 'register_customer' && (
          <form onSubmit={handleRegisterCustomer} style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '4px' }}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="John Doe"
                value={customerData.fullName}
                onChange={(e) => setCustomerData({ ...customerData, fullName: e.target.value })}
                required
              />
            </div>

            <div className="form-grid-2">
              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="10-digit number"
                  value={customerData.phoneNumber}
                  onChange={(e) => setCustomerData({ ...customerData, phoneNumber: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Gender</label>
                <select
                  className="input-field"
                  value={customerData.gender}
                  onChange={(e) => setCustomerData({ ...customerData, gender: e.target.value })}
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
                placeholder="Street address, Apt/Suite"
                value={customerData.address}
                onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
              />
            </div>

            <div className="form-grid-2">
              <div className="input-group">
                <label className="input-label">City</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="City"
                  value={customerData.city}
                  onChange={(e) => setCustomerData({ ...customerData, city: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="input-label">State</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="State"
                  value={customerData.state}
                  onChange={(e) => setCustomerData({ ...customerData, state: e.target.value })}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Pincode</label>
              <input
                type="text"
                className="input-field"
                placeholder="Pincode"
                value={customerData.pincode}
                onChange={(e) => setCustomerData({ ...customerData, pincode: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
        )}

        {activeTab === 'register_seller' && (
          <form onSubmit={handleRegisterSeller} style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '4px' }}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="vendor@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-grid-2">
              <div className="input-group">
                <label className="input-label">Seller Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Contact person"
                  value={sellerData.sellerName}
                  onChange={(e) => setSellerData({ ...sellerData, sellerName: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label">Business Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Brand / Company"
                  value={sellerData.businessName}
                  onChange={(e) => setSellerData({ ...sellerData, businessName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="input-group">
                <label className="input-label">GST Number</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="GSTIN"
                  value={sellerData.gstNumber}
                  onChange={(e) => setSellerData({ ...sellerData, gstNumber: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Business contact"
                  value={sellerData.phoneNumber}
                  onChange={(e) => setSellerData({ ...sellerData, phoneNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Warehouse Address</label>
              <input
                type="text"
                className="input-field"
                placeholder="Full dispatch address"
                value={sellerData.warehouseAddress}
                onChange={(e) => setSellerData({ ...sellerData, warehouseAddress: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Bank Details</label>
              <input
                type="text"
                className="input-field"
                placeholder="Acc No, IFSC, Bank Name"
                value={sellerData.bankDetails}
                onChange={(e) => setSellerData({ ...sellerData, bankDetails: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Creating Seller Account...' : 'Register as Seller'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
