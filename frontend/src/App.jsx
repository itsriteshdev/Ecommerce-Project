import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Storefront from './components/Storefront';
import AuthModal from './components/AuthModal';
import CartPanel from './components/CartPanel';
import OrderHistory from './components/OrderHistory';
import SellerDashboard from './components/SellerDashboard';
import AdminDashboard from './components/AdminDashboard';
import CustomerDashboard from './components/CustomerDashboard';
import { api } from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState(null);
  const [activeTab, setActiveTab] = useState('storefront');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Load session from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        const normalizedRole = u.role ? u.role.replace('ROLE_', '') : '';
        const normalizedUser = { ...u, role: normalizedRole };
        setUser(normalizedUser);
        if (normalizedRole === 'SELLER') {
          setActiveTab('seller');
        } else if (normalizedRole === 'ADMIN') {
          setActiveTab('admin');
        } else if (normalizedRole === 'CUSTOMER') {
          setActiveTab('customer');
          loadCart();
        }
      } catch (e) {
        console.error("Failed to parse saved session", e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  // Fetch cart details
  const loadCart = async () => {
    try {
      const c = await api.getCart();
      setCart(c);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    }
  };

  const handleAuthSuccess = (userData) => {
    const normalizedRole = userData.role ? userData.role.replace('ROLE_', '') : '';
    const normalizedUser = { ...userData, role: normalizedRole };
    setUser(normalizedUser);
    localStorage.setItem('user', JSON.stringify(normalizedUser));

    if (normalizedRole === 'SELLER') {
      setActiveTab('seller');
    } else if (normalizedRole === 'ADMIN') {
      setActiveTab('admin');
    } else if (normalizedRole === 'CUSTOMER') {
      setActiveTab('customer');
      loadCart();
    } else {
      setActiveTab('storefront');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCart(null);
    setActiveTab('storefront');
  };

  const handleAddToCart = async (productId, quantity) => {
    await api.addToCart(productId, quantity);
    await loadCart();
  };

  const handleUpdateCartQty = async (cartItemId, quantity) => {
    await api.updateCartItem(cartItemId, quantity);
    await loadCart();
  };

  const handleRemoveCartItem = async (cartItemId) => {
    await api.removeFromCart(cartItemId);
    await loadCart();
  };

  const handleCheckoutSuccess = () => {
    setCart(null); // Clear cart state locally
    loadCart(); // Sync with backend
    setActiveTab('customer'); // Redirect to customer dashboard
  };

  const getCartCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        cartCount={getCartCount()}
        onOpenCart={() => setIsCartOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'storefront' && (
          <Storefront
            user={user}
            searchQuery={searchQuery}
            onAddToCart={handleAddToCart}
            onOpenAuth={() => setIsAuthOpen(true)}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        )}

        {activeTab === 'customer' && user && user.role === 'CUSTOMER' && (
          <div className="main-container">
            <CustomerDashboard onAddToCart={handleAddToCart} />
          </div>
        )}

        {activeTab === 'seller' && user && user.role === 'SELLER' && (
          <div className="main-container">
            <SellerDashboard />
          </div>
        )}

        {activeTab === 'admin' && user && user.role === 'ADMIN' && (
          <div className="main-container">
            <AdminDashboard />
          </div>
        )}
      </main>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <CartPanel
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onCheckoutSuccess={handleCheckoutSuccess}
      />
    </div>
  );
}
