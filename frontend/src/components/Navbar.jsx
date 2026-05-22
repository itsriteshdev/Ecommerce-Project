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
  setSearchQuery
}) {
  const scrollToFooter = () => {
    const footer = document.getElementById('frais-footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Top repeating forest green announcement banner */}
      <div className="promo-banner">
        <div className="promo-banner-scroll">
          <span>FREE SHIPPING ON ORDERS OVER $50 <LeafIcon /></span>
          <span>FREE SHIPPING ON ORDERS OVER $50 <LeafIcon /></span>
          <span>FREE SHIPPING ON ORDERS OVER $50 <LeafIcon /></span>
          <span>FREE SHIPPING ON ORDERS OVER $50 <LeafIcon /></span>
          <span>FREE SHIPPING ON ORDERS OVER $50 <LeafIcon /></span>
          <span>FREE SHIPPING ON ORDERS OVER $50 <LeafIcon /></span>
          <span>FREE SHIPPING ON ORDERS OVER $50 <LeafIcon /></span>
        </div>
      </div>

      <nav className="navbar">
        {/* Left Aligned Links */}
        <div className="nav-links">
          <a
            href="#shop"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('storefront');
              const catalog = document.getElementById('catalog-section');
              if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
            }}
            style={activeTab === 'storefront' ? { fontWeight: 'bold' } : {}}
          >
            SHOP
          </a>
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              scrollToFooter();
            }}
          >
            ABOUT
          </a>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollToFooter();
            }}
          >
            CONTACT
          </a>
        </div>

        {/* Centered Boxed FRAIS Logo */}
        <div className="nav-brand-container">
          <div
            className="frais-logo-box"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setActiveTab('storefront');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            FRAIS
          </div>
        </div>

        {/* Right Aligned Actions */}
        <div className="nav-actions">
          {/* Seller Dashboard Button */}
          {user && user.role === 'SELLER' && (
            <a
              href="#dashboard"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('seller');
              }}
              style={activeTab === 'seller' ? { fontWeight: 'bold' } : {}}
            >
              DASHBOARD
            </a>
          )}

          {/* Account Login / Logout */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-primary))' }}>
                {user.email.split('@')[0].toUpperCase()}
              </span>
              <a
                href="#logout"
                onClick={(e) => {
                  e.preventDefault();
                  onLogout();
                }}
              >
                SIGN OUT
              </a>
            </div>
          ) : (
            <a
              href="#login"
              onClick={(e) => {
                e.preventDefault();
                onOpenAuth();
              }}
            >
              ACCOUNT
            </a>
          )}

          {/* Cart Icon / Counter */}
          {(!user || user.role === 'CUSTOMER') && (
            <div className="cart-link-wrapper" onClick={onOpenCart}>
              <span>CART</span>
              <span className="cart-circle-badge">{cartCount}</span>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
