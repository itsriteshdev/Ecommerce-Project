import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  IndianRupee,
  Star,
  Percent,
  MessageSquare,
  Settings,
  Truck,
  AlertTriangle,
  Megaphone,
  ShieldCheck,
  Search,
  Bell,
  Mail,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  X,
  Check,
  Save,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  User,
  PlusCircle,
  FileText,
  HelpCircle,
  Send,
  Lock,
  ArrowRight
} from 'lucide-react';
import { api } from '../api';

export default function SellerDashboard({ user, onLogout }) {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | products | orders | analytics | wallet | reviews | coupons | messages | settings | shipping | inventory | marketing | security
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Data states from Backend
  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  
  // Dropdown states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Product Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); 
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    category: 'Sarees',
    brand: '',
    sku: '',
    price: '',
    discountPrice: '',
    stockQuantity: '',
    productImages: '',
    specificationsText: '',
    deliveryInfo: ''
  });

  // Order update states
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [tempDeliveryStatus, setTempDeliveryStatus] = useState('');
  const [tempPaymentStatus, setTempPaymentStatus] = useState('');

  // Mock states for UI features (specifications)
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('20%');
  const [couponsList, setCouponsList] = useState([
    { code: 'WELCOMESELLER', type: 'Percentage', value: '10%', status: 'Active', count: 12 },
    { code: 'JAYPORE20', type: 'Percentage', value: '20%', status: 'Active', count: 48 },
    { code: 'FESTIVE500', type: 'Flat Amount', value: '₹500', status: 'Active', count: 9 }
  ]);

  const [activeChatUser, setActiveChatUser] = useState('Anjali Sharma');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'customer', text: 'Hi! Is the Royal Indigo Saree pure silk?', time: '10:30 AM' },
    { sender: 'seller', text: 'Yes Anjali! It is 100% pure Mulberry Silk hand-crafted in Banaras.', time: '10:35 AM' },
    { sender: 'customer', text: 'Perfect, placing the order now. Thanks for the quick response!', time: '10:37 AM' }
  ]);
  const [newChatText, setNewChatText] = useState('');

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawStatus, setWithdrawStatus] = useState(''); // 'cleared', 'loading', 'error'
  const [withdrawHistory, setWithdrawHistory] = useState([
    { id: 'W-9021', date: '20 May 2026', amount: 15000, status: 'Completed', method: 'HDFC Bank - A/C 4555' },
    { id: 'W-9010', date: '05 May 2026', amount: 8000, status: 'Completed', method: 'HDFC Bank - A/C 4555' }
  ]);

  const [reviewReplyText, setReviewReplyText] = useState('');
  const [replyingToReviewId, setReplyingToReviewId] = useState(null);
  const [reviewsList, setReviewsList] = useState([
    { id: 1, author: 'Meera Patel', rating: 5, comment: 'Saree is absolutely beautiful! Colors are just like the photos.', product: 'Royal Indigo Silk Banarasi Saree', date: '24 May 2026', reply: 'Thank you Meera! We are thrilled you love the craft.' },
    { id: 2, author: 'Sneha Reddy', rating: 3.5, comment: 'Quality is good but delivery was delayed by two days.', product: 'Sage Green Silk Saree', date: '21 May 2026', reply: null }
  ]);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2faSetup, setShow2faSetup] = useState(false);
  const [securityCode, setSecurityCode] = useState('');

  // Fetch Dashboard Stats & Orders from DB
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const dashRes = await api.getSellerDashboard();
      setDashboard(dashRes);
      
      const orderRes = await api.getSellerOrders();
      setOrders(orderRes.content || orderRes || []);
    } catch (err) {
      console.error('Failed to load seller dashboard details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Product Actions
  const handleOpenAddForm = () => {
    setEditingProduct(null);
    setFormData({
      productName: '',
      description: '',
      category: 'Sarees',
      brand: dashboard?.businessName || '',
      sku: 'SKU-' + Math.floor(Math.random() * 900000 + 100000),
      price: '',
      discountPrice: '',
      stockQuantity: '',
      productImages: '',
      specificationsText: 'Fabric: Silk, Origin: India, Print: Handcrafted',
      deliveryInfo: 'Delivered in 3-5 business days.'
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (prod) => {
    setEditingProduct(prod);

    let specText = '';
    if (prod.specifications) {
      specText = Object.entries(prod.specifications)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
    }

    setFormData({
      productName: prod.productName,
      description: prod.description || '',
      category: prod.category || 'Sarees',
      brand: prod.brand || '',
      sku: prod.sku || '',
      price: prod.price || '',
      discountPrice: prod.discountPrice || '',
      stockQuantity: prod.stockQuantity || '',
      productImages: prod.productImages ? prod.productImages.join(', ') : '',
      specificationsText: specText,
      deliveryInfo: prod.deliveryInfo || ''
    });
    setIsFormOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const specsMap = {};
    if (formData.specificationsText) {
      const pairs = formData.specificationsText.split(',');
      pairs.forEach((pair) => {
        const parts = pair.split(':');
        if (parts.length >= 2) {
          specsMap[parts[0].trim()] = parts.slice(1).join(':').trim();
        }
      });
    }

    const payload = {
      productName: formData.productName,
      description: formData.description,
      category: formData.category,
      brand: formData.brand,
      sku: formData.sku,
      price: Number(formData.price),
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
      stockQuantity: Number(formData.stockQuantity),
      productImages: formData.productImages ? formData.productImages.split(',').map((s) => s.trim()) : [],
      specifications: specsMap,
      deliveryInfo: formData.deliveryInfo
    };

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.productId || editingProduct.id, payload);
      } else {
        await api.addProduct(payload);
      }
      setIsFormOpen(false);
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to save product listing');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await api.deleteProduct(id);
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to delete product listing');
    }
  };

  // Order Actions
  const startEditOrder = (order) => {
    setUpdatingOrderId(order.orderId);
    setTempDeliveryStatus(order.deliveryStatus);
    setTempPaymentStatus(order.paymentStatus);
  };

  const saveOrderStatus = async (orderId) => {
    try {
      await api.updateOrderStatus(orderId, tempDeliveryStatus, tempPaymentStatus);
      setUpdatingOrderId(null);
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    }
  };

  // Chat flows
  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!newChatText.trim()) return;
    setChatMessages([
      ...chatMessages,
      { sender: 'seller', text: newChatText, time: 'Just now' }
    ]);
    setNewChatText('');
  };

  // Wallet flows
  const handleWithdrawalRequest = (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) return;
    if (amount > (dashboard?.totalRevenue || 45000)) {
      alert('Withdrawal amount exceeds available balance.');
      return;
    }
    setWithdrawStatus('loading');
    setTimeout(() => {
      setWithdrawHistory([
        { id: 'W-' + Math.floor(Math.random() * 9000 + 1000), date: 'Today', amount, status: 'Processing', method: 'HDFC Bank - A/C 4555' },
        ...withdrawHistory
      ]);
      setWithdrawStatus('cleared');
      setWithdrawAmount('');
      setWithdrawModalOpen(false);
    }, 1500);
  };

  // Coupon flows
  const handleAddCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponsList([
      ...couponsList,
      { code: couponCode.toUpperCase().trim(), type: 'Percentage', value: couponDiscount, status: 'Active', count: 0 }
    ]);
    setCouponCode('');
  };

  // Review reply
  const submitReviewReply = (id) => {
    setReviewsList(reviewsList.map(r => {
      if (r.id === id) {
        return { ...r, reply: reviewReplyText };
      }
      return r;
    }));
    setReviewReplyText('');
    setReplyingToReviewId(null);
  };

  // 2FA Setup
  const handle2faVerify = (e) => {
    e.preventDefault();
    if (securityCode.length === 6) {
      setTwoFactorEnabled(true);
      setShow2faSetup(false);
      setSecurityCode('');
    } else {
      alert('Enter valid 6-digit confirmation PIN.');
    }
  };

  // Sidebar config
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Home', icon: LayoutDashboard },
    { id: 'products', label: 'Product Catalog', icon: Package, count: dashboard?.topProducts?.length || 0 },
    { id: 'orders', label: 'Customer Orders', icon: ShoppingCart, count: orders.filter(o => o.deliveryStatus === 'PENDING').length || 0 },
    { id: 'analytics', label: 'Analytics & Reports', icon: TrendingUp },
    { id: 'wallet', label: 'Wallet & Payouts', icon: IndianRupee },
    { id: 'reviews', label: 'Reviews & Ratings', icon: Star },
    { id: 'coupons', label: 'Coupons & Promos', icon: Percent },
    { id: 'messages', label: 'Customer Messages', icon: MessageSquare, count: 1 },
    { id: 'settings', label: 'Store Configuration', icon: Settings },
    { id: 'shipping', label: 'Shipping Speeds', icon: Truck },
    { id: 'inventory', label: 'Inventory Alerts', icon: AlertTriangle, count: 2 },
    { id: 'marketing', label: 'Marketing Campaigns', icon: Megaphone },
    { id: 'security', label: 'Security & Verification', icon: ShieldCheck }
  ];

  return (
    <div className={`seller-viewport-wrapper ${darkMode ? 'dark' : ''}`}>
      <style>{`
        /* SELLER DASHBOARD PANEL SYSTEM CSS OVERRIDES */
        .seller-viewport-wrapper {
          display: flex;
          height: 100vh;
          width: 100vw;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          background-color: #f8fafc;
          color: #0f172a;
          overflow: hidden;
          transition: background-color 0.3s;
        }

        .seller-viewport-wrapper.dark {
          background-color: #0b0f19;
          color: #f8fafc;
        }

        /* SIDEBAR STYLE */
        .seller-sidebar {
          width: 260px;
          background-color: #0f172a;
          color: #94a3b8;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #1e293b;
          flex-shrink: 0;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          height: 100%;
        }

        .seller-sidebar.collapsed {
          width: 72px;
        }

        .seller-sidebar-header {
          padding: 24px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid #1e293b;
          overflow: hidden;
          white-space: nowrap;
        }

        .seller-sidebar-logo {
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.3rem;
          flex-shrink: 0;
        }

        .seller-sidebar-title-box {
          display: flex;
          flex-direction: column;
          transition: opacity 0.2s;
        }

        .seller-sidebar.collapsed .seller-sidebar-title-box {
          opacity: 0;
          width: 0;
          pointer-events: none;
        }

        .seller-sidebar-title {
          color: #f8fafc;
          font-weight: 700;
          font-size: 0.95rem;
        }

        .seller-sidebar-subtitle {
          font-size: 0.7rem;
          color: #64748b;
        }

        .seller-sidebar-menu {
          flex-grow: 1;
          padding: 20px 10px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .seller-sidebar-menu::-webkit-scrollbar {
          width: 4px;
        }
        .seller-sidebar-menu::-webkit-scrollbar-thumb {
          background-color: #334155;
          border-radius: 2px;
        }

        .seller-menu-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          background: none;
          color: #94a3b8;
          text-align: left;
          width: 100%;
        }

        .seller-menu-item:hover {
          color: #f1f5f9;
          background-color: #1e293b;
        }

        .seller-menu-item.active {
          color: #ffffff;
          background-color: #2563eb;
        }

        .seller-menu-item-left {
          display: flex;
          align-items: center;
          gap: 12px;
          white-space: nowrap;
        }

        .seller-menu-badge {
          background-color: #334155;
          color: #cbd5e1;
          font-size: 0.65rem;
          padding: 2px 6px;
          border-radius: 20px;
          font-weight: 700;
        }
        
        .seller-menu-item.active .seller-menu-badge {
          background-color: rgba(255, 255, 255, 0.25);
          color: #ffffff;
        }

        .seller-sidebar-footer {
          padding: 16px;
          border-top: 1px solid #1e293b;
          display: flex;
          align-items: center;
          gap: 10px;
          overflow: hidden;
        }

        .seller-footer-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #334155;
          color: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.85rem;
          flex-shrink: 0;
        }

        .seller-footer-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          white-space: nowrap;
        }

        .seller-sidebar.collapsed .seller-footer-info {
          display: none;
        }

        /* MAIN PANEL */
        .seller-main-panel {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        /* HEADER */
        .seller-top-bar {
          height: 70px;
          background-color: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          flex-shrink: 0;
          transition: background-color 0.3s, border-color 0.3s;
        }

        .dark .seller-top-bar {
          background-color: #0f172a;
          border-bottom-color: #1e293b;
        }

        .seller-top-bar-welcome {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .seller-welcome-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .dark .seller-welcome-title {
          color: #ffffff;
        }

        .seller-top-bar-actions {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .seller-search-box-wrapper {
          position: relative;
          width: 220px;
        }

        .seller-search-input {
          width: 100%;
          background-color: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 12px 8px 36px;
          font-size: 0.8rem;
          color: #334155;
          outline: none;
          transition: all 0.2s;
        }

        .dark .seller-search-input {
          background-color: #1e293b;
          border-color: #334155;
          color: #cbd5e1;
        }

        .seller-search-input:focus {
          background-color: #ffffff;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }

        .seller-top-icon-btn {
          background: none;
          border: none;
          color: #475569;
          position: relative;
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .dark .seller-top-icon-btn {
          color: #94a3b8;
        }

        .seller-top-icon-btn:hover {
          background-color: #f1f5f9;
        }

        .dark .seller-top-icon-btn:hover {
          background-color: #1e293b;
        }

        .seller-top-badge {
          position: absolute;
          top: 0;
          right: 0;
          background-color: #ef4444;
          color: white;
          font-size: 0.55rem;
          font-weight: 800;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid white;
        }

        .seller-profile-dropdown-wrapper {
          position: relative;
        }

        .seller-profile-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 8px;
          border-radius: 20px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .seller-profile-pill:hover {
          background-color: #f1f5f9;
        }

        .dark .seller-profile-pill:hover {
          background-color: #1e293b;
        }

        .seller-profile-dropdown {
          position: absolute;
          right: 0;
          top: 42px;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          width: 180px;
          padding: 8px 0;
          z-index: 100;
        }

        .dark .seller-profile-dropdown {
          background-color: #1e293b;
          border-color: #334155;
        }

        .seller-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 16px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #475569;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .dark .seller-dropdown-item {
          color: #cbd5e1;
        }

        .seller-dropdown-item:hover, .seller-message-dropdown-item:hover {
          background-color: #f1f5f9;
        }

        .dark .seller-dropdown-item:hover, .dark .seller-message-dropdown-item:hover {
          background-color: #334155;
        }

        /* SCROLL BODY */
        .seller-content-scroll {
          flex-grow: 1;
          overflow-y: auto;
          padding: 32px;
        }

        /* METRIC GRID */
        .seller-metrics-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }

        .seller-kpi-card {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: 0 1px 3px rgba(0,0,0,0.01), 0 2px 10px -2px rgba(0,0,0,0.02);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .dark .seller-kpi-card {
          background-color: #1e293b;
          border-color: #334155;
        }

        .seller-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.05);
        }

        .seller-kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .seller-kpi-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }

        .seller-kpi-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .seller-kpi-value {
          font-size: 1.6rem;
          font-weight: 800;
          color: #0f172a;
        }

        .dark .seller-kpi-value {
          color: #ffffff;
        }

        /* STANDARD CARD */
        .seller-card {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.01);
          margin-bottom: 24px;
          transition: background-color 0.3s, border-color 0.3s;
        }

        .dark .seller-card {
          background-color: #1e293b;
          border-color: #334155;
        }

        .seller-card-title {
          font-size: 1rem;
          font-weight: 800;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* TABLES */
        .seller-table-container {
          overflow-x: auto;
          width: 100%;
        }

        .seller-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.85rem;
        }

        .seller-table th {
          padding: 14px 16px;
          font-weight: 700;
          color: #475569;
          background-color: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .dark .seller-table th {
          color: #cbd5e1;
          background-color: #0f172a;
          border-bottom-color: #334155;
        }

        .seller-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #e2e8f0;
          color: #334155;
          vertical-align: middle;
        }

        .dark .seller-table td {
          color: #cbd5e1;
          border-bottom-color: #334155;
        }

        .seller-table tr:last-child td {
          border-bottom: none;
        }

        .seller-badge {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 12px;
          text-transform: uppercase;
          display: inline-block;
        }

        .seller-badge-success { background-color: #d1fae5; color: #065f46; }
        .seller-badge-warning { background-color: #fef3c7; color: #92400e; }
        .seller-badge-danger { background-color: #fee2e2; color: #991b1b; }
        .seller-badge-primary { background-color: #dbeafe; color: #1e40af; }

        /* INPUTS */
        .input-group {
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
        }

        .dark .input-label {
          color: #94a3b8;
        }

        .input-field {
          padding: 10px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.8rem;
          outline: none;
          background-color: #ffffff;
          color: #0f172a;
        }

        .dark .input-field {
          background-color: #0f172a;
          border-color: #334155;
          color: #ffffff;
        }

        .input-field:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }

        /* MODALS */
        .seller-modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 500;
        }

        .seller-modal-content {
          background-color: #ffffff;
          border-radius: 16px;
          width: 500px;
          max-width: 90%;
          max-height: 85vh;
          overflow-y: auto;
          padding: 24px;
          position: relative;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .dark .seller-modal-content {
          background-color: #1e293b;
          color: #f8fafc;
        }
      `}</style>

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className={`seller-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="seller-sidebar-header">
          <div className="seller-sidebar-logo" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ cursor: 'pointer' }}>
            {dashboard?.businessName?.[0]?.toUpperCase() || 'S'}
          </div>
          <div className="seller-sidebar-title-box">
            <span className="seller-sidebar-title">{dashboard?.businessName || 'Seller Hub'}</span>
            <span className="seller-sidebar-subtitle">Multi-vendor Portal</span>
          </div>
        </div>

        <nav className="seller-sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`seller-menu-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsFormOpen(false); // Close product form if open
                }}
              >
                <div className="seller-menu-item-left">
                  <Icon size={18} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </div>
                {!sidebarCollapsed && item.count !== undefined && item.count > 0 && (
                  <span className="seller-menu-badge">{item.count}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="seller-sidebar-footer">
          <div className="seller-footer-avatar">
            {user?.email?.[0]?.toUpperCase() || 'V'}
          </div>
          <div className="seller-footer-info">
            <span className="seller-footer-name">{user?.email?.split('@')[0]}</span>
            <span className="seller-footer-email" style={{ fontSize: '0.65rem' }}>{user?.email}</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT VIEWPORT */}
      <main className="seller-main-panel">
        
        {/* HEADER TOP BAR */}
        <header className="seller-top-bar">
          <div className="seller-top-bar-welcome">
            <h2 className="seller-welcome-title" style={{ textTransform: 'capitalize' }}>
              {activeTab.replace('_', ' ')}
            </h2>
          </div>

          <div className="seller-top-bar-actions">
            {/* Search */}
            <div className="seller-search-box-wrapper">
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type="text" className="seller-search-input" placeholder="Search Console..." />
            </div>

            {/* Dark Mode toggle */}
            <button className="seller-top-icon-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Messages Drawer trigger */}
            <div style={{ position: 'relative' }}>
              <button className="seller-top-icon-btn" onClick={() => { setShowMessages(!showMessages); setShowNotifications(false); }}>
                <Mail size={18} />
                <span className="seller-top-badge">1</span>
              </button>
              {showMessages && (
                <div className="seller-profile-dropdown" style={{ width: '260px', padding: '12px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>Messages</div>
                  <div 
                    onClick={() => { setActiveTab('messages'); setShowMessages(false); }}
                    className="seller-message-dropdown-item"
                    style={{ padding: '8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                  >
                    <div style={{ width: '8px', height: '8px', background: '#2563eb', borderRadius: '50%' }}></div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Anjali Sharma</div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Is the Indigo Saree pure silk?</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div style={{ position: 'relative' }}>
              <button className="seller-top-icon-btn" onClick={() => { setShowNotifications(!showNotifications); setShowMessages(false); }}>
                <Bell size={18} />
                <span className="seller-top-badge">2</span>
              </button>
              {showNotifications && (
                <div className="seller-profile-dropdown" style={{ width: '280px', padding: '12px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>Notifications</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '0.7rem', padding: '4px 0' }}>
                      <span style={{ fontWeight: 'bold' }}>New Order #1034</span> received from Meera Patel.
                    </div>
                    <div style={{ fontSize: '0.7rem', padding: '4px 0' }}>
                      <span style={{ fontWeight: 'bold', color: '#ef4444' }}>Low Stock Alert</span>: Sage Green Saree.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="seller-profile-dropdown-wrapper">
              <div className="seller-profile-pill" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  {dashboard?.businessName?.[0]?.toUpperCase() || 'S'}
                </div>
                <ChevronDown size={14} style={{ color: '#475569' }} />
              </div>

              {showProfileMenu && (
                <div className="seller-profile-dropdown">
                  <button className="seller-dropdown-item" onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }}>
                    <User size={16} /> Store Profile
                  </button>
                  <button className="seller-dropdown-item" onClick={() => { setActiveTab('security'); setShowProfileMenu(false); }}>
                    <ShieldCheck size={16} /> Security Settings
                  </button>
                  <div style={{ borderTop: '1px solid #e2e8f0', margin: '4px 0' }}></div>
                  <button className="seller-dropdown-item" onClick={onLogout} style={{ color: '#ef4444' }}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN PANEL CONTENT BODY */}
        <div className="seller-content-scroll">
          
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <RefreshCw size={36} className="spinner" style={{ animation: 'spin 1.2s linear infinite', color: '#2563eb' }} />
            </div>
          )}

          {!loading && (
            <>
              {/* TAB 1: DASHBOARD HOME */}
              {activeTab === 'dashboard' && (
                <div>
                  <div className="seller-metrics-row">
                    <div className="seller-kpi-card">
                      <div className="seller-kpi-header">
                        <span className="seller-kpi-label">Gross Revenue</span>
                        <div className="seller-kpi-icon-box" style={{ background: '#dbeafe', color: '#1e40af' }}>
                          <IndianRupee size={20} />
                        </div>
                      </div>
                      <span className="seller-kpi-value">₹{(dashboard?.totalRevenue || 0).toLocaleString('en-IN')}</span>
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold', marginTop: '6px' }}>+12.4% vs last week</span>
                    </div>

                    <div className="seller-kpi-card">
                      <div className="seller-kpi-header">
                        <span className="seller-kpi-label">Total Orders</span>
                        <div className="seller-kpi-icon-box" style={{ background: '#d1fae5', color: '#065f46' }}>
                          <ShoppingCart size={20} />
                        </div>
                      </div>
                      <span className="seller-kpi-value">{dashboard?.totalOrdersPlaced || 0}</span>
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold', marginTop: '6px' }}>{orders.filter(o => o.deliveryStatus === 'PENDING').length} Pending</span>
                    </div>

                    <div className="seller-kpi-card">
                      <div className="seller-kpi-header">
                        <span className="seller-kpi-label">Products Active</span>
                        <div className="seller-kpi-icon-box" style={{ background: '#fef3c7', color: '#92400e' }}>
                          <Package size={20} />
                        </div>
                      </div>
                      <span className="seller-kpi-value">{dashboard?.totalProducts || 0}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>Listings synced</span>
                    </div>

                    <div className="seller-kpi-card">
                      <div className="seller-kpi-header">
                        <span className="seller-kpi-label">Seller Rating</span>
                        <div className="seller-kpi-icon-box" style={{ background: '#fee2e2', color: '#991b1b' }}>
                          <Star size={20} />
                        </div>
                      </div>
                      <span className="seller-kpi-value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {dashboard?.sellerRating || '0.0'} <Star size={18} fill="#f59e0b" color="#f59e0b" />
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>Based on client reviews</span>
                    </div>
                  </div>

                  {/* Revenue Curve Visualization (SVG Line Chart) */}
                  <div className="seller-card">
                    <h3 className="seller-card-title"><TrendingUp size={18} style={{ color: '#2563eb' }} /> Revenue Performance Trends</h3>
                    <div style={{ height: '200px', width: '100%', position: 'relative', marginTop: '10px' }}>
                      <svg viewBox="0 0 500 150" style={{ width: '100%', height: '100%' }}>
                        <defs>
                          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Grid lines */}
                        <line x1="0" y1="30" x2="500" y2="30" stroke={darkMode ? '#334155' : '#e2e8f0'} strokeWidth="1" strokeDasharray="5,5" />
                        <line x1="0" y1="75" x2="500" y2="75" stroke={darkMode ? '#334155' : '#e2e8f0'} strokeWidth="1" strokeDasharray="5,5" />
                        <line x1="0" y1="120" x2="500" y2="120" stroke={darkMode ? '#334155' : '#e2e8f0'} strokeWidth="1" strokeDasharray="5,5" />
                        
                        {/* Area Spline */}
                        <path d="M 0 130 C 50 110, 100 80, 150 100 C 200 120, 250 50, 300 40 C 350 30, 400 90, 500 20 L 500 150 L 0 150 Z" fill="url(#gradient)" />
                        
                        {/* Curve Spline */}
                        <path d="M 0 130 C 50 110, 100 80, 150 100 C 200 120, 250 50, 300 40 C 350 30, 400 90, 500 20" fill="none" stroke="#2563eb" strokeWidth="3" />
                        
                        {/* Points */}
                        <circle cx="150" cy="100" r="4" fill="#2563eb" />
                        <circle cx="300" cy="40" r="4" fill="#2563eb" />
                        <circle cx="500" cy="20" r="4" fill="#2563eb" />
                      </svg>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>
                        <span>Week 1</span>
                        <span>Week 2</span>
                        <span>Week 3</span>
                        <span>Week 4</span>
                      </div>
                    </div>
                  </div>

                  {/* Top Products Carousel / List */}
                  <div className="seller-card">
                    <h3 className="seller-card-title"><Package size={18} style={{ color: '#2563eb' }} /> Top Performing Products</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                      {dashboard?.topProducts?.slice(0, 4).map((p) => {
                        const img = p.productImages?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';
                        return (
                          <div key={p.productId || p.id} className="seller-kpi-card" style={{ padding: '12px' }}>
                            <img src={img} alt={p.productName} style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }} />
                            <div style={{ fontWeight: 'bold', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.productName}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>Rating: {p.ratings || '5.0'} ⭐</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563eb', marginTop: '6px' }}>₹{p.price}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRODUCT MANAGEMENT */}
              {activeTab === 'products' && (
                <div className="seller-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 className="seller-card-title" style={{ margin: 0 }}><Package size={18} style={{ color: '#2563eb' }} /> Product Catalog</h3>
                    <button className="btn btn-primary" onClick={handleOpenAddForm} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                      <Plus size={14} /> Add Product
                    </button>
                  </div>

                  <div className="seller-table-container">
                    {(!dashboard?.topProducts || dashboard.topProducts.length === 0) ? (
                      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        No products registered. Click Add Product to get started!
                      </div>
                    ) : (
                      <table className="seller-table">
                        <thead>
                          <tr>
                            <th>Image</th>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>SKU</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboard.topProducts.map((p) => {
                            const img = p.productImages?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';
                            return (
                              <tr key={p.productId || p.id}>
                                <td>
                                  <img src={img} alt={p.productName} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                                </td>
                                <td style={{ fontWeight: 'bold' }}>{p.productName}</td>
                                <td>{p.category}</td>
                                <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{p.sku}</td>
                                <td style={{ fontWeight: 800 }}>₹{p.price}</td>
                                <td>
                                  <span className={`seller-badge ${p.stockQuantity <= 5 ? 'seller-badge-danger' : 'seller-badge-success'}`}>
                                    {p.stockQuantity} Left
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="seller-top-icon-btn" onClick={() => handleOpenEditForm(p)} style={{ color: '#2563eb' }}>
                                      <Edit size={16} />
                                    </button>
                                    <button className="seller-top-icon-btn" onClick={() => handleDeleteProduct(p.productId || p.id)} style={{ color: '#ef4444' }}>
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
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

              {/* TAB 3: ORDER MANAGEMENT */}
              {activeTab === 'orders' && (
                <div className="seller-card">
                  <h3 className="seller-card-title"><ShoppingCart size={18} style={{ color: '#2563eb' }} /> Fulfill Customer Orders</h3>
                  
                  <div className="seller-table-container">
                    {orders.length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        No orders placed yet.
                      </div>
                    ) : (
                      <table className="seller-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Product Details</th>
                            <th>Total Amount</th>
                            <th>Payment Status</th>
                            <th>Delivery Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((o) => {
                            const isEditing = updatingOrderId === o.orderId;
                            return (
                              <tr key={o.orderId}>
                                <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>#{o.orderId}</td>
                                <td>
                                  <div style={{ fontWeight: 'bold' }}>{o.customerName || 'Client'}</div>
                                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{o.shippingAddress}</div>
                                </td>
                                <td>
                                  {o.items?.map((item, idx) => (
                                    <div key={idx} style={{ fontSize: '0.75rem' }}>
                                      {item.productName} <span style={{ fontWeight: 'bold' }}>x{item.quantity}</span>
                                    </div>
                                  )) || 'Multi-Item Saree Package'}
                                </td>
                                <td style={{ fontWeight: 800 }}>₹{o.totalAmount}</td>
                                <td>
                                  {isEditing ? (
                                    <select
                                      className="input-field"
                                      value={tempPaymentStatus}
                                      onChange={(e) => setTempPaymentStatus(e.target.value)}
                                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                    >
                                      <option value="PENDING">Pending</option>
                                      <option value="PAID">Paid</option>
                                      <option value="FAILED">Failed</option>
                                      <option value="REFUNDED">Refunded</option>
                                    </select>
                                  ) : (
                                    <span className={`seller-badge ${o.paymentStatus === 'PAID' ? 'seller-badge-success' : o.paymentStatus === 'FAILED' ? 'seller-badge-danger' : 'seller-badge-warning'}`}>
                                      {o.paymentStatus}
                                    </span>
                                  )}
                                </td>
                                <td>
                                  {isEditing ? (
                                    <select
                                      className="input-field"
                                      value={tempDeliveryStatus}
                                      onChange={(e) => setTempDeliveryStatus(e.target.value)}
                                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                    >
                                      <option value="PENDING">Pending</option>
                                      <option value="PROCESSING">Processing</option>
                                      <option value="SHIPPED">Shipped</option>
                                      <option value="DELIVERED">Delivered</option>
                                      <option value="CANCELLED">Cancelled</option>
                                    </select>
                                  ) : (
                                    <span className={`seller-badge ${o.deliveryStatus === 'DELIVERED' ? 'seller-badge-success' : o.deliveryStatus === 'CANCELLED' ? 'seller-badge-danger' : o.deliveryStatus === 'SHIPPED' ? 'seller-badge-primary' : 'seller-badge-warning'}`}>
                                      {o.deliveryStatus}
                                    </span>
                                  )}
                                </td>
                                <td>
                                  {isEditing ? (
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                      <button className="seller-top-icon-btn" onClick={() => saveOrderStatus(o.orderId)} style={{ color: '#10b981' }}>
                                        <Save size={16} />
                                      </button>
                                      <button className="seller-top-icon-btn" onClick={() => setUpdatingOrderId(null)} style={{ color: '#ef4444' }}>
                                        <X size={16} />
                                      </button>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                      <button className="btn btn-secondary" onClick={() => startEditOrder(o)} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                                        Update
                                      </button>
                                      <button className="seller-top-icon-btn" onClick={() => alert('PDF invoice download triggered.')} style={{ color: '#64748b' }}>
                                        <FileText size={16} />
                                      </button>
                                    </div>
                                  )}
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

              {/* TAB 4: ANALYTICS & REPORTS */}
              {activeTab === 'analytics' && (
                <div className="seller-card">
                  <h3 className="seller-card-title"><TrendingUp size={18} style={{ color: '#2563eb' }} /> Sales Performance & Demographics</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginTop: '16px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '10px' }}>Weekly Conversion Rates</div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', height: '140px', gap: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                        <div style={{ flex: 1, background: '#2563eb', height: '40%', borderRadius: '4px 4px 0 0' }}></div>
                        <div style={{ flex: 1, background: '#2563eb', height: '65%', borderRadius: '4px 4px 0 0' }}></div>
                        <div style={{ flex: 1, background: '#2563eb', height: '50%', borderRadius: '4px 4px 0 0' }}></div>
                        <div style={{ flex: 1, background: '#2563eb', height: '85%', borderRadius: '4px 4px 0 0' }}></div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>
                        <span>Week 1 (1.8%)</span>
                        <span>Week 2 (2.4%)</span>
                        <span>Week 3 (2.0%)</span>
                        <span>Week 4 (2.8%)</span>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '10px' }}>Top Categories Distribution</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                            <span>Sarees</span>
                            <span style={{ fontWeight: 'bold' }}>65%</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: '65%', height: '100%', background: '#2563eb' }}></div>
                          </div>
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                            <span>Lehengas</span>
                            <span style={{ fontWeight: 'bold' }}>20%</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: '20%', height: '100%', background: '#10b981' }}></div>
                          </div>
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                            <span>Salwar Kameez</span>
                            <span style={{ fontWeight: 'bold' }}>15%</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: '15%', height: '100%', background: '#d97706' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-secondary" onClick={() => alert('PDF report compiler launched.')} style={{ marginTop: '24px', fontSize: '0.8rem' }}>
                    Export Monthly Performance PDF
                  </button>
                </div>
              )}

              {/* TAB 5: WALLET & EARNINGS */}
              {activeTab === 'wallet' && (
                <div>
                  <div className="seller-metrics-row">
                    <div className="seller-kpi-card" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', color: 'white' }}>
                      <span className="seller-kpi-label" style={{ color: '#93c5fd' }}>Withdrawable Balance</span>
                      <span className="seller-kpi-value" style={{ color: 'white', marginTop: '10px', fontSize: '2rem' }}>₹{(dashboard?.totalRevenue || 0).toLocaleString('en-IN')}.00</span>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => setWithdrawModalOpen(true)} 
                        style={{ marginTop: '20px', background: '#ffffff', color: '#2563eb', border: 'none', fontWeight: 'bold' }}
                      >
                        Withdraw Funds
                      </button>
                    </div>

                    <div className="seller-kpi-card">
                      <span className="seller-kpi-label">Ledger Clearance Status</span>
                      <span className="seller-kpi-value" style={{ color: '#10b981' }}>100% Cleared</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '10px' }}>Platform commission fixed at 8.5%</span>
                    </div>
                  </div>

                  <div className="seller-card">
                    <h3 className="seller-card-title"><IndianRupee size={18} style={{ color: '#2563eb' }} /> Withdrawal History</h3>
                    <table className="seller-table">
                      <thead>
                        <tr>
                          <th>Transaction ID</th>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Payout Method</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {withdrawHistory.map((w, idx) => (
                          <tr key={idx}>
                            <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{w.id}</td>
                            <td>{w.date}</td>
                            <td style={{ fontWeight: 'bold' }}>₹{w.amount.toLocaleString('en-IN')}</td>
                            <td>{w.method}</td>
                            <td>
                              <span className={`seller-badge ${w.status === 'Completed' ? 'seller-badge-success' : 'seller-badge-warning'}`}>
                                {w.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: REVIEWS & RATINGS */}
              {activeTab === 'reviews' && (
                <div className="seller-card">
                  <h3 className="seller-card-title"><Star size={18} style={{ color: '#2563eb' }} /> Customer Reviews Feed</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {reviewsList.map((r) => (
                      <div key={r.id} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{r.author}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.date}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', margin: '4px 0', color: '#f59e0b' }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={14} fill={i < Math.floor(r.rating) ? '#f59e0b' : 'none'} color="#f59e0b" />
                          ))}
                          <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '6px' }}>({r.product})</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#475569', marginTop: '6px' }}>{r.comment}</p>
                        
                        {r.reply ? (
                          <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', marginTop: '8px', borderLeft: '3px solid #2563eb', fontSize: '0.75rem' }}>
                            <span style={{ fontWeight: 'bold' }}>Your response: </span> {r.reply}
                          </div>
                        ) : (
                          <div style={{ marginTop: '8px' }}>
                            {replyingToReviewId === r.id ? (
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                  type="text"
                                  className="input-field"
                                  placeholder="Write a professional reply..."
                                  value={reviewReplyText}
                                  onChange={(e) => setReviewReplyText(e.target.value)}
                                  style={{ flexGrow: 1 }}
                                />
                                <button className="btn btn-primary" onClick={() => submitReviewReply(r.id)} style={{ padding: '8px 12px', fontSize: '0.75rem' }}>Reply</button>
                                <button className="btn btn-secondary" onClick={() => setReplyingToReviewId(null)} style={{ padding: '8px 12px', fontSize: '0.75rem' }}>Cancel</button>
                              </div>
                            ) : (
                              <button className="btn btn-secondary" onClick={() => { setReplyingToReviewId(r.id); setReviewReplyText(''); }} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                                Reply to Review
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: COUPONS & DISCOUNTS */}
              {activeTab === 'coupons' && (
                <div className="seller-card">
                  <h3 className="seller-card-title"><Percent size={18} style={{ color: '#2563eb' }} /> Active Discount Campaigns</h3>
                  <form onSubmit={handleAddCoupon} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '24px' }}>
                    <div className="input-group" style={{ margin: 0, flex: 1 }}>
                      <label className="input-label">Promo Code</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="e.g. FESTIVE50" 
                        value={couponCode} 
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                    </div>
                    <div className="input-group" style={{ margin: 0, width: '120px' }}>
                      <label className="input-label">Value</label>
                      <select className="input-field" value={couponDiscount} onChange={(e) => setCouponDiscount(e.target.value)}>
                        <option value="10%">10% Off</option>
                        <option value="20%">20% Off</option>
                        <option value="30%">30% Off</option>
                        <option value="50%">50% Off</option>
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ height: '38px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Plus size={16} /> Create Code
                    </button>
                  </form>

                  <table className="seller-table">
                    <thead>
                      <tr>
                        <th>Campaign Code</th>
                        <th>Type</th>
                        <th>Benefit Value</th>
                        <th>Total Usage</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {couponsList.map((c, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{c.code}</td>
                          <td>{c.type}</td>
                          <td style={{ fontWeight: 'bold', color: '#2563eb' }}>{c.value}</td>
                          <td>{c.count} checkouts</td>
                          <td>
                            <span className="seller-badge seller-badge-success">{c.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 8: NOTIFICATIONS CENTER */}
              {activeTab === 'notifications' && (
                <div className="seller-card">
                  <h3 className="seller-card-title"><Bell size={18} style={{ color: '#2563eb' }} /> Activity Notifications</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="seller-kpi-card" style={{ padding: '14px', borderLeft: '4px solid #2563eb' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>New Order Received</div>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Order #1034 has been registered for fullfilment.</p>
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8', alignSelf: 'flex-end' }}>2 mins ago</span>
                    </div>
                    <div className="seller-kpi-card" style={{ padding: '14px', borderLeft: '4px solid #ef4444' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#ef4444' }}>Critical stock alert</div>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Product Sage Green Silk Saree has fallen below threshold value.</p>
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8', alignSelf: 'flex-end' }}>1 hour ago</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 9: CUSTOMER MESSAGES */}
              {activeTab === 'messages' && (
                <div className="seller-card" style={{ padding: '0', display: 'flex', height: '400px', overflow: 'hidden' }}>
                  <div style={{ width: '200px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px', fontWeight: 'bold', fontSize: '0.85rem', borderBottom: '1px solid #e2e8f0' }}>Chats</div>
                    <div style={{ padding: '12px 16px', background: '#f1f5f9', fontWeight: 'bold', fontSize: '0.75rem', cursor: 'pointer' }}>
                      {activeChatUser}
                    </div>
                  </div>
                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px', fontWeight: 'bold', fontSize: '0.85rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                      {activeChatUser}
                    </div>
                    <div style={{ flexGrow: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {chatMessages.map((msg, idx) => (
                        <div 
                          key={idx} 
                          style={{
                            alignSelf: msg.sender === 'seller' ? 'flex-end' : 'flex-start',
                            background: msg.sender === 'seller' ? '#2563eb' : '#f1f5f9',
                            color: msg.sender === 'seller' ? 'white' : '#0f172a',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            maxWidth: '70%',
                            fontSize: '0.8rem'
                          }}
                        >
                          {msg.text}
                          <div style={{ fontSize: '0.6rem', color: msg.sender === 'seller' ? '#bfdbfe' : '#64748b', textAlign: 'right', marginTop: '4px' }}>{msg.time}</div>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={sendChatMessage} style={{ padding: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Write message..." 
                        value={newChatText} 
                        onChange={(e) => setNewChatText(e.target.value)}
                        style={{ flexGrow: 1 }}
                      />
                      <button type="submit" className="btn btn-primary" style={{ padding: '0 12px' }}><Send size={16} /></button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 10: SELLER PROFILE & SETTINGS */}
              {activeTab === 'settings' && (
                <div className="seller-card">
                  <h3 className="seller-card-title"><Settings size={18} style={{ color: '#2563eb' }} /> Store Configuration & Settings</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="input-group">
                      <label className="input-label">Vendor Business Brand Name</label>
                      <input type="text" className="input-field" defaultValue={dashboard?.businessName || 'Puma'} readOnly />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Registered GST/Tax Number</label>
                      <input type="text" className="input-field" defaultValue="22AAAAA0000A1Z5" readOnly />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Warehouse Address</label>
                      <input type="text" className="input-field" defaultValue="Eco Park Logistic, Bay 4, Gurgaon" />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Bank Settlement Details</label>
                      <input type="text" className="input-field" defaultValue="HDFC bank, A/C: 5010022334455, IFSC: HDFC0000123" />
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={() => alert('Settings saved successfully.')} style={{ marginTop: '20px', fontSize: '0.8rem' }}>
                    Save Settings Configuration
                  </button>
                </div>
              )}

              {/* TAB 11: SHIPPING & DELIVERY */}
              {activeTab === 'shipping' && (
                <div className="seller-card">
                  <h3 className="seller-card-title"><Truck size={18} style={{ color: '#2563eb' }} /> Shipments & Logistical Zones</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '8px' }}>Delivery Charges Config</div>
                      <div className="input-group">
                        <label className="input-label">Domestic Flat Rate (₹)</label>
                        <input type="number" className="input-field" defaultValue="100" />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Threshold for Free Shipping (₹)</label>
                        <input type="number" className="input-field" defaultValue="5000" />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '12px' }}>Transit Integration Partners</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f8fafc', borderRadius: '6px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>FedEx Cargo Express</span>
                          <span className="seller-badge seller-badge-success">Linked</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f8fafc', borderRadius: '6px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>BlueDart Indian Post</span>
                          <span className="seller-badge seller-badge-success">Linked</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 12: INVENTORY MANAGEMENT */}
              {activeTab === 'inventory' && (
                <div className="seller-card">
                  <h3 className="seller-card-title"><AlertTriangle size={18} style={{ color: '#d97706' }} /> Automated Inventory Alerts</h3>
                  <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    <AlertTriangle style={{ color: '#d97706' }} />
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#92400e' }}>Critical Low Stock Warning</div>
                      <div style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '2px' }}>You have 2 products with stock counts below 5 units. Please restock soon.</div>
                    </div>
                  </div>
                  <table className="seller-table">
                    <thead>
                      <tr>
                        <th>Product SKU</th>
                        <th>Name</th>
                        <th>Stock Remaining</th>
                        <th>Threshold Alert</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontFamily: 'monospace' }}>SKU-BANARASI-INDIGO</td>
                        <td>Royal Indigo Silk Banarasi Saree</td>
                        <td style={{ color: '#ef4444', fontWeight: 'bold' }}>3 Left</td>
                        <td>Triggered (&lt; 5)</td>
                      </tr>
                      <tr>
                        <td style={{ fontFamily: 'monospace' }}>SKU-SAREE-01</td>
                        <td>Sage Green Silk Saree</td>
                        <td style={{ color: '#ef4444', fontWeight: 'bold' }}>1 Left</td>
                        <td>Triggered (&lt; 5)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 13: MARKETING TOOLS */}
              {activeTab === 'marketing' && (
                <div className="seller-card">
                  <h3 className="seller-card-title"><Megaphone size={18} style={{ color: '#2563eb' }} /> Sponsored Product Boosts</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="seller-kpi-card" style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Active Ad Budget</div>
                      <span className="seller-kpi-value" style={{ fontSize: '1.4rem', marginTop: '6px' }}>₹2,500.00 / day</span>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button className="btn btn-primary" onClick={() => alert('Daily budget limit increased.')} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Increase Limit</button>
                      </div>
                    </div>
                    <div className="seller-kpi-card" style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Product Impression Clicks</div>
                      <span className="seller-kpi-value" style={{ fontSize: '1.4rem', marginTop: '6px' }}>4,209 clicks</span>
                      <span style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '6px', fontWeight: 'bold' }}>+20.4% Sponsored Conversion</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 14: SECURITY FEATURES */}
              {activeTab === 'security' && (
                <div className="seller-card">
                  <h3 className="seller-card-title"><ShieldCheck size={18} style={{ color: '#2563eb' }} /> Verification & Login Security</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Two-Factor App Authentication (2FA)</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Use an authenticator application to verify login attempts.</div>
                      </div>
                      <div>
                        {twoFactorEnabled ? (
                          <span className="seller-badge seller-badge-success">Enabled</span>
                        ) : (
                          <button className="btn btn-primary" onClick={() => setShow2faSetup(true)} style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                            Setup 2FA
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '8px' }}>Store Verification Credentials</div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', flex: 1 }}>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>GST Registration Certificate</div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#10b981', marginTop: '2px' }}>VERIFIED APPROVED</div>
                        </div>
                        <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', flex: 1 }}>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Identity Verification (KYC)</div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#10b981', marginTop: '2px' }}>VERIFIED APPROVED</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* 2FA SETUP MODAL */}
      {show2faSetup && (
        <div className="seller-modal-overlay">
          <div className="seller-modal-content">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '12px' }}>Setup Two-Factor Authentication</h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '16px' }}>Scan the QR code below or enter the security code into Google Authenticator app, then confirm the PIN.</p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: '#f1f5f9', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '1px solid #cbd5e1' }}>
                QR Code Mockup
              </div>
              <code style={{ fontSize: '0.75rem', padding: '4px 8px', background: '#f8fafc', borderRadius: '4px' }}>SECRETKEY-VENDORS-AUTH</code>
            </div>
            <form onSubmit={handle2faVerify}>
              <div className="input-group">
                <label className="input-label">Enter 6-digit confirmation PIN</label>
                <input 
                  type="text" 
                  maxLength={6} 
                  className="input-field" 
                  placeholder="e.g. 123456" 
                  value={securityCode} 
                  onChange={(e) => setSecurityCode(e.target.value.replace(/\D/g, ''))}
                  required 
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Enable 2FA</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShow2faSetup(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WITHDRAWAL DIALOG MODAL */}
      {withdrawModalOpen && (
        <div className="seller-modal-overlay">
          <div className="seller-modal-content">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '12px' }}>Withdraw Earnings Payout</h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '16px' }}>Specify the amount you want to withdraw. The settlement takes 1-2 business days to clear into your bank account.</p>
            <form onSubmit={handleWithdrawalRequest}>
              <div className="input-group">
                <label className="input-label">Withdrawal Amount (₹)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="e.g. 10000" 
                  value={withdrawAmount} 
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={dashboard?.totalRevenue || 45000}
                  required 
                />
                <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>Available Balance: ₹{(dashboard?.totalRevenue || 0).toLocaleString('en-IN')}.00</span>
              </div>
              <div className="input-group">
                <label className="input-label">Settlement Bank Account</label>
                <input type="text" className="input-field" value="HDFC Bank - A/C 4555" readOnly />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={withdrawStatus === 'loading'}>
                  {withdrawStatus === 'loading' ? 'Settling Transfer...' : 'Initiate Payout'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setWithdrawModalOpen(false)} disabled={withdrawStatus === 'loading'}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT FORM SLIDE DRAWERS OVERLAY */}
      {isFormOpen && (
        <div className="seller-modal-overlay">
          <div className="seller-modal-content" style={{ width: '600px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlusCircle size={22} style={{ color: '#2563eb' }} />
              {editingProduct ? 'Edit Catalog Listing' : 'Publish New Product'}
            </h3>
            
            <form onSubmit={handleProductSubmit}>
              <div className="input-group">
                <label className="input-label">Product Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Royal Indigo Silk Banarasi Saree"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Detailed description of materials, craft details, design highlights..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ resize: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select
                    className="input-field"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Sarees">Sarees</option>
                    <option value="Salwar Kameez">Salwar Kameez</option>
                    <option value="Lehengas">Lehengas</option>
                    <option value="Indo Western">Indo Western</option>
                    <option value="Men">Men</option>
                    <option value="Kids">Kids</option>
                    <option value="Jewellery">Jewellery</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Brand</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Jaypore Luxe"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Price (₹)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="5999"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Discount Price (₹)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="e.g. 4999"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Stock Quantity</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="25"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">SKU ID</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    style={{ flexGrow: 1 }}
                    required
                  />
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setFormData({ ...formData, sku: 'SKU-' + Math.floor(Math.random() * 900000 + 100000) })}
                    style={{ fontSize: '0.75rem', padding: '0 12px' }}
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Product Image URLs (Comma Separated)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="https://image1.jpg, https://image2.jpg"
                  value={formData.productImages}
                  onChange={(e) => setFormData({ ...formData, productImages: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Specifications (Format: Key: Value, Key: Value)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Fabric: Silk, Origin: India, Print: Hand block"
                  value={formData.specificationsText}
                  onChange={(e) => setFormData({ ...formData, specificationsText: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Delivery Policy Info</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.deliveryInfo}
                  onChange={(e) => setFormData({ ...formData, deliveryInfo: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingProduct ? 'Update Product Details' : 'Publish Catalog Item'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
