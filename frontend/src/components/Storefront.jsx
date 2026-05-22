import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, X, Check, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { api } from '../api';

const CATEGORIES = ['All', 'Body', 'Home', 'Beauty', 'Sports'];

// Custom TikTok icon since Lucide doesn't have it natively
function TikTokIcon({ size = 18 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

// Custom Instagram icon
function InstagramIcon({ size = 18 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

// Custom Facebook icon
function FacebookIcon({ size = 18 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function getProductImage(product) {
  if (product.productImages && product.productImages.length > 0 && product.productImages[0]) {
    return product.productImages[0];
  }
  const cat = (product.category || '').toLowerCase();
  if (cat.includes('elect')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80';
  } else if (cat.includes('fash') || cat.includes('cloth') || cat.includes('wear') || cat.includes('body')) {
    return 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=80';
  } else if (cat.includes('home') || cat.includes('furn') || cat.includes('candle') || cat.includes('soap')) {
    return 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500&auto=format&fit=crop&q=80';
  } else if (cat.includes('beauty') || cat.includes('care') || cat.includes('cosm')) {
    return 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=80';
  } else if (cat.includes('sport') || cat.includes('fit')) {
    return 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80';
}

export default function Storefront({ user, searchQuery, onAddToCart, onOpenAuth }) {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailQty, setDetailQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let res;
      if (searchQuery) {
        res = await api.searchProducts(searchQuery);
      } else if (selectedCategory && selectedCategory !== 'All') {
        res = await api.filterProducts(selectedCategory);
      } else {
        res = await api.getProducts();
      }
      setProducts(res.content || res || []);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToCatalog = () => {
    const catalog = document.getElementById('catalog-section');
    if (catalog) {
      catalog.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAddToCart = async (product, qty) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (user.role !== 'CUSTOMER') {
      alert("Only customers can add items to the cart.");
      return;
    }
    try {
      await onAddToCart(product.id, qty);
      setActionSuccess(true);
      setTimeout(() => setActionSuccess(false), 2000);
    } catch (err) {
      alert(err.message || "Failed to add to cart");
    }
  };

  return (
    <>
      {/* HERO SECTION 1: Soap stack (Screenshot 3) */}
      <section className="hero-stack-section">
        <div className="hero-stack-left">
          <h1 className="hero-stack-title">
            Just Like Nature<br />Intended
          </h1>
        </div>
        <div className="hero-stack-right">
          <div className="hero-stack-right-content">
            <h3 className="hero-stack-right-title">Handcrafted Organic</h3>
            <p className="hero-stack-right-subtitle">Soap & Candles</p>
            <button className="btn btn-pill-dark" onClick={scrollToCatalog}>
              SHOP NOW
            </button>
          </div>
        </div>
      </section>

      {/* HERO SECTION 2: Candle pouring (Screenshot 2) */}
      <section className="hero-candle-section">
        <div className="hero-candle-content">
          <h2 className="hero-candle-title">Natures Essence Scented Candles</h2>
          <p className="hero-candle-text">
            I'm a paragraph. Click here to add your own text and edit me. It's easy.
            Just click "Edit Text" or double click me to add your own content and make changes to the font.
          </p>
          <button className="btn btn-pill-outline" onClick={scrollToCatalog}>
            SHOP CANDLES
          </button>
        </div>
        <div className="hero-candle-video-container">
          <img
            src="https://images.unsplash.com/photo-1603006905003-be475563bc59?w=1000&auto=format&fit=crop&q=80"
            alt="Candle pouring"
            className="hero-candle-img"
          />
          {/* Simulated Video Player Control Bar */}
          <div className="mock-video-player-bar">
            {/* Play/Pause Button */}
            <button className="mock-video-play-btn" aria-label="Pause" onClick={(e) => e.stopPropagation()}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="4" height="16" />
                <rect x="16" y="4" width="4" height="16" />
              </svg>
            </button>

            {/* Time Stamp */}
            <span className="mock-video-time">00:05/00:06</span>

            {/* Progress Bar Seeker */}
            <div className="mock-video-progress-container">
              <div className="mock-video-progress-bg">
                <div className="mock-video-progress-fill" style={{ width: '83.3%' }}></div>
                <div className="mock-video-progress-handle" style={{ left: '83.3%' }}></div>
              </div>
            </div>

            {/* Right-aligned media icons (Volume, Settings, Fullscreen) */}
            <div className="mock-video-right-controls">
              {/* Volume Icon */}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
              {/* Settings / Gear */}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              {/* Fullscreen / Expand */}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT CATALOG SECTION */}
      <div id="catalog-section" className="main-container">
        <div className="catalog-header">
          <h2 className="catalog-title">Our Collection</h2>
          <p style={{ color: 'hsl(var(--text-muted))', maxWidth: '500px', margin: '0 auto' }}>
            Handcrafted with sustainably sourced ingredients and therapeutic grade essential oils.
          </p>
        </div>

        {/* Category Strip */}
        <div className="category-strip">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedProduct(null);
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="qty-val" style={{ fontSize: '1rem', color: 'hsl(var(--text-muted))' }}>
              Curating catalog...
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="glass-panel" style={{ padding: '80px', textAlign: 'center', backgroundColor: '#fff', border: '1px solid hsl(var(--border-light))' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>No items found</h3>
            <p style={{ color: 'hsl(var(--text-muted))' }}>Try choosing another category or clearing your search.</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => {
              const hasDiscount = product.discountPrice && product.discountPrice < product.price;
              return (
                <div
                  key={product.id}
                  className="product-card"
                  onClick={() => {
                    setSelectedProduct(product);
                    setDetailQty(1);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="product-image-container">
                    <img
                      src={getProductImage(product)}
                      alt={product.productName}
                      className="product-card-img"
                    />
                    {hasDiscount && (
                      <span className="product-card-badge">Sale</span>
                    )}
                    {product.stockQuantity === 0 && (
                      <span className="product-card-badge" style={{ left: 'auto', right: '15px', background: '#e06666' }}>
                        Sold Out
                      </span>
                    )}
                  </div>

                  <div className="product-card-body">
                    <span className="product-card-brand">
                      {product.brand || product.category || 'Organic'}
                    </span>
                    <h3 className="product-card-title">{product.productName}</h3>
                    <p className="product-card-desc">{product.description || "Made using traditional recipes to cleanse, hydrate, and refresh naturally."}</p>

                    <div className="product-card-footer">
                      <div className="product-price-wrapper">
                        <span className="product-price">
                          ${hasDiscount ? product.discountPrice : product.price}
                        </span>
                        {hasDiscount && (
                          <span className="product-price-original">${product.price}</span>
                        )}
                      </div>
                      <button
                        className="btn btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product, 1);
                        }}
                        disabled={product.stockQuantity === 0}
                        style={{ padding: '8px 16px', fontSize: '0.7rem' }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FRAIS FOOTER SECTION (Screenshot 1) */}
      <footer id="frais-footer" className="frais-footer">
        <div className="frais-footer-columns">
          {/* Logo Column */}
          <div className="frais-footer-logo-col">
            <div className="frais-logo-box" style={{ fontSize: '1.6rem', padding: '10px 24px' }}>
              FRAIS
            </div>
          </div>

          {/* Shop Column */}
          <div className="frais-footer-col">
            <h4 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Shop</h4>
            <ul>
              <li><a href="#shop" onClick={(e) => { e.preventDefault(); setSelectedCategory('Body'); scrollToCatalog(); }}>FOR THE BODY</a></li>
              <li><a href="#shop" onClick={(e) => { e.preventDefault(); setSelectedCategory('Home'); scrollToCatalog(); }}>FOR THE HOME</a></li>
            </ul>
          </div>

          {/* Help Column */}
          <div className="frais-footer-col">
            <h4 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Help</h4>
            <ul>
              <li><a href="#help" onClick={(e) => e.preventDefault()}>TERMS & CONDITIONS</a></li>
              <li><a href="#privacy" onClick={(e) => e.preventDefault()}>PRIVACY POLICY</a></li>
              <li><a href="#refund" onClick={(e) => e.preventDefault()}>REFUND POLICY</a></li>
              <li><a href="#accessibility" onClick={(e) => e.preventDefault()}>ACCESSIBILTY STATMENT</a></li>
            </ul>
          </div>

          {/* Frais Column */}
          <div className="frais-footer-col">
            <h4 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Frais</h4>
            <ul>
              <li><a href="#story" onClick={(e) => e.preventDefault()}>OUR STORY</a></li>
              <li><a href="#contact" onClick={(e) => e.preventDefault()}>CONTACT US</a></li>
              <li><a href="#faq" onClick={(e) => e.preventDefault()}>FAQ</a></li>
            </ul>
          </div>

          {/* Contact Us Column */}
          <div className="frais-footer-col">
            <h4 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Contact Us</h4>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-primary))', marginBottom: '8px' }}>123-456-7890</p>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-primary))', marginBottom: '16px', textTransform: 'uppercase' }}>INFO@MYSITE.COM</p>
            <div className="frais-footer-socials">
              <a href="#instagram" className="frais-footer-social-link" onClick={(e) => e.preventDefault()} title="Instagram">
                <InstagramIcon size={18} />
              </a>
              <a href="#tiktok" className="frais-footer-social-link" onClick={(e) => e.preventDefault()} title="TikTok">
                <TikTokIcon size={18} />
              </a>
              <a href="#facebook" className="frais-footer-social-link" onClick={(e) => e.preventDefault()} title="Facebook">
                <FacebookIcon size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="frais-footer-bottom">
          <p>© {new Date().getFullYear()} FRAIS. Proudly created for organic lifestyle lovers.</p>
        </div>
      </footer>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="modal-overlay open" onClick={() => setSelectedProduct(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '800px', padding: '30px' }}
          >
            <button className="modal-close" onClick={() => setSelectedProduct(null)}>
              <X size={18} />
            </button>

            <div className="product-detail-layout">
              <div>
                <img
                  src={getProductImage(selectedProduct)}
                  alt={selectedProduct.productName}
                  className="detail-img"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="product-card-brand" style={{ alignSelf: 'flex-start', marginBottom: '10px' }}>
                  {selectedProduct.category}
                </span>
                <h2 style={{ fontSize: '2rem', marginBottom: '14px', fontWeight: '400' }}>{selectedProduct.productName}</h2>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <div className="product-price-wrapper">
                    <span className="product-price" style={{ fontSize: '1.4rem' }}>
                      ${selectedProduct.discountPrice && selectedProduct.discountPrice < selectedProduct.price ? selectedProduct.discountPrice : selectedProduct.price}
                    </span>
                    {selectedProduct.discountPrice && selectedProduct.discountPrice < selectedProduct.price && (
                      <span className="product-price-original" style={{ fontSize: '1.1rem' }}>${selectedProduct.price}</span>
                    )}
                  </div>
                </div>

                <p style={{ color: 'hsl(var(--text-muted))', marginBottom: '24px', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  {selectedProduct.description || "Every ingredient in this product is thoughtfully curated and hand-selected to deliver pure, organic excellence."}
                </p>

                {selectedProduct.deliveryInfo && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'hsl(var(--accent-green))', marginBottom: '20px', fontWeight: 500, letterSpacing: '0.05em' }}>
                    <Truck size={16} />
                    <span style={{ textTransform: 'uppercase' }}>{selectedProduct.deliveryInfo}</span>
                  </div>
                )}

                <div style={{ borderTop: '1px solid hsl(var(--border-light))', paddingTop: '20px', marginTop: 'auto' }}>
                  {selectedProduct.stockQuantity > 0 ? (
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <div className="qty-counter">
                        <button
                          className="qty-btn"
                          onClick={() => setDetailQty(Math.max(1, detailQty - 1))}
                        >
                          -
                        </button>
                        <span className="qty-val">{detailQty}</span>
                        <button
                          className="qty-btn"
                          onClick={() => setDetailQty(Math.min(selectedProduct.stockQuantity, detailQty + 1))}
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="btn btn-primary"
                        onClick={() => handleAddToCart(selectedProduct, detailQty)}
                        style={{ flexGrow: 1 }}
                      >
                        {actionSuccess ? (
                          <>
                            <Check size={14} /> Added
                          </>
                        ) : (
                          'Add to Cart'
                        )}
                      </button>
                    </div>
                  ) : (
                    <button className="btn btn-secondary" style={{ width: '100%' }} disabled>
                      Temporarily Sold Out
                    </button>
                  )}
                  
                  {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
                    <div style={{ marginTop: '24px' }}>
                      <h4 style={{ fontSize: '0.75rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>
                        Specifications
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                        {Object.entries(selectedProduct.specifications).map(([k, v]) => (
                          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid hsl(var(--border-light))', paddingBottom: '4px' }}>
                            <span style={{ color: 'hsl(var(--text-muted))' }}>{k}</span>
                            <span style={{ fontWeight: 500 }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
