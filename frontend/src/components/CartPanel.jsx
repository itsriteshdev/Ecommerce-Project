import React, { useState } from 'react';
import { X, Trash2, Tag, ShoppingBag, CreditCard, Home, Check } from 'lucide-react';
import { api } from '../api';

export default function CartPanel({
  isOpen,
  onClose,
  cart,
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

  if (!isOpen) return null;

  const items = cart?.items || [];
  const subtotal = items.reduce((acc, item) => {
    const price = item.product.discountPrice && item.product.discountPrice < item.product.price
      ? item.product.discountPrice
      : item.product.price;
    return acc + (price * item.quantity);
  }, 0);

  const discountAmount = subtotal * (discountPercent / 100);
  const total = subtotal - discountAmount;

  const handleApplyCoupon = () => {
    setError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    // Simulate frontend validation check
    if (code === 'WELCOME10') {
      setDiscountPercent(10);
      setCouponApplied(true);
    } else if (code === 'VELOCE20') {
      setDiscountPercent(20);
      setCouponApplied(true);
    } else {
      // Allow any coupon to be passed to server checkout, but warn it is validated on checkout
      setDiscountPercent(0);
      setCouponApplied(true);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setDiscountPercent(0);
    setCouponApplied(false);
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
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} style={{ justifyContent: 'flex-end', alignItems: 'stretch' }}>
      <div className={`drawer ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} style={{ color: 'hsl(var(--primary))' }} />
            {checkoutStep ? 'Delivery Details' : 'Shopping Cart'}
          </h3>
          <button className="modal-close" onClick={onClose} style={{ position: 'static' }}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {error && (
            <div className="toast-msg toast-danger" style={{ fontSize: '0.85rem', padding: '10px 14px' }}>
              <span>{error}</span>
            </div>
          )}

          {!checkoutStep ? (
            /* CART LIST STEP */
            items.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', color: 'hsl(var(--text-muted))' }}>
                <ShoppingBag size={48} style={{ marginBottom: '16px', strokeWidth: 1 }} />
                <p>Your shopping bag is empty.</p>
              </div>
            ) : (
              <div>
                {items.map((item) => {
                  const product = item.product;
                  const price = product.discountPrice && product.discountPrice < product.price
                    ? product.discountPrice
                    : product.price;
                  const imgUrl = product.productImages?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150';
                  return (
                    <div key={item.id} className="cart-item">
                      <img src={imgUrl} alt={product.productName} className="cart-item-img" />
                      <div className="cart-item-details">
                        <h4 className="cart-item-name">{product.productName}</h4>
                        <span className="cart-item-price">₹{price}</span>

                        <div className="cart-item-actions">
                          <div className="qty-counter">
                            <button
                              className="qty-btn"
                              onClick={() => onUpdateQty(item.id, Math.max(1, item.quantity - 1))}
                            >
                              -
                            </button>
                            <span className="qty-val">{item.quantity}</span>
                            <button
                              className="qty-btn"
                              onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>

                          <button
                            className="btn btn-ghost"
                            onClick={() => onRemoveItem(item.id)}
                            style={{ color: 'hsl(var(--danger))', padding: '6px' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Coupon Code Section */}
                <div style={{ marginTop: '30px' }}>
                  <label className="input-label" style={{ marginBottom: '8px', display: 'block' }}>Have a Promo Code?</label>
                  {!couponApplied ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="e.g. VELOCE20 (20% Off)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        style={{ flexGrow: 1, padding: '8px 12px' }}
                      />
                      <button className="btn btn-secondary" onClick={handleApplyCoupon} style={{ padding: '8px 16px' }}>
                        Apply
                      </button>
                    </div>
                  ) : (
                    <div className="toast-msg toast-success" style={{ padding: '8px 12px', margin: 0, justifyContent: 'space-between', borderRadius: '10px' }}>
                      <span style={{ display: 'flex', alignContent: 'center', gap: '6px' }}>
                        <Tag size={16} />
                        Promo code <strong>{couponCode.toUpperCase()}</strong> applied
                        {discountPercent > 0 && ` (${discountPercent}% Off)`}
                      </span>
                      <button onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}>
                        Remove
                      </button>
                    </div>
                  )}
                  <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '6px' }}>
                    Tip: Try using promo code <strong>VELOCE20</strong> or <strong>WELCOME10</strong>
                  </p>
                </div>
              </div>
            )
          ) : (
            /* CHECKOUT FORM STEP */
            <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="input-group">
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Home size={16} /> Shipping Address
                </label>
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder="Enter full physical address for prompt delivery"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  style={{ resize: 'none', fontFamily: 'inherit' }}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCard size={16} /> Payment Option
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                  <label className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', cursor: 'pointer', border: paymentMethod === 'COD' ? '1px solid hsl(var(--primary))' : '1px solid hsla(var(--border-glass))' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                    />
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Cash on Delivery (COD)</div>
                      <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Pay in cash upon physical arrival.</div>
                    </div>
                  </label>

                  <label className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', cursor: 'pointer', border: paymentMethod === 'UPI' ? '1px solid hsl(var(--primary))' : '1px solid hsla(var(--border-glass))' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="UPI"
                      checked={paymentMethod === 'UPI'}
                      onChange={() => setPaymentMethod('UPI')}
                    />
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Instant UPI Transfer</div>
                      <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Pay instantly using QR scanner or UPI link.</div>
                    </div>
                  </label>

                  <label className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', cursor: 'pointer', border: paymentMethod === 'CARD' ? '1px solid hsl(var(--primary))' : '1px solid hsla(var(--border-glass))' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CARD"
                      checked={paymentMethod === 'CARD'}
                      onChange={() => setPaymentMethod('CARD')}
                    />
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Credit / Debit Card</div>
                      <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Accepts Visa, MasterCard, and RuPay.</div>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          )}
        </div>

        {items.length > 0 && (
          <div className="drawer-footer">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="summary-row" style={{ color: 'hsl(var(--success))' }}>
                <span>Coupon Discount</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Standard Shipping</span>
              <span style={{ color: 'hsl(var(--success))' }}>FREE</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            {!checkoutStep ? (
              <button
                className="btn btn-primary"
                onClick={() => setCheckoutStep(true)}
                style={{ width: '100%', marginTop: '20px' }}
              >
                Proceed to Checkout
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setCheckoutStep(false)}
                  style={{ flex: 1 }}
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleCheckout}
                  style={{ flex: 2 }}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
