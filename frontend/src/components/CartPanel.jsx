import React, { useState } from 'react';
import { 
  X, Trash2, Tag, ShoppingBag, CreditCard, Home, Check, 
  MapPin, Heart, ShieldCheck, HelpCircle, Truck, RefreshCcw, 
  Award, Lock, RotateCcw
} from 'lucide-react';
import { api } from '../api';

export default function CartPanel({
  isOpen,
  onClose,
  cart,
  user,
  onUpdateQty,
  onRemoveItem,
  onCheckoutSuccess
}) {
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(false); // false: view cart, true: fill checkout details
  const [error, setError] = useState('');

  // Local size selection states mapped per cart item
  const [itemSizes, setItemSizes] = useState({});

  // Pincode checking state inside Cart
  const [cartPincode, setCartPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(''); // '', 'checking', 'success', 'error'
  const [pincodeMsg, setPincodeMsg] = useState('');

  if (!isOpen) return null;

  const items = cart?.items || [];

  // Calculate pricing metrics for e-commerce checkout receipt (matching screenshot details)
  const orderValue = items.reduce((acc, item) => {
    const orig = item.originalPrice || item.price;
    return acc + (orig * item.quantity);
  }, 0);

  const productDiscount = items.reduce((acc, item) => {
    const orig = item.originalPrice || item.price;
    const final = item.price;
    const discount = orig > final ? orig - final : 0;
    return acc + (discount * item.quantity);
  }, 0);

  // Simulated GST Reduction benefit (6.25% of order value)
  const gstReduction = parseFloat((orderValue * 0.0625).toFixed(2));

  // Coupon discount amount
  const couponDiscountAmount = (orderValue - productDiscount) * (discountPercent / 100);

  // Grand Total
  const grandTotal = (orderValue - productDiscount) - couponDiscountAmount;

  // Overall Savings
  const overallSavings = productDiscount + gstReduction + couponDiscountAmount;

  const handleApplyCoupon = () => {
    setError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'WELCOME10') {
      setDiscountPercent(10);
      setCouponApplied(true);
    } else if (code === 'VELOCE20' || code === 'JAYPORE20') {
      setDiscountPercent(20);
      setCouponApplied(true);
    } else {
      setDiscountPercent(0);
      setCouponApplied(true);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setDiscountPercent(0);
    setCouponApplied(false);
  };

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (!cartPincode || cartPincode.length !== 6 || isNaN(cartPincode)) {
      setPincodeStatus('error');
      setPincodeMsg('Enter 6-digit Pincode.');
      return;
    }
    setPincodeStatus('checking');
    setTimeout(() => {
      setPincodeStatus('success');
      setPincodeMsg('Free delivery by 3rd June');
    }, 700);
  };

  const handleMoveToWishlist = async (item) => {
    if (!user) {
      alert("Please login to save items to your wishlist.");
      return;
    }
    try {
      await api.addToWishlist(item.productId);
      await onRemoveItem(item.cartItemId || item.id);
      alert("Ensemble moved to wishlist!");
    } catch (e) {
      alert("Failed to move item to wishlist. Item may already be saved.");
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setError('Shipping address is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.placeOrder(shippingAddress, paymentMethod, couponApplied ? couponCode : null);
      onCheckoutSuccess();
      setCheckoutStep(false);
      setShippingAddress('');
      setCouponCode('');
      setDiscountPercent(0);
      setCouponApplied(false);
      onClose();
    } catch (err) {
      setError(err.message || 'Checkout failed. Please check coupon or item stock.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-overlay" onClick={onClose}>
      <div className="checkout-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="checkout-modal-header">
          <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px', color: '#1a1a1a', fontWeight: '500' }}>
            <ShoppingBag size={20} style={{ color: '#a34e2b' }} />
            {checkoutStep ? 'Delivery Details & Checkout' : 'Shopping Bag'}
          </h3>
          <button className="modal-close" onClick={onClose} style={{ position: 'static' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="checkout-modal-body-scroll">
          {error && (
            <div className="toast-msg toast-danger" style={{ fontSize: '0.85rem', padding: '10px 14px', marginBottom: '20px' }}>
              <span>{error}</span>
            </div>
          )}

          {items.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', color: 'hsl(var(--text-muted))', padding: '80px 0' }}>
              <ShoppingBag size={48} style={{ marginBottom: '16px', strokeWidth: 1, color: '#a34e2b' }} />
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '8px' }}>Your Shopping Bag is empty</p>
              <button className="btn btn-secondary" onClick={onClose} style={{ padding: '8px 24px', marginTop: '16px' }}>Continue Shopping</button>
            </div>
          ) : (
            <div>
              <div className="checkout-two-columns">
                
                {/* LEFT COLUMN */}
                <div>
                  
                  {/* Pincode Checker Card */}
                  <div className="checkout-pincode-card">
                    <span className="checkout-pincode-label">
                      {pincodeStatus === 'success' ? (
                        <span style={{ color: '#3b5944', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Check size={16} /> Delivery availability checked: {pincodeMsg}
                        </span>
                      ) : (
                        'Enter pincode to check delivery date'
                      )}
                    </span>
                    
                    <form onSubmit={handleCheckPincode} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        placeholder="Pincode"
                        maxLength={6}
                        value={cartPincode}
                        onChange={(e) => setCartPincode(e.target.value.replace(/\D/g, ''))}
                        style={{ width: '120px', border: '1px solid #ccc', padding: '6px 12px', fontSize: '0.8rem', outline: 'none' }}
                      />
                      <button type="submit" className="checkout-pincode-btn-outline">
                        {pincodeStatus === 'checking' ? 'Checking...' : 'Enter Pincode'}
                      </button>
                    </form>
                  </div>

                  {checkoutStep ? (
                    /* STEP 2: Checkout shipping address */
                    <div className="checkout-bag-section" style={{ background: '#fff', padding: '30px', border: '1px solid #e5e0d8' }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: '20px', fontWeight: 400 }}>
                        Shipping & Payment
                      </h3>
                      
                      <div className="input-group" style={{ marginBottom: '20px' }}>
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                          <Home size={16} style={{ color: '#a34e2b' }} /> Full Shipping Address
                        </label>
                        <textarea
                          className="input-field"
                          rows={4}
                          placeholder="Street, Building, Apt, Landmark, Pincode"
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          style={{ resize: 'none', fontFamily: 'inherit', marginTop: '8px', border: '1px solid #ccc' }}
                          required
                        />
                      </div>

                      <div className="input-group">
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginBottom: '8px' }}>
                          <CreditCard size={16} style={{ color: '#a34e2b' }} /> Payment Options
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                          <label className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '4px', cursor: 'pointer', border: paymentMethod === 'COD' ? '1.5px solid #a34e2b' : '1px solid #e5e0d8', background: '#fff' }}>
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="COD"
                              checked={paymentMethod === 'COD'}
                              onChange={() => setPaymentMethod('COD')}
                              style={{ accentColor: '#a34e2b' }}
                            />
                            <div>
                              <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Cash on Delivery (COD)</div>
                              <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Pay in cash upon physical arrival.</div>
                            </div>
                          </label>

                          <label className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '4px', cursor: 'pointer', border: paymentMethod === 'CARD' ? '1.5px solid #a34e2b' : '1px solid #e5e0d8', background: '#fff' }}>
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="CARD"
                              checked={paymentMethod === 'CARD'}
                              onChange={() => setPaymentMethod('CARD')}
                              style={{ accentColor: '#a34e2b' }}
                            />
                            <div>
                              <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Credit / Debit Card</div>
                              <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Pay securely with Visa, MasterCard or RuPay.</div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* STEP 1: Shopping Bag item listing */
                    <div className="checkout-bag-section">
                      <h2 className="checkout-bag-title">
                        Shopping Bag ( {items.length} {items.length === 1 ? 'item' : 'items'} )
                      </h2>

                      {items.map((item) => {
                        const origPrice = item.originalPrice || item.price;
                        const currentItemPrice = item.price;
                        const hasDisc = origPrice > currentItemPrice;
                        const imgUrl = item.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150';
                        const itemDiscountPercent = hasDisc ? Math.round(((origPrice - currentItemPrice) / origPrice) * 100) : 0;
                        const itemSize = itemSizes[item.cartItemId] || '38';

                        return (
                          <div key={item.cartItemId} className="checkout-item-card">
                            {/* Image Left */}
                            <div className="checkout-item-img-wrapper">
                               <img src={imgUrl} alt={item.productName} />
                            </div>

                            {/* Details Right */}
                            <div className="checkout-item-info">
                              <div className="checkout-item-brand-row">
                                <span className="checkout-item-brand">
                                  {item.brand || 'Jaypore'}
                                </span>
                                <span className="checkout-item-delivery-status">
                                  <Truck size={14} style={{ color: '#a34e2b' }} /> Free delivery by 3rd June
                                </span>
                              </div>

                              <h4 className="checkout-item-title">
                                {item.productName}
                              </h4>

                              {/* Price tags details */}
                              <div className="checkout-item-price-row">
                                <span className="checkout-item-price-current">
                                  ₹{currentItemPrice.toLocaleString('en-IN')}
                                </span>
                                {hasDisc && (
                                  <>
                                    <span className="checkout-item-price-original">
                                      ₹{origPrice.toLocaleString('en-IN')}
                                    </span>
                                    <span className="checkout-item-price-discount">
                                      {itemDiscountPercent}% Off
                                    </span>
                                  </>
                                )}
                                <span className="checkout-item-gst-tag">
                                  Inclusive of GST benefit
                                </span>
                              </div>

                              {/* Dropdowns (Size & Qty) */}
                              <div className="checkout-item-variants">
                                <div className="checkout-dropdown-wrapper">
                                  <span className="checkout-dropdown-label">Size</span>
                                  <select 
                                    className="checkout-select-field"
                                    value={itemSize}
                                    onChange={(e) => setItemSizes({ ...itemSizes, [item.cartItemId]: e.target.value })}
                                  >
                                    <option value="36">36</option>
                                    <option value="38">38</option>
                                    <option value="40">40</option>
                                    <option value="42">42</option>
                                    <option value="44">44</option>
                                  </select>
                                </div>

                                <div className="checkout-dropdown-wrapper">
                                  <span className="checkout-dropdown-label">Qty</span>
                                  <select 
                                    className="checkout-select-field"
                                    value={item.quantity}
                                    onChange={(e) => onUpdateQty(item.cartItemId, parseInt(e.target.value))}
                                  >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(q => (
                                      <option key={q} value={q}>{q}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {/* Action links */}
                              <div className="checkout-item-actions-row">
                                <button 
                                  className="checkout-action-btn-link"
                                  onClick={() => onRemoveItem(item.cartItemId)}
                                >
                                  <Trash2 size={14} /> REMOVE
                                </button>
                                <button 
                                  className="checkout-action-btn-link"
                                  onClick={() => handleMoveToWishlist(item)}
                                >
                                  <Heart size={14} /> MOVE TO WISHLIST
                                </button>
                              </div>

                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>

                {/* RIGHT COLUMN */}
                <div>
                  {/* Order Summary receipt card */}
                  <div className="checkout-summary-card">
                    <h3 className="checkout-summary-title">
                      <span>Order Summary</span>
                      <span className="checkout-summary-item-count">
                        {items.length} {items.length === 1 ? 'item' : 'items'}
                      </span>
                    </h3>

                    <table className="checkout-summary-table">
                      <tbody>
                        <tr>
                          <td className="checkout-summary-label">Order Value</td>
                          <td className="checkout-summary-val">₹{orderValue.toLocaleString('en-IN')}.00</td>
                        </tr>
                        <tr>
                          <td className="checkout-summary-label">GST Rate Reduction</td>
                          <td className="checkout-summary-val">₹{gstReduction.toLocaleString('en-IN')}</td>
                        </tr>
                        {productDiscount > 0 && (
                          <tr>
                            <td className="checkout-summary-label">Product Discount</td>
                            <td className="checkout-summary-val" style={{ color: '#c0392b' }}>-₹{productDiscount.toLocaleString('en-IN')}.00</td>
                          </tr>
                        )}
                        {couponDiscountAmount > 0 && (
                          <tr>
                            <td className="checkout-summary-label">Coupon Discount</td>
                            <td className="checkout-summary-val" style={{ color: '#c0392b' }}>-₹{couponDiscountAmount.toFixed(2)}</td>
                          </tr>
                        )}
                        <tr>
                          <td className="checkout-summary-label">Shipping Charges</td>
                          <td className="checkout-summary-val" style={{ color: '#3b5944' }}>
                            <span style={{ textDecoration: 'line-through', color: 'hsl(var(--text-muted))', marginRight: '6px', fontSize: '0.85rem' }}>INR 100</span>
                            FREE
                          </td>
                        </tr>
                        
                        <tr className="checkout-summary-total-row">
                          <td className="checkout-grand-total-label">Grand Total</td>
                          <td className="checkout-grand-total-val">₹{grandTotal.toLocaleString('en-IN')}.00</td>
                        </tr>
                      </tbody>
                    </table>

                    <div style={{ marginBottom: '20px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#3b5944', fontWeight: 'bold' }}>
                        Overall savings ₹{overallSavings.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {!checkoutStep ? (
                      <button 
                        className="checkout-btn-place-order"
                        onClick={() => setCheckoutStep(true)}
                      >
                        Place Order
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => setCheckoutStep(false)}
                          style={{ flex: 1, borderRadius: '2px', height: '48px', textTransform: 'uppercase' }}
                          disabled={loading}
                        >
                          Back
                        </button>
                        <button 
                          className="checkout-btn-place-order"
                          style={{ flex: 2 }}
                          onClick={handleCheckout}
                          disabled={loading}
                        >
                          {loading ? 'Processing...' : 'Confirm Order'}
                        </button>
                      </div>
                    )}

                    <div className="checkout-secure-badge">
                      <ShieldCheck size={16} style={{ color: '#3b5944' }} />
                      <span>100% Secure payments</span>
                    </div>
                  </div>

                  {/* Apply Coupon code card */}
                  <div className="checkout-coupon-card">
                    <h4 className="checkout-coupon-title">
                      <Tag size={16} style={{ color: '#a34e2b' }} /> Apply Coupons
                    </h4>

                    {!couponApplied ? (
                      <div className="checkout-coupon-input-wrapper">
                        <input 
                          type="text" 
                          className="checkout-coupon-field"
                          placeholder="Enter Coupon Code (e.g. JAYPORE20)"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                        />
                        <button 
                          className="checkout-coupon-apply-btn"
                          onClick={handleApplyCoupon}
                        >
                          Apply
                        </button>
                      </div>
                    ) : (
                      <div className="toast-msg toast-success" style={{ padding: '8px 12px', margin: 0, justifyContent: 'space-between', borderRadius: '2px' }}>
                        <span style={{ display: 'flex', alignContent: 'center', gap: '6px', fontSize: '0.8rem' }}>
                          <Tag size={14} /> Coupon <strong>{couponCode.toUpperCase()}</strong> applied
                        </span>
                        <button 
                          onClick={handleRemoveCoupon} 
                          style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '8px' }}>
                      Try coupon codes <strong>JAYPORE20</strong> (20% Off) or <strong>WELCOME10</strong> (10% Off)
                    </p>
                  </div>

                </div>

              </div>

              {/* Trust Badges Bottom Strip */}
              <div className="checkout-trust-badges-bar">
                <div className="checkout-trust-badge-item">
                  <Award size={18} style={{ color: '#a34e2b' }} />
                  <span>100% Authentic Products</span>
                </div>
                <div className="checkout-trust-badge-item">
                  <Lock size={18} style={{ color: '#a34e2b' }} />
                  <span>Safe and Secure Transactions</span>
                </div>
                <div className="checkout-trust-badge-item">
                  <RotateCcw size={18} style={{ color: '#a34e2b' }} />
                  <span>10 Days Returns*</span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
