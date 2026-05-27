import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Star, Shield, HelpCircle, ChevronDown, ChevronUp, 
  Truck, RotateCcw, AlertCircle, ShoppingCart, ArrowLeft, 
  Info, Ruler, Compass, CheckCircle2, Share2, Eye
} from 'lucide-react';
import { api } from '../api';

export default function ProductDetails({ product, user, onAddToCart, onOpenAuth, onBack }) {
  // Gallery states
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [is360Mode, setIs360Mode] = useState(false);
  const [angleIndex, setAngleIndex] = useState(0); // For 360 simulation
  const [zoomStyle, setZoomStyle] = useState({ transform: 'scale(1)', transformOrigin: 'center center' });
  const [isZoomActive, setIsZoomActive] = useState(false);

  // Selector states
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  // Wishlist states
  const [isLiked, setIsLiked] = useState(false);
  
  // Pincode checker states
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null); // 'checking', 'success', 'error'
  const [pincodeMessage, setPincodeMessage] = useState('');

  // Accordion state
  const [openAccordions, setOpenAccordions] = useState({
    details: true,
    fabric: false,
    specifications: false,
    shipping: false
  });

  // Cross-sell states
  const [bundleChecked, setBundleChecked] = useState([true, true, true]); // Main product, complementary item 1, complementary item 2
  const [bundleStatus, setBundleStatus] = useState('');

  // Add to Bag success overlay state
  const [actionSuccess, setActionSuccess] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const mainCtaRef = useRef(null);

  // Similar Products list (mock data fetched or computed based on category)
  const [similarProducts, setSimilarProducts] = useState([]);

  // Mock complementary bundle items for Cross-sell
  const complementaryItems = [
    {
      id: 'comp-jhumka',
      productName: 'Handcrafted Kundan Jhumka Earrings',
      price: 1299,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&auto=format&fit=crop&q=80',
      category: 'Jewellery'
    },
    {
      id: 'comp-dupatta',
      productName: 'Muted Gold Banarasi Silk Dupatta',
      price: 1899,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&auto=format&fit=crop&q=80',
      category: 'Salwar Kameez'
    }
  ];

  // Mock gallery image sets based on product type to ensure extremely premium photography
  const getProductImageGallery = (prod) => {
    if (prod.productImages && prod.productImages.length > 1) {
      return prod.productImages;
    }
    const primaryImg = getProductImage(prod);
    
    // Luxury fallbacks that align with the elegant themes
    const isSaree = (prod.category || '').toLowerCase().includes('saree');
    const isLehenga = (prod.category || '').toLowerCase().includes('lehenga');
    const isJewellery = (prod.category || '').toLowerCase().includes('jewel');
    const isMen = (prod.category || '').toLowerCase().includes('men');

    if (isSaree) {
      return [
        primaryImg,
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&auto=format&fit=crop&q=80'
      ];
    } else if (isLehenga) {
      return [
        primaryImg,
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80'
      ];
    } else if (isJewellery) {
      return [
        primaryImg,
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1611085583191-a3b1a3a35541?w=800&auto=format&fit=crop&q=80'
      ];
    } else if (isMen) {
      return [
        primaryImg,
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?w=800&auto=format&fit=crop&q=80'
      ];
    }

    return [
      primaryImg,
      'https://images.unsplash.com/photo-1631856955409-0912b33f1d2b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?w=800&auto=format&fit=crop&q=80'
    ];
  };

  const images = getProductImageGallery(product);

  // 360 degree rotation simulation set
  const angles360 = [
    images[0],
    images[1] || images[0],
    images[2] || images[0],
    images[3] || images[0]
  ];

  function getProductImage(prod) {
    if (prod.productImages && prod.productImages.length > 0 && prod.productImages[0]) {
      return prod.productImages[0];
    }
    const cat = (prod.category || '').toLowerCase();
    if (cat.includes('elect')) {
      return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';
    } else if (cat.includes('fash') || cat.includes('cloth') || cat.includes('wear') || cat.includes('body')) {
      return 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800';
    } else if (cat.includes('home') || cat.includes('furn')) {
      return 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800';
    } else if (cat.includes('beauty') || cat.includes('care')) {
      return 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800';
    }
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';
  }

  // Load wishlist status and related items on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    checkWishlist();
    fetchSimilarItems();

    // Scroll trigger for bottom sticky CTA bar
    const handleScroll = () => {
      if (mainCtaRef.current) {
        const rect = mainCtaRef.current.getBoundingClientRect();
        // If the main Add to Cart is scrolled above the screen, show sticky CTA
        if (rect.bottom < 0) {
          setStickyVisible(true);
        } else {
          setStickyVisible(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [product.productId]);

  const checkWishlist = async () => {
    if (!user) return;
    try {
      const wishlist = await api.getWishlist();
      const exists = wishlist.some(item => item.productId === product.productId);
      setIsLiked(exists);
    } catch (e) {
      console.error("Wishlist fetch error:", e);
    }
  };

  const fetchSimilarItems = async () => {
    try {
      const res = await api.filterProducts(product.category);
      const list = res.content || res || [];
      // Filter out current product
      setSimilarProducts(list.filter(p => p.id !== product.id).slice(0, 6));
    } catch (e) {
      console.error("Failed to load similar products:", e);
    }
  };

  // Toggle wishlist state
  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    if (!user) {
      onOpenAuth();
      return;
    }
    try {
      if (isLiked) {
        await api.removeFromWishlist(product.productId);
        setIsLiked(false);
      } else {
        await api.addToWishlist(product.productId);
        setIsLiked(true);
      }
    } catch (err) {
      alert(err.message || 'Error updating wishlist');
    }
  };

  // Zoom on Hover Calculations
  const handleMouseMove = (e) => {
    if (is360Mode) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setIsZoomActive(true);
    setZoomStyle({
      transform: 'scale(1.9)',
      transformOrigin: `${x}% ${y}%`
    });
  };

  const handleMouseLeave = () => {
    setIsZoomActive(false);
    setZoomStyle({
      transform: 'scale(1)',
      transformOrigin: 'center center'
    });
  };

  // Pincode validation handler
  const checkDeliveryPincode = (e) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
      setPincodeStatus('error');
      setPincodeMessage('Please enter a valid 6-digit postal code.');
      return;
    }
    setPincodeStatus('checking');
    setTimeout(() => {
      // simulated delivery calculation
      const digit = parseInt(pincode.charAt(0));
      if (digit === 1 || digit === 4 || digit === 5) {
        setPincodeStatus('success');
        setPincodeMessage('Premium Express Delivery available! Standard Delivery: 2-3 Days. Free Cash on Delivery (COD) eligible.');
      } else if (digit === 0 || digit === 9) {
        setPincodeStatus('error');
        setPincodeMessage('Sorry, we currently do not ship to this region.');
      } else {
        setPincodeStatus('success');
        setPincodeMessage('Standard Delivery available: 4-6 Days. Free shipping on orders above ₹1,999.');
      }
    }, 850);
  };

  const toggleAccordion = (section) => {
    setOpenAccordions(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Add items to bag handler
  const handleAddToBag = async (qty = quantity, size = selectedSize) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (user.role !== 'CUSTOMER') {
      alert("Only customers can add items to the cart.");
      return;
    }
    if (!size) {
      setSizeError(true);
      // scroll to size selector
      const element = document.getElementById('size-selector-view');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setSizeError(false);
    try {
      await onAddToCart(product.productId, qty);
      setActionSuccess(true);
      setTimeout(() => setActionSuccess(false), 2400);
    } catch (err) {
      alert(err.message || "Failed to add product to cart");
    }
  };

  // Buy Now checkout flow
  const handleBuyNow = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (user.role !== 'CUSTOMER') {
      alert("Only customers can purchase items.");
      return;
    }
    if (!selectedSize) {
      setSizeError(true);
      const element = document.getElementById('size-selector-view');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setSizeError(false);
    try {
      await onAddToCart(product.productId, quantity);
      // Open cart directly
      document.querySelector('.cart-link-wrapper')?.click();
    } catch (err) {
      alert(err.message || "Failed to initiate purchase");
    }
  };

  // Frequently Bought Together Bundle Add
  const handleAddBundleToBag = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (user.role !== 'CUSTOMER') {
      alert("Only customers can add items to the cart.");
      return;
    }
    // Main product size check
    if (bundleChecked[0] && !selectedSize) {
      setSizeError(true);
      const element = document.getElementById('size-selector-view');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setBundleStatus('Adding ensemble to your bag...');
    try {
      // Add checked products sequentially
      if (bundleChecked[0]) {
        await onAddToCart(product.productId, 1);
      }
      if (bundleChecked[1]) {
        await onAddToCart('1', 1); // Mock complementary product 1 (Silver Jhumkas)
      }
      if (bundleChecked[2]) {
        await onAddToCart('2', 1); // Mock complementary product 2 (Silk Dupatta)
      }
      setBundleStatus('Ensemble successfully added to your bag!');
      setTimeout(() => setBundleStatus(''), 3000);
    } catch (err) {
      setBundleStatus('');
      alert("Added items to bag. Note: Complementary items are preview mockups, standard checkout applies.");
    }
  };

  // Calculate pricing values
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const currentPrice = hasDiscount ? product.discountPrice : product.price;
  const discountPercent = hasDiscount ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  // Bundle pricing calculation
  const getBundleTotal = () => {
    let total = 0;
    if (bundleChecked[0]) total += currentPrice;
    if (bundleChecked[1]) total += complementaryItems[0].price;
    if (bundleChecked[2]) total += complementaryItems[1].price;
    return total;
  };

  return (
    <div className="luxury-bg">
      <div className="main-container" style={{ padding: '40px 40px' }}>
        
        {/* Navigation back and Breadcrumbs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button 
            onClick={onBack} 
            className="btn btn-ghost" 
            style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em' }}
          >
            <ArrowLeft size={16} /> BACK TO CATALOG
          </button>
          
          <div className="premium-breadcrumbs">
            <span style={{ cursor: 'pointer' }} onClick={onBack}>Home</span>
            <span>/</span>
            <span style={{ cursor: 'pointer' }} onClick={onBack}>{product.category}</span>
            <span>/</span>
            <span style={{ color: 'hsl(var(--color-beige-dark))' }}>{product.productName}</span>
          </div>
        </div>

        {/* Main Details Section */}
        <div className="product-details-container">
          
          {/* LEFT COLUMN: Gallery Viewport */}
          <div className="gallery-system">
            
            {/* Vertical thumbnails */}
            {!is360Mode && (
              <div className="vertical-thumbnails">
                {images.map((imgUrl, index) => (
                  <button
                    key={index}
                    className={`thumbnail-btn ${activeImageIndex === index ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img src={imgUrl} alt={`${product.productName} thumbnail ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}

            {/* Main view container */}
            <div className="main-image-viewport">
              
              {is360Mode ? (
                /* 360 preview simulator */
                <div className="viewer-360-container">
                  <img 
                    src={angles360[angleIndex]} 
                    alt="360 rotation angle"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <div className="viewer-360-instructions">
                    Drag/Move Slider to Rotate Craft
                  </div>
                  
                  {/* Slider Control */}
                  <div style={{ position: 'absolute', bottom: '60px', left: '10%', right: '10%', zIndex: 12 }}>
                    <input 
                      type="range" 
                      min="0" 
                      max="3" 
                      value={angleIndex} 
                      onChange={(e) => setAngleIndex(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: 'hsl(var(--color-gold))', cursor: 'pointer' }} 
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#1a1a1a', fontWeight: 'bold', marginTop: '4px' }}>
                      <span>Front</span>
                      <span>Left Profile</span>
                      <span>Back</span>
                      <span>Right Profile</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Main Image with Hover Zoom */
                <div 
                  className={`main-image-viewport ${!is360Mode ? 'zoom-active' : ''}`}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
                >
                  <img
                    src={images[activeImageIndex]}
                    alt={product.productName}
                    className="main-gallery-image"
                    style={{ 
                      ...zoomStyle, 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                </div>
              )}

              {/* Wishlist Heart Icon overlay */}
              <button 
                className={`wishlist-heart-btn ${isLiked ? 'liked' : ''}`}
                onClick={handleWishlistToggle}
                aria-label={isLiked ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
              </button>

              {/* 360 preview mode button */}
              <button 
                className="preview-360-btn"
                onClick={() => setIs360Mode(!is360Mode)}
              >
                <Compass size={14} />
                {is360Mode ? "Standard View" : "360° Preview"}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Product Specifications & CTA */}
          <div>
            <span className="details-brand-header">
              {product.brand || "JAYPORE LUXE"}
            </span>
            
            <h1 className="details-product-title">
              {product.productName}
            </h1>

            {/* Price Tags */}
            <div className="details-price-section">
              <span className="details-price-current">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <>
                  <span className="details-price-original">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="details-price-discount">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Fabric Tag badge and status */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '24px' }}>
              <span className="fabric-badge">
                {product.category === 'Jewellery' ? 'Pure Kundan' : 'Handloom Cotton'}
              </span>
              {product.stockQuantity <= 3 && product.stockQuantity > 0 && (
                <span style={{ fontSize: '0.75rem', color: '#c0392b', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Hurry, Only {product.stockQuantity} Left!
                </span>
              )}
            </div>

            {/* Short Description */}
            <p className="details-short-desc">
              {product.description || "Indulge in absolute luxury with this carefully handcrafted garment. Adorned with beautiful traditional prints, soft colors, and delicate embroidery work, it is designed to represent the pinnacle of royal Indian boutique crafts."}
            </p>

            {/* Size Selector */}
            <div id="size-selector-view" style={{ marginBottom: '24px' }}>
              <div className="variant-section-title">
                <span>Select Size (UK/India)</span>
                <button 
                  className="size-chart-trigger-btn"
                  onClick={() => setIsSizeChartOpen(true)}
                >
                  <Ruler size={14} /> Size Chart
                </button>
              </div>

              <div className="size-selector-grid">
                {['XS', 'S', 'M', 'L', 'XL'].map((size) => {
                  const isOutOfStock = product.stockQuantity === 0; // Simple simulation or size specific limits
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      className={`size-option-btn ${isSelected ? 'selected' : ''} ${isOutOfStock ? 'disabled' : ''}`}
                      onClick={() => !isOutOfStock && setSelectedSize(size)}
                      disabled={isOutOfStock}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {sizeError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c0392b', fontSize: '0.8rem', fontWeight: 500, marginTop: '-15px', marginBottom: '20px' }}>
                  <AlertCircle size={14} /> Please select a size to proceed.
                </div>
              )}
            </div>

            {/* Quantity Picker & CTA controls */}
            <div className="purchase-controls" ref={mainCtaRef}>
              <div className="quantity-picker">
                <button 
                  className="qty-control-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease Quantity"
                >
                  -
                </button>
                <span className="qty-display-value">{quantity}</span>
                <button 
                  className="qty-control-btn"
                  onClick={() => setQuantity(Math.min(product.stockQuantity || 10, quantity + 1))}
                  aria-label="Increase Quantity"
                >
                  +
                </button>
              </div>

              {product.stockQuantity > 0 ? (
                <>
                  <button 
                    className="action-btn-bag"
                    onClick={() => handleAddToBag()}
                  >
                    Add to Bag
                  </button>
                  <button 
                    className="action-btn-buy"
                    onClick={handleBuyNow}
                  >
                    Buy Now
                  </button>
                </>
              ) : (
                <button className="btn" style={{ width: '100%', height: '52px', background: '#ccc', cursor: 'not-allowed', color: '#fff', border: 'none' }} disabled>
                  Temporarily Sold Out
                </button>
              )}
            </div>

            {/* Action feedback popup banner */}
            {actionSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(59, 89, 68, 0.08)', color: 'hsl(var(--accent-green))', border: '1px solid hsl(var(--accent-green))', padding: '12px 18px', marginBottom: '24px', animation: 'fadeIn 0.3s ease' }}>
                <CheckCircle2 size={16} /> Item added to bag successfully!
              </div>
            )}

            {/* Delivery Pincode Checker */}
            <div className="pincode-checker">
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--color-beige-dark))' }}>
                Check Delivery Availability
              </span>
              <form onSubmit={checkDeliveryPincode} className="pincode-input-wrapper">
                <input 
                  type="text" 
                  className="pincode-field"
                  placeholder="Enter 6-digit Pincode (e.g. 110001)"
                  value={pincode}
                  maxLength={6}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                />
                <button type="submit" className="pincode-submit-btn">
                  Check
                </button>
              </form>

              {pincodeStatus === 'checking' && (
                <div className="pincode-status-text" style={{ color: 'hsl(var(--text-muted))' }}>
                  Verifying delivery pincode...
                </div>
              )}
              {pincodeStatus === 'success' && (
                <div className="pincode-status-text" style={{ color: 'hsl(var(--accent-green))' }}>
                  <Truck size={14} /> {pincodeMessage}
                </div>
              )}
              {pincodeStatus === 'error' && (
                <div className="pincode-status-text" style={{ color: '#c0392b' }}>
                  <AlertCircle size={14} /> {pincodeMessage}
                </div>
              )}
            </div>

            {/* Return policy trust items */}
            <div className="service-trust-grid">
              <div className="trust-item">
                <div className="trust-icon-box"><RotateCcw size={18} /></div>
                <div>
                  <h4 className="trust-title">3-Day Returns</h4>
                  <p className="trust-desc">Hassle-free reverse pickups from home</p>
                </div>
              </div>
              <div className="trust-item">
                <div className="trust-icon-box"><Shield size={18} /></div>
                <div>
                  <h4 className="trust-title">100% Handloom</h4>
                  <p className="trust-desc">Certified organic Indian craftsmanship</p>
                </div>
              </div>
            </div>

            {/* Accordions */}
            <div className="details-accordion">
              
              {/* Accordion Item 1: Details */}
              <div className="accordion-tab">
                <button className="accordion-header" onClick={() => toggleAccordion('details')}>
                  <span>Craft & Specifications</span>
                  {openAccordions.details ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openAccordions.details && (
                  <div className="accordion-content">
                    <p style={{ marginBottom: '14px' }}>
                      Inspired by royal Rajasthani heritage prints. This artisan dress showcases meticulous attention to detail, using block dyes that carry a rich texture and vintage Indian fashion essence. Designed for long-lasting festive comfort.
                    </p>
                    <table className="specifications-table">
                      <tbody>
                        <tr>
                          <td className="specifications-label">Top Shape</td>
                          <td className="specifications-value">Straight Fit Silhouette</td>
                        </tr>
                        <tr>
                          <td className="specifications-label">Print/Pattern</td>
                          <td className="specifications-value">Dabu Hand-Block Prints</td>
                        </tr>
                        <tr>
                          <td className="specifications-label">Neck Style</td>
                          <td className="specifications-value">Mandarin Collar Keyhole</td>
                        </tr>
                        <tr>
                          <td className="specifications-label">Hemline</td>
                          <td className="specifications-value">Curved Elegant Trim</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Accordion Item 2: Fabric & Care */}
              <div className="accordion-tab">
                <button className="accordion-header" onClick={() => toggleAccordion('fabric')}>
                  <span>Fabric & Care Instructions</span>
                  {openAccordions.fabric ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openAccordions.fabric && (
                  <div className="accordion-content">
                    <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <li>Fabric: 100% Pure Organic Handloom Cotton.</li>
                      <li>Dyeing: Natural vegetable dyes. Indigo bleed may occur initially.</li>
                      <li>Care: Professional Dry Clean only for first wash, followed by gentle handwash in cold water.</li>
                      <li>Ironing: Dry iron on moderate setting. Do not iron directly on embroideries.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Accordion Item 3: Styling Tips */}
              <div className="accordion-tab">
                <button className="accordion-header" onClick={() => toggleAccordion('specifications')}>
                  <span>Styling & Ensemble Curation</span>
                  {openAccordions.specifications ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openAccordions.specifications && (
                  <div className="accordion-content">
                    <div className="styling-tips-banner">
                      <div className="styling-tips-icon-box">
                        <Compass size={22} />
                      </div>
                      <div className="styling-tips-text">
                        "For a complete Jaypore-chic aesthetic, pair this straight-fit indigo Kurta with neutral cream linen trousers, layered silver-oxidized jhumkas, and structured handcrafted leather juttis."
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion Item 4: Shipping */}
              <div className="accordion-tab">
                <button className="accordion-header" onClick={() => toggleAccordion('shipping')}>
                  <span>Shipping & Secure Checkouts</span>
                  {openAccordions.shipping ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openAccordions.shipping && (
                  <div className="accordion-content">
                    <p>
                      We offer free shipping on all orders across India exceeding ₹1,999. All packages are double-disinfected and shipped using premium logistics channels (Delhivery, BlueDart). Dispatch occurs within 24 hours of confirmation. Cash on delivery is supported for select pincodes.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* SECTION: Frequently Bought Together (Cross-selling) */}
        <section className="fbt-section">
          <h2 className="fbt-title">Complete The Boutique Look</h2>
          
          <div className="fbt-flex-container">
            <div className="fbt-products-list">
              {/* Product 1: Current item */}
              <div className="fbt-product-item-card">
                <div className="fbt-img-wrapper">
                  <img src={images[0]} alt={product.productName} />
                </div>
                <span className="fbt-product-name">{product.productName}</span>
                <span className="fbt-product-price">₹{currentPrice.toLocaleString('en-IN')}</span>
              </div>

              <span className="fbt-plus-separator">+</span>

              {/* Product 2: Complementary Jhumka */}
              <div className="fbt-product-item-card">
                <div className="fbt-img-wrapper">
                  <img src={complementaryItems[0].image} alt={complementaryItems[0].productName} />
                </div>
                <span className="fbt-product-name">{complementaryItems[0].productName}</span>
                <span className="fbt-product-price">₹{complementaryItems[0].price.toLocaleString('en-IN')}</span>
              </div>

              <span className="fbt-plus-separator">+</span>

              {/* Product 3: Complementary Dupatta */}
              <div className="fbt-product-item-card">
                <div className="fbt-img-wrapper">
                  <img src={complementaryItems[1].image} alt={complementaryItems[1].productName} />
                </div>
                <span className="fbt-product-name">{complementaryItems[1].productName}</span>
                <span className="fbt-product-price">₹{complementaryItems[1].price.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Action checklist box */}
            <div className="fbt-action-panel">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="fbt-checkbox-label">
                  <input 
                    type="checkbox" 
                    className="fbt-checkbox-input"
                    checked={bundleChecked[0]}
                    onChange={() => setBundleChecked([!bundleChecked[0], bundleChecked[1], bundleChecked[2]])} 
                  />
                  <span>This Item (₹{currentPrice.toLocaleString('en-IN')})</span>
                </label>
                <label className="fbt-checkbox-label">
                  <input 
                    type="checkbox" 
                    className="fbt-checkbox-input"
                    checked={bundleChecked[1]}
                    onChange={() => setBundleChecked([bundleChecked[0], !bundleChecked[1], bundleChecked[2]])} 
                  />
                  <span>Kundan Jhumkas (₹{complementaryItems[0].price.toLocaleString('en-IN')})</span>
                </label>
                <label className="fbt-checkbox-label">
                  <input 
                    type="checkbox" 
                    className="fbt-checkbox-input"
                    checked={bundleChecked[2]}
                    onChange={() => setBundleChecked([bundleChecked[0], bundleChecked[1], !bundleChecked[2]])} 
                  />
                  <span>Silk Dupatta (₹{complementaryItems[1].price.toLocaleString('en-IN')})</span>
                </label>
              </div>

              <div className="fbt-pricing-summary" style={{ marginTop: '12px' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'hsl(var(--text-muted))', letterSpacing: '0.05em' }}>
                  Total Ensemble Price:
                </span>
                <span className="fbt-total-price">
                  ₹{getBundleTotal().toLocaleString('en-IN')}
                </span>
              </div>

              <button 
                className="action-btn-buy" 
                style={{ width: '100%', height: '46px', fontSize: '0.75rem' }}
                onClick={handleAddBundleToBag}
                disabled={!bundleChecked[0] && !bundleChecked[1] && !bundleChecked[2]}
              >
                Add Ensemble to Bag
              </button>

              {bundleStatus && (
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--accent-green))', fontWeight: 600, textAlign: 'center', marginTop: '4px' }}>
                  {bundleStatus}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION: Similar Products Carousel */}
        {similarProducts.length > 0 && (
          <section className="similar-carousel-section">
            <div className="carousel-header-row">
              <h2 className="carousel-title">Similar Handcrafted Finds</h2>
              <div className="carousel-nav-btns">
                <button 
                  className="carousel-nav-btn" 
                  onClick={() => {
                    const viewport = document.getElementById('similar-carousel-viewport');
                    if (viewport) viewport.scrollLeft -= 300;
                  }}
                  aria-label="Scroll left"
                >
                  ←
                </button>
                <button 
                  className="carousel-nav-btn" 
                  onClick={() => {
                    const viewport = document.getElementById('similar-carousel-viewport');
                    if (viewport) viewport.scrollLeft += 300;
                  }}
                  aria-label="Scroll right"
                >
                  →
                </button>
              </div>
            </div>

            <div className="carousel-scroll-viewport" id="similar-carousel-viewport">
              {similarProducts.map((p) => {
                const discount = p.discountPrice && p.discountPrice < p.price;
                return (
                  <div 
                    key={p.id} 
                    className="carousel-item-card product-card"
                    style={{ background: '#fff', cursor: 'pointer' }}
                    onClick={() => {
                      // Call details toggle mapping
                      api.getProduct(p.productId).then(details => {
                        // Triggers detail switch
                        product.productId = details.productId; // Local manipulation
                        window.location.reload(); // Quick reset/redirect simulation since it triggers fetch or prop reset
                      }).catch(() => {
                        window.scrollTo(0,0);
                        alert("Loading selected ethnic wear find...");
                      });
                    }}
                  >
                    <div className="product-image-container">
                      <img src={getProductImage(p)} alt={p.productName} className="product-card-img" />
                      {discount && <span className="product-card-badge">Sale</span>}
                    </div>
                    <div className="product-card-body" style={{ padding: '16px' }}>
                      <span className="product-card-brand">{p.brand || 'Boutique Craft'}</span>
                      <h4 className="product-card-title" style={{ fontSize: '1.15rem', height: '2.4em', overflow: 'hidden' }}>{p.productName}</h4>
                      <div className="product-card-footer" style={{ borderTop: 'none', padding: 0 }}>
                        <div className="product-price-wrapper">
                          <span className="product-price">₹{discount ? p.discountPrice : p.price}</span>
                          {discount && <span className="product-price-original" style={{ fontSize: '0.8rem' }}>₹{p.price}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION: Customer Reviews */}
        <section className="reviews-section">
          <h2 className="reviews-section-title">Royal Reviews & Ratings</h2>
          
          <div className="reviews-dashboard">
            {/* Rating Summary numeric */}
            <div className="reviews-rating-numeric">
              <span className="reviews-rating-big">4.8</span>
              <div className="reviews-stars-row">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="#f39c12" stroke="none" />
                ))}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: 500 }}>
                Based on 28 Verified Purchases
              </span>
            </div>

            {/* Distribution panel */}
            <div className="reviews-distribution-panel">
              {[
                { star: 5, pct: 82, count: 23 },
                { star: 4, pct: 14, count: 4 },
                { star: 3, pct: 4, count: 1 },
                { star: 2, pct: 0, count: 0 },
                { star: 1, pct: 0, count: 0 }
              ].map((row) => (
                <div key={row.star} className="reviews-dist-row">
                  <span className="reviews-dist-label">{row.star} Stars</span>
                  <div className="reviews-dist-bar-bg">
                    <div className="reviews-dist-bar-fill" style={{ width: `${row.pct}%` }}></div>
                  </div>
                  <span className="reviews-dist-count">{row.count}</span>
                </div>
              ))}
            </div>

            {/* Call to action */}
            <div className="reviews-write-action">
              <h3 className="reviews-write-title">Loved the Craft?</h3>
              <p className="reviews-write-desc">
                Share your styling statement and feedback on natural weaves with others.
              </p>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '10px 24px', fontSize: '0.75rem' }}
                onClick={() => alert("Review submissions will be active for verified accounts shortly!")}
              >
                Write A Review
              </button>
            </div>
          </div>

          {/* List of reviews */}
          <div className="reviews-list">
            {[
              {
                id: 1,
                name: 'Ananya S.',
                initials: 'AS',
                rating: 5,
                date: 'May 18, 2026',
                title: 'Absolutely gorgeous fit & print quality!',
                comment: 'The cotton fabric is incredibly soft and premium, keeping me comfortable in hot weather. The Dabu handblock print details are beautiful and consistent. I got so many compliments when wearing this Kurtis set to a family brunch. Highly recommended brand!',
                media: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=120&auto=format&fit=crop&q=80']
              },
              {
                id: 2,
                name: 'Priyanka M.',
                initials: 'PM',
                rating: 5,
                date: 'April 29, 2026',
                title: 'Stunning Rajasthani Heritage Craft',
                comment: 'FabIndia and Jaypore vibes! The natural Indigo shade has that premium handcrafted touch. There was very minimal color bleeding during the first dry clean, but the print holds perfectly. Bought it with size M and the sizing is exact.',
                media: []
              },
              {
                id: 3,
                name: 'Kavita R.',
                initials: 'KR',
                rating: 4,
                date: 'March 12, 2026',
                title: 'Beautiful fit but wash carefully',
                comment: 'The pattern is exactly as shown in the picture, and the straight silhouette fits extremely well. As expected from natural vegetable dyes, it did bleed slightly in water so follow the dry clean instructions! Perfect piece otherwise.',
                media: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=120&auto=format&fit=crop&q=80']
              }
            ].map((rev) => (
              <div key={rev.id} className="review-item-card">
                <div className="review-meta-row">
                  <div className="review-user-info">
                    <div className="review-user-avatar">{rev.initials}</div>
                    <div>
                      <div className="review-user-name">
                        {rev.name}
                        <span className="review-verified-badge">✓ Verified Buyer</span>
                      </div>
                      <div style={{ display: 'flex', gap: '2px', color: '#f39c12', marginTop: '4px' }}>
                        {[...Array(rev.rating)].map((_, idx) => (
                          <Star key={idx} size={12} fill="#f39c12" stroke="none" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="review-date-text">{rev.date}</span>
                </div>

                <h4 className="review-title">{rev.title}</h4>
                <p className="review-comment">{rev.comment}</p>

                {rev.media.length > 0 && (
                  <div className="review-media-gallery">
                    {rev.media.map((med, index) => (
                      <div key={index} className="review-media-thumbnail" onClick={() => alert("Previewing review image uploads...")}>
                        <img src={med} alt="Review attachment" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* DETAILED SIZE CHART MODAL POPUP */}
      {isSizeChartOpen && (
        <div className="modal-overlay open" onClick={() => setIsSizeChartOpen(false)}>
          <div 
            className="size-chart-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setIsSizeChartOpen(false)}>
              ×
            </button>
            <h2 className="size-chart-modal-title">Garment Size Chart</h2>
            <p className="size-chart-modal-subtitle">
              All sizes listed correspond to final garment measurements in inches. Check your exact measurements to choose the perfect fit.
            </p>

            <table className="size-table">
              <thead>
                <tr>
                  <th>Boutique Size</th>
                  <th>Bust (Inches)</th>
                  <th>Waist (Inches)</th>
                  <th>Hip (Inches)</th>
                  <th>Shoulder Width</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>XS</td>
                  <td>34"</td>
                  <td>30"</td>
                  <td>38"</td>
                  <td>14.0"</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>S</td>
                  <td>36"</td>
                  <td>32"</td>
                  <td>40"</td>
                  <td>14.5"</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>M</td>
                  <td>38"</td>
                  <td>34"</td>
                  <td>42"</td>
                  <td>15.0"</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>L</td>
                  <td>40"</td>
                  <td>36"</td>
                  <td>44"</td>
                  <td>15.5"</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>XL</td>
                  <td>42"</td>
                  <td>38"</td>
                  <td>46"</td>
                  <td>16.0"</td>
                </tr>
              </tbody>
            </table>

            <div className="size-chart-note">
              <p><strong>Note on Fit:</strong> Our ethnic kurtis sets and dresses are straight-cut and designed with an extra 1.5 inches of margin inside for easy alterations. If you prefer a loose relaxed silhouette, we recommend ordering one size larger.</p>
            </div>
          </div>
        </div>
      )}

      {/* STICKY ADD TO CART BAR */}
      <div className={`sticky-cta-bar ${stickyVisible ? 'visible' : ''}`}>
        <div className="sticky-product-meta">
          <img src={images[0]} alt="Mini preview" className="sticky-product-img" />
          <div>
            <h4 className="sticky-product-title">{product.productName}</h4>
            <span className="sticky-product-price">₹{currentPrice.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="sticky-actions">
          <div className="sticky-size-picker">
            <span className="sticky-size-label">Size</span>
            <select 
              className="sticky-size-select"
              value={selectedSize}
              onChange={(e) => {
                setSelectedSize(e.target.value);
                setSizeError(false);
              }}
            >
              <option value="">Select Size</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          </div>

          <button 
            className="sticky-add-btn"
            onClick={() => handleAddToBag()}
          >
            Add to Bag
          </button>
        </div>
      </div>

    </div>
  );
}
