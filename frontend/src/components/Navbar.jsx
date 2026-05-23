import React from 'react';
import { Search, Camera, Phone, User, Heart, ShoppingBag, LogOut, HelpCircle, MapPin } from 'lucide-react';

function LeafIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 12px', opacity: 0.8 }}
    >
      <path d="M2 22C2 22 8 18 12 14C16 10 22 2 22 2C22 2 14 8 10 12C6 16 2 22 2 22Z" />
      <path d="M12 14c1.5-1.5 2.5-3.5 2.5-3.5M10 12c-1.5 1.5-3.5 2.5-3.5 2.5" />
    </svg>
  );
}

export default function Navbar({
  user,
  onOpenAuth,
  onLogout,
  cartCount,
  onOpenCart,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory
}) {

  const handleCategoryClick = (catName) => {
    setSelectedCategory(catName);
    setActiveTab('storefront');
    // Scroll to products catalog
    const catalog = document.getElementById('catalog-section');
    if (catalog) {
      catalog.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAccountClick = (e) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
    } else {
      if (user.role === 'ADMIN') {
        setActiveTab('admin');
      } else if (user.role === 'SELLER') {
        setActiveTab('seller');
      } else {
        setActiveTab('customer');
      }
    }
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
    } else if (user.role === 'CUSTOMER') {
      setActiveTab('customer');
      // If we could trigger subtab switcher, we would, but opening customer panel is great.
    } else {
      alert("Wishlists are only available for customer accounts.");
    }
  };

  return (
    <>
      {/* Top repeating announcement banner */}
      <div className="promo-banner">
        <div className="promo-banner-scroll">
          <span>FREE SHIPPING ON ORDERS OVER ₹999 <LeafIcon /></span>
          <span>SPECIAL WEDDING DISCOUNT: USE CODE 'WEDDING15' FOR 15% OFF <LeafIcon /></span>
          <span>FREE SHIPPING ON ORDERS OVER ₹999 <LeafIcon /></span>
          <span>ELEGANT ETHNIC WEAR COLLECTION ONLINE <LeafIcon /></span>
          <span>FREE SHIPPING ON ORDERS OVER ₹999 <LeafIcon /></span>
        </div>
      </div>

      {/* Main Header (Row 1) */}
      <header className="main-header" style={{ borderBottom: '1px solid hsl(var(--border-light))', background: 'hsl(var(--bg-white))' }}>
        <div className="main-header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '75px', padding: '0 40px' }}>
          
          {/* Left Column: Gender / Section Links */}
          <div className="gender-links" style={{ display: 'flex', gap: '20px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em' }}>
            <a 
              href="#women" 
              onClick={(e) => { e.preventDefault(); handleCategoryClick('All'); }} 
              style={{ padding: '6px 12px', background: selectedCategory !== 'Men' && selectedCategory !== 'Jewellery' && activeTab === 'storefront' ? '#000' : 'transparent', color: selectedCategory !== 'Men' && selectedCategory !== 'Jewellery' && activeTab === 'storefront' ? '#fff' : 'inherit', textTransform: 'uppercase', transition: 'all 0.2s' }}
            >
              WOMEN
            </a>
            <a 
              href="#men" 
              onClick={(e) => { e.preventDefault(); handleCategoryClick('Men'); }} 
              style={{ padding: '6px 12px', background: selectedCategory === 'Men' && activeTab === 'storefront' ? '#000' : 'transparent', color: selectedCategory === 'Men' && activeTab === 'storefront' ? '#fff' : 'inherit', textTransform: 'uppercase', transition: 'all 0.2s' }}
            >
              MEN
            </a>
            <a href="#bridal" onClick={(e) => { e.preventDefault(); handleCategoryClick('Lehengas'); }} style={{ padding: '6px 12px', color: 'inherit', textTransform: 'uppercase' }}>
              BRIDAL
            </a>
            <a href="#luxe" onClick={(e) => { e.preventDefault(); handleCategoryClick('Sarees'); }} style={{ padding: '6px 12px', color: 'hsl(var(--accent-orange, 20, 60%, 50%))', textTransform: 'uppercase', fontWeight: 'bold' }}>
              LUXE
            </a>
            <a href="#store" onClick={(e) => e.preventDefault()} style={{ padding: '6px 12px', color: 'inherit', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={13} /> FIND STORE
            </a>
          </div>

          {/* Center Column: Spaced Luxury Serif Logo */}
          <div 
            className="brand-logo-wrapper" 
            onClick={() => { setActiveTab('storefront'); setSelectedCategory('All'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            style={{ cursor: 'pointer', textAlign: 'center' }}
          >
            <div style={{ fontSize: '2.2rem', letterSpacing: '0.25em', fontWeight: '400', fontFamily: 'var(--font-display)', color: '#000', lineHeight: 1.1 }}>
              FRAIS
            </div>
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.45em', textTransform: 'uppercase', color: 'hsl(var(--text-muted))', marginTop: '2px', fontWeight: 600 }}>
              FASHION
            </div>
          </div>

          {/* Right Column: Search + Actions */}
          <div className="header-right-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            
            {/* Search Input Box */}
            <div className="nav-search-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Search for Sarees, Lehengas, Men..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveTab('storefront');
                }}
                className="nav-search-input"
                style={{
                  padding: '8px 36px 8px 16px',
                  borderRadius: '40px',
                  border: '1px solid hsl(var(--border-light))',
                  background: 'hsl(var(--bg-base))',
                  fontSize: '0.8rem',
                  width: '220px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
              <Search size={14} style={{ position: 'absolute', right: '14px', color: 'hsl(var(--text-muted))', pointerEvents: 'none' }} />
            </div>

            {/* Icon buttons */}
            <button className="nav-icon-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '4px' }} title="Search by Image">
              <Camera size={18} />
            </button>

            <button className="nav-icon-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '4px' }} title="Contact Support">
              <Phone size={18} />
            </button>

            {/* Profile Menu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <a href="#account" onClick={handleAccountClick} className="nav-icon-btn" style={{ color: 'inherit', padding: '4px', display: 'flex', alignItems: 'center', gap: '4px' }} title="My Account">
                <User size={18} />
                {user && (
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    {user.email.split('@')[0]}
                  </span>
                )}
              </a>
              {user && (
                <button onClick={onLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-muted))', padding: '4px' }} title="Sign Out">
                  <LogOut size={14} />
                </button>
              )}
            </div>

            {/* Wishlist Heart */}
            <a href="#wishlist" onClick={handleWishlistClick} className="nav-icon-btn" style={{ color: 'inherit', padding: '4px' }} title="My Wishlist">
              <Heart size={18} />
            </a>

            {/* Cart Icon & Counter */}
            {(!user || user.role === 'CUSTOMER') && (
              <div 
                className="cart-link-wrapper" 
                onClick={onOpenCart} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  cursor: 'pointer',
                  padding: '6px 12px',
                  background: 'hsl(var(--bg-base))',
                  borderRadius: '40px',
                  border: '1px solid hsl(var(--border-light))'
                }}
              >
                <ShoppingBag size={16} />
                <span className="cart-circle-badge" style={{ position: 'relative', top: '0', right: '0', background: '#000', color: '#fff', fontSize: '0.7rem', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {cartCount}
                </span>
              </div>
            )}

          </div>

        </div>
      </header>

      {/* Secondary Category Strip (Row 2) */}
      <nav className="secondary-category-strip" style={{ borderBottom: '1px solid hsl(var(--border-light))', background: 'hsl(var(--bg-white))', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: '22px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', overflowX: 'auto', whiteSpace: 'nowrap', padding: '0 20px', width: '100%', justifyContent: 'center' }}>
          
          <button 
            onClick={() => handleCategoryClick('All')}
            style={{ background: '#a0522d', color: '#fff', border: 'none', padding: '4px 10px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', borderRadius: '2px' }}
          >
            READY TO SHIP
          </button>

          <button 
            onClick={() => handleCategoryClick('Sarees')}
            style={{ background: 'none', border: 'none', color: selectedCategory === 'Sarees' ? 'hsl(var(--primary))' : 'inherit', cursor: 'pointer', fontWeight: selectedCategory === 'Sarees' ? 'bold' : 'normal' }}
          >
            SAREES
          </button>

          <button 
            onClick={() => handleCategoryClick('Salwar Kameez')}
            style={{ background: 'none', border: 'none', color: selectedCategory === 'Salwar Kameez' ? 'hsl(var(--primary))' : 'inherit', cursor: 'pointer', fontWeight: selectedCategory === 'Salwar Kameez' ? 'bold' : 'normal' }}
          >
            SALWAR KAMEEZ
          </button>

          <button 
            onClick={() => handleCategoryClick('Lehengas')}
            style={{ background: 'none', border: 'none', color: selectedCategory === 'Lehengas' ? 'hsl(var(--primary))' : 'inherit', cursor: 'pointer', fontWeight: selectedCategory === 'Lehengas' ? 'bold' : 'normal' }}
          >
            LEHENGAS
          </button>

          <button 
            onClick={() => handleCategoryClick('Indo Western')}
            style={{ background: 'none', border: 'none', color: selectedCategory === 'Indo Western' ? 'hsl(var(--primary))' : 'inherit', cursor: 'pointer', fontWeight: selectedCategory === 'Indo Western' ? 'bold' : 'normal' }}
          >
            INDO WESTERN
          </button>

          <button 
            onClick={() => handleCategoryClick('Men')}
            style={{ background: '#1c2331', color: '#fff', border: 'none', padding: '4px 10px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', borderRadius: '2px' }}
          >
            MEN
          </button>

          <button 
            onClick={() => handleCategoryClick('All')}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            KIDS
          </button>

          <button 
            onClick={() => handleCategoryClick('All')}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            CO-ORDS
          </button>

          <button 
            onClick={() => handleCategoryClick('All')}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            BLOUSE
          </button>

          <button 
            onClick={() => handleCategoryClick('All')}
            style={{ background: '#cc0000', color: '#fff', border: 'none', padding: '4px 10px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', borderRadius: '2px' }}
          >
            BUY 2 @9999
          </button>

          <button 
            onClick={() => handleCategoryClick('Jewellery')}
            style={{ background: 'none', border: 'none', color: selectedCategory === 'Jewellery' ? 'hsl(var(--primary))' : 'inherit', cursor: 'pointer', fontWeight: selectedCategory === 'Jewellery' ? 'bold' : 'normal' }}
          >
            JEWELLERY
          </button>

          <button 
            onClick={() => handleCategoryClick('All')}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            BESTSELLERS
          </button>

          <button 
            onClick={() => handleCategoryClick('All')}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            NEW
          </button>

          <button 
            onClick={() => handleCategoryClick('All')}
            style={{ background: 'none', border: 'none', color: 'hsl(var(--accent-red, 0, 75%, 50%))', cursor: 'pointer', fontWeight: 'bold' }}
          >
            SALE
          </button>

        </div>
      </nav>
    </>
  );
}
