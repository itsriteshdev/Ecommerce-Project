import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Megaphone,
  Percent,
  FolderTree,
  MessageSquare,
  RotateCcw,
  Ticket,
  Settings,
  Search,
  Bell,
  Mail,
  Plus,
  X,
  Check,
  Trash2,
  Edit,
  ShieldAlert,
  ExternalLink,
  Lock,
  Unlock,
  Calendar,
  DollarSign,
  Filter,
  RefreshCw
} from 'lucide-react';
import { api } from '../api';

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  
  // Panel States
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sellers, setSellers] = useState([]);

  // Search/Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Detail/Action Modal States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingId, setTrackingId] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  
  // Coupon Form States
  const [isCouponFormOpen, setIsCouponFormOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [couponFormError, setCouponFormError] = useState('');

  // Top Bar Dropdowns
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Settings mock states
  const [settingsData, setSettingsData] = useState({
    storeName: 'Frais Organics Admin',
    supportEmail: 'admin@frais.com',
    currency: 'INR',
    maintenanceMode: false,
    autoApproveSellers: false
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    else if (activeTab === 'products') fetchProducts();
    else if (activeTab === 'customers') fetchCustomers();
    else if (activeTab === 'coupons' || activeTab === 'discounts') fetchCoupons();
    else if (activeTab === 'reviews') fetchReviews();
    else if (activeTab === 'categories') fetchCategories();
    else if (activeTab === 'returns') fetchOrders(); // Returns are managed via cancelled orders
    else if (activeTab === 'dashboard') {
      fetchDashboardStats();
      fetchCoupons(); // For coupon counts
    }
  }, [activeTab]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminDashboardStats();
      setStats(res);
      // Fetch sellers too for metrics compatibility
      const sellRes = await api.getAllSellers();
      setSellers(sellRes || []);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminOrders();
      setOrders(res || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminProducts();
      setProducts(res || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminCustomers();
      setCustomers(res || []);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.getAllCoupons();
      setCoupons(res || []);
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminReviews();
      setReviews(res || []);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminCategories();
      setCategories(res || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const handleVerifySeller = async (sellerId, status) => {
    if (!window.confirm(`Update status of seller #${sellerId} to ${status}?`)) return;
    try {
      await api.verifySeller(sellerId, status);
      // Refresh sellers
      const sellRes = await api.getAllSellers();
      setSellers(sellRes || []);
      fetchDashboardStats();
    } catch (err) {
      alert(err.message || 'Failed to update seller status');
    }
  };

  const handleToggleCustomerStatus = async (customerId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!window.confirm(`Are you sure you want to change the customer status to ${nextStatus}?`)) return;
    try {
      await api.toggleCustomerStatus(customerId, nextStatus);
      fetchCustomers();
    } catch (err) {
      alert(err.message || 'Failed to toggle account status');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Delete this product catalog listing permanently?')) return;
    try {
      await api.deleteProductAdmin(productId);
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this product review comment?')) return;
    try {
      await api.deleteReviewAdmin(reviewId);
      fetchReviews();
    } catch (err) {
      alert(err.message || 'Failed to delete review');
    }
  };

  const handleUpdateOrderDetails = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      // Update delivery & payment status
      await api.updateOrderStatus(selectedOrder.orderId, deliveryStatus, paymentStatus);
      
      // Update tracking ID locally/simulate if not fully supported, or we can use our endpoint
      // Let's close modal and refresh
      setSelectedOrder(null);
      fetchOrders();
      fetchDashboardStats();
    } catch (err) {
      alert(err.message || 'Failed to save order updates');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setCouponFormError('');
    if (!couponCode.trim()) {
      setCouponFormError('Coupon code is required');
      return;
    }
    if (!discountPercentage || Number(discountPercentage) <= 0 || Number(discountPercentage) > 100) {
      setCouponFormError('Discount percentage must be 1-100');
      return;
    }
    if (!expiryDate) {
      setCouponFormError('Expiry date is required');
      return;
    }
    try {
      await api.createCoupon({
        code: couponCode.toUpperCase().trim(),
        discountPercentage: Number(discountPercentage),
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        expiryDate: new Date(expiryDate).toISOString(),
        active: true
      });
      setIsCouponFormOpen(false);
      setCouponCode('');
      setDiscountPercentage('');
      setMaxDiscountAmount('');
      setExpiryDate('');
      fetchCoupons();
    } catch (err) {
      setCouponFormError(err.message || 'Failed to generate promo code');
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Permanently delete this discount coupon?')) return;
    try {
      await api.deleteCoupon(couponId);
      fetchCoupons();
    } catch (err) {
      alert(err.message || 'Failed to delete coupon');
    }
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setTrackingId(order.trackingId || '');
    setDeliveryStatus(order.deliveryStatus || 'PENDING');
    setPaymentStatus(order.paymentStatus || 'PENDING');
  };

  // Helper selectors / counts
  const pendingSellers = sellers.filter(s => s.verificationStatus === 'PENDING');
  const activeCoupons = coupons.filter(c => c.active && new Date(c.expiryDate) > new Date());
  
  // Custom HSL theme variables
  const sidebarTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: orders.filter(o => o.deliveryStatus === 'PENDING').length || 32 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'discounts', label: 'Discounts', icon: Percent },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'returns', label: 'Returns', icon: RotateCcw },
    { id: 'coupons', label: 'Coupons', icon: Ticket },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="admin-viewport-wrapper">
      <style>{`
        /* Embedded CSS overrides to style this specifically like the mockup */
        .admin-viewport-wrapper {
          display: flex;
          height: 100vh;
          width: 100vw;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: #f6f8fb;
          color: #1e293b;
          overflow: hidden;
        }

        /* SIDEBAR STYLE */
        .admin-sidebar {
          width: 260px;
          background-color: #0f172a;
          color: #94a3b8;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #1e293b;
          flex-shrink: 0;
          height: 100%;
        }

        .admin-sidebar-header {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid #1e293b;
        }

        .admin-sidebar-logo {
          background-color: #635bff;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.25rem;
        }

        .admin-sidebar-title-box {
          display: flex;
          flex-direction: column;
        }

        .admin-sidebar-title {
          color: #f8fafc;
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: 0.02em;
        }

        .admin-sidebar-subtitle {
          font-size: 0.7rem;
          color: #64748b;
          font-weight: 500;
        }

        .admin-sidebar-menu {
          flex-grow: 1;
          padding: 20px 14px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .admin-sidebar-menu::-webkit-scrollbar {
          width: 4px;
        }
        .admin-sidebar-menu::-webkit-scrollbar-thumb {
          background-color: #334155;
          border-radius: 2px;
        }

        .admin-menu-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 16px;
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

        .admin-menu-item:hover {
          color: #f1f5f9;
          background-color: #1e293b;
        }

        .admin-menu-item.active {
          color: #ffffff;
          background-color: #635bff;
        }

        .admin-menu-item-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .admin-menu-badge {
          background-color: #334155;
          color: #cbd5e1;
          font-size: 0.7rem;
          padding: 2px 8px;
          border-radius: 20px;
          font-weight: 700;
        }
        
        .admin-menu-item.active .admin-menu-badge {
          background-color: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }

        .admin-sidebar-upgrade-card {
          margin: 14px;
          background: linear-gradient(135deg, #1e1b4b 0%, #311042 100%);
          border: 1px solid #312e81;
          border-radius: 12px;
          padding: 16px;
          position: relative;
          overflow: hidden;
        }

        .admin-sidebar-upgrade-card::before {
          content: '';
          position: absolute;
          width: 80px;
          height: 80px;
          background-color: #635bff;
          border-radius: 50%;
          filter: blur(40px);
          top: -20px;
          right: -20px;
          opacity: 0.3;
        }

        .admin-upgrade-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .admin-upgrade-desc {
          font-size: 0.7rem;
          color: #94a3b8;
          line-height: 1.4;
          margin-bottom: 12px;
        }

        .btn-upgrade-now {
          background-color: #635bff;
          color: white;
          border: none;
          width: 100%;
          padding: 8px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.75rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-upgrade-now:hover {
          background-color: #4f46e5;
        }

        .admin-sidebar-footer {
          padding: 16px 20px;
          border-top: 1px solid #1e293b;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .admin-footer-profile {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .admin-footer-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #334155;
        }

        .admin-footer-info {
          display: flex;
          flex-direction: column;
        }

        .admin-footer-name {
          color: #f8fafc;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .admin-footer-email {
          color: #64748b;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .admin-footer-status {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.65rem;
          color: #10b981;
          font-weight: 700;
          margin-top: 2px;
        }

        .admin-footer-dot {
          width: 6px;
          height: 6px;
          background-color: #10b981;
          border-radius: 50%;
        }

        /* MAIN CONTENT AREA */
        .admin-main-panel {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        /* TOP BAR */
        .admin-top-bar {
          height: 70px;
          background-color: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          flex-shrink: 0;
        }

        .admin-top-bar-welcome {
          display: flex;
          flex-direction: column;
        }

        .admin-welcome-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .admin-welcome-subtitle {
          font-size: 0.8rem;
          color: #64748b;
          margin-top: 2px;
        }

        .admin-top-bar-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .admin-search-box-wrapper {
          position: relative;
          width: 240px;
        }

        .admin-search-input {
          width: 100%;
          background-color: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 36px 8px 12px;
          font-size: 0.8rem;
          color: #334155;
          outline: none;
          transition: all 0.2s;
        }

        .admin-search-input:focus {
          background-color: #ffffff;
          border-color: #635bff;
          box-shadow: 0 0 0 3px rgba(99, 91, 255, 0.15);
        }

        .admin-search-shortcut {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.65rem;
          color: #94a3b8;
          background-color: #e2e8f0;
          padding: 2px 4px;
          border-radius: 4px;
          pointer-events: none;
          font-weight: bold;
        }

        .admin-top-icon-btn {
          background: none;
          border: none;
          color: #475569;
          position: relative;
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .admin-top-icon-btn:hover {
          background-color: #f1f5f9;
          color: #0f172a;
        }

        .admin-top-badge {
          position: absolute;
          top: 0;
          right: 0;
          background-color: #ef4444;
          color: white;
          font-size: 0.6rem;
          font-weight: 800;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .admin-date-picker-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .admin-date-picker-btn:hover {
          border-color: #cbd5e1;
        }

        /* VIEWPORT CONTENT CONTAINER */
        .admin-content-scroll {
          flex-grow: 1;
          overflow-y: auto;
          padding: 32px;
        }

        /* METRIC CARDS ROW */
        .admin-metrics-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }

        .admin-kpi-card {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02), 0 2px 12px -2px rgba(50,50,93,0.03);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .admin-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px -2px rgba(50, 50, 93, 0.06), 0 2px 8px -1px rgba(0, 0, 0, 0.04);
        }

        .admin-kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .admin-kpi-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .admin-kpi-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .admin-kpi-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.1;
          margin-bottom: 6px;
        }

        .admin-kpi-trend {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .trend-up {
          color: #10b981;
        }
        .trend-down {
          color: #ef4444;
        }

        .trend-neutral {
          color: #64748b;
        }

        .admin-kpi-sparkline {
          margin-top: 10px;
          height: 30px;
          width: 100%;
        }

        /* GRID LAYOUT FOR CHARTS & LISTS */
        .admin-grid-layout {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr;
          gap: 24px;
          margin-bottom: 28px;
        }
        
        .admin-card {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02), 0 2px 12px -2px rgba(50,50,93,0.03);
          display: flex;
          flex-direction: column;
        }

        .admin-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .admin-card-title {
          font-size: 1rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* CHARTS ELEMENTS */
        .revenue-chart-container {
          height: 240px;
          position: relative;
        }

        .orders-donut-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-grow: 1;
        }

        .orders-donut-chart {
          width: 140px;
          height: 140px;
          position: relative;
        }

        .orders-donut-center-text {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .donut-val {
          font-size: 1.4rem;
          font-weight: 800;
          color: #0f172a;
        }

        .donut-lbl {
          font-size: 0.65rem;
          color: #64748b;
          font-weight: 600;
        }

        .orders-donut-legend {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex-grow: 1;
        }

        .legend-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8rem;
          font-weight: 600;
          color: #334155;
        }

        .legend-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-pct {
          color: #64748b;
          font-size: 0.75rem;
        }

        .customers-bar-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 150px;
          padding-top: 10px;
        }

        .bar-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: 10%;
        }

        .bar-fill {
          width: 100%;
          border-radius: 4px 4px 0 0;
          background-color: #635bff;
          transition: height 0.5s ease-out;
          cursor: pointer;
        }
        
        .bar-fill:hover {
          background-color: #4f46e5;
        }

        .bar-lbl {
          font-size: 0.7rem;
          color: #94a3b8;
          font-weight: 700;
        }

        /* TABLES & LISTS */
        .admin-table-container {
          overflow-x: auto;
          margin-top: 10px;
        }

        .admin-orders-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .admin-orders-table th {
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          padding: 12px 16px;
          border-bottom: 1px solid #e2e8f0;
          letter-spacing: 0.03em;
        }

        .admin-orders-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.85rem;
          color: #334155;
          vertical-align: middle;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .status-pill.delivered {
          background-color: #e2f7ed;
          color: #0d9488;
        }

        .status-pill.processing {
          background-color: #fff3e0;
          color: #e65100;
        }

        .status-pill.pending {
          background-color: #e3f2fd;
          color: #1e88e5;
        }

        .status-pill.cancelled {
          background-color: #ffebee;
          color: #e53935;
        }
        
        .status-pill.shipped {
          background-color: #ede7f6;
          color: #5e35b1;
        }

        .product-list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .product-list-item:last-child {
          border-bottom: none;
        }

        .product-list-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .product-list-img {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          object-fit: cover;
          background-color: #f1f5f9;
        }

        .product-list-info {
          display: flex;
          flex-direction: column;
        }

        .product-list-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: #1e293b;
        }

        .product-list-cat {
          font-size: 0.7rem;
          color: #64748b;
          font-weight: 500;
        }

        .product-list-sold {
          font-size: 0.8rem;
          font-weight: 700;
          color: #0f172a;
          text-align: right;
        }

        .product-list-sold-lbl {
          font-size: 0.65rem;
          color: #94a3b8;
          font-weight: 600;
          display: block;
        }

        .category-sales-row {
          margin-bottom: 16px;
        }

        .category-sales-row:last-child {
          margin-bottom: 0;
        }

        .category-sales-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .category-sales-pct {
          color: #64748b;
        }

        .category-progress-bg {
          height: 8px;
          background-color: #f1f5f9;
          border-radius: 4px;
          overflow: hidden;
        }

        .category-progress-fill {
          height: 100%;
          border-radius: 4px;
        }

        /* BOTTOM KPI ROW */
        .admin-bottom-metrics-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 20px;
          margin-bottom: 10px;
        }

        /* UTILITIES & COMMON STYLES */
        .btn-view-all {
          background-color: #f1f5f9;
          color: #475569;
          border: none;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-view-all:hover {
          background-color: #e2e8f0;
          color: #0f172a;
        }

        .badge-pending-indicator {
          background-color: #ffeef0;
          color: #ef4444;
          border: 1px solid #fee2e2;
          font-size: 0.75rem;
          padding: 8px 16px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          font-weight: 600;
        }

        /* MODALS */
        .admin-modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          padding: 24px;
        }

        .admin-modal-box {
          background-color: white;
          border-radius: 16px;
          width: 100%;
          max-width: 550px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          animation: slideUp 0.3s ease-out;
        }

        .admin-modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .admin-modal-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .admin-modal-body {
          padding: 24px;
          max-height: 70vh;
          overflow-y: auto;
        }

        .admin-modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
          background-color: #f8fafc;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        /* KEYFRAMES */
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* LEFT SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">F</div>
          <div className="admin-sidebar-title-box">
            <span className="admin-sidebar-title">E-Commerce</span>
            <span className="admin-sidebar-subtitle">Admin Panel</span>
          </div>
        </div>

        <nav className="admin-sidebar-menu">
          {sidebarTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`admin-menu-item ${isActive ? 'active' : ''}`}
              >
                <div className="admin-menu-item-left">
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </div>
                {tab.badge && <span className="admin-menu-badge">{tab.badge}</span>}
              </button>
            );
          })}
        </nav>

        {/* Upgrade Card Pro */}
        <div className="admin-sidebar-upgrade-card">
          <div className="admin-upgrade-title">
            <TrendingUp size={14} />
            <span>Upgrade to Pro</span>
          </div>
          <p className="admin-upgrade-desc">Unlock all features and get more advanced operational insights.</p>
          <button className="btn-upgrade-now" onClick={() => alert("Enterprise SaaS upgrade coming soon!")}>
            Upgrade Now
          </button>
        </div>

        {/* Sidebar Profile Footer */}
        <div className="admin-sidebar-footer">
          <div className="admin-footer-profile" onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ cursor: 'pointer', position: 'relative' }}>
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
              alt="Admin Profile"
              className="admin-footer-avatar"
            />
            <div className="admin-footer-info">
              <span className="admin-footer-name">Admin User</span>
              <div className="admin-footer-status">
                <span className="admin-footer-dot"></span>
                <span>Online</span>
              </div>
            </div>
            {showProfileMenu && (
              <div style={{
                position: 'absolute',
                bottom: '50px',
                left: 0,
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                width: '180px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
                overflow: 'hidden',
                zIndex: 10
              }}>
                <button 
                  onClick={onLogout}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    color: '#ef4444',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN LAYOUT WRAPPER */}
      <div className="admin-main-panel">
        
        {/* TOP BAR */}
        <header className="admin-top-bar">
          <div className="admin-top-bar-welcome">
            <h2 className="admin-welcome-title">Dashboard</h2>
            <span className="admin-welcome-subtitle">Welcome back, Admin! Here's what's happening with your store today.</span>
          </div>

          <div className="admin-top-bar-actions">
            
            {/* Search inputs */}
            <div className="admin-search-box-wrapper">
              <input
                type="text"
                placeholder="Search anything..."
                className="admin-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="admin-search-shortcut">Ctrl + /</span>
            </div>

            {/* Notification icons */}
            <button className="admin-top-icon-btn" onClick={() => setShowNotifications(!showNotifications)} title="Notifications">
              <Bell size={20} />
              <span className="admin-top-badge">5</span>
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  top: '40px',
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  width: '320px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                  zIndex: 20,
                  padding: '16px',
                  textAlign: 'left'
                }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: 800 }}>Notifications</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.75rem', color: '#475569' }}>
                    <div style={{ paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                      <strong>Pending Verification:</strong> New seller "Frais Organics Inc." is waiting for verification review.
                    </div>
                    <div style={{ paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                      <strong>High Stock Alert:</strong> "Sage Green Silk Saree" stock is healthy at 20 units.
                    </div>
                    <div>
                      <strong>Sales Target:</strong> Store revenue increased 12.5% vs last week!
                    </div>
                  </div>
                </div>
              )}
            </button>

            <button className="admin-top-icon-btn" onClick={() => setShowMessages(!showMessages)} title="Messages">
              <Mail size={20} />
              <span className="admin-top-badge" style={{ backgroundColor: '#635bff' }}>3</span>
              {showMessages && (
                <div style={{
                  position: 'absolute',
                  top: '40px',
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  width: '320px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                  zIndex: 20,
                  padding: '16px',
                  textAlign: 'left'
                }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: 800 }}>Messages</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.75rem', color: '#475569' }}>
                    <div style={{ paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                      <strong>Ritesh Prasad:</strong> Can I apply a promo code on my recent checkout order?
                    </div>
                    <div>
                      <strong>Frais Organics:</strong> Product catalog updated successfully with 22k GST details.
                    </div>
                  </div>
                </div>
              )}
            </button>

            {/* Date range Selector mockup */}
            <button className="admin-date-picker-btn">
              <Calendar size={16} />
              <span>May 20 - May 26, 2024</span>
            </button>
          </div>
        </header>

        {/* VIEWPORT LAYOUT CONTENT */}
        <div className="admin-content-scroll">
          
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div style={{ color: '#635bff', fontWeight: 'bold' }}>Retrieving administrative data...</div>
            </div>
          )}

          {!loading && activeTab === 'dashboard' && stats && (
            <>
              {/* Sellers verification warning */}
              {pendingSellers.length > 0 && (
                <div className="badge-pending-indicator">
                  <ShieldAlert size={18} />
                  <span>
                    You have <strong>{pendingSellers.length}</strong> seller registration request(s) waiting for verification approval.
                  </span>
                  <button 
                    onClick={() => setActiveTab('settings')}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    View Requests
                  </button>
                </div>
              )}

              {/* KPI STAT CARDS ROW */}
              <div className="admin-metrics-row">
                {/* Total Revenue */}
                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-label">Total Revenue</span>
                    <div className="admin-kpi-icon-box" style={{ backgroundColor: 'rgba(99, 91, 255, 0.15)', color: '#635bff' }}>
                      <DollarSign size={20} />
                    </div>
                  </div>
                  <span className="admin-kpi-value">₹{stats.totalRevenue?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  <div className="admin-kpi-trend trend-up">
                    <span>↑ 12.5%</span>
                    <span style={{ color: '#94a3b8', fontWeight: 500 }}>vs last week</span>
                  </div>
                  {/* SVG Line Sparkline */}
                  <div className="admin-kpi-sparkline">
                    <svg viewBox="0 0 100 30" width="100%" height="100%">
                      <path d="M 0 25 Q 15 10, 30 18 T 60 5 T 80 12 T 100 2" fill="none" stroke="#635bff" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Orders */}
                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-label">Orders</span>
                    <div className="admin-kpi-icon-box" style={{ backgroundColor: 'rgba(33, 150, 243, 0.15)', color: '#2196f3' }}>
                      <ShoppingCart size={20} />
                    </div>
                  </div>
                  <span className="admin-kpi-value">{stats.totalOrders?.toLocaleString()}</span>
                  <div className="admin-kpi-trend trend-up">
                    <span>↑ 8.2%</span>
                    <span style={{ color: '#94a3b8', fontWeight: 500 }}>vs last week</span>
                  </div>
                  {/* SVG Sparkline */}
                  <div className="admin-kpi-sparkline">
                    <svg viewBox="0 0 100 30" width="100%" height="100%">
                      <path d="M 0 22 Q 20 5, 40 18 T 80 10 T 100 8" fill="none" stroke="#2196f3" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Customers */}
                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-label">Customers</span>
                    <div className="admin-kpi-icon-box" style={{ backgroundColor: 'rgba(76, 175, 80, 0.15)', color: '#4caf50' }}>
                      <Users size={20} />
                    </div>
                  </div>
                  <span className="admin-kpi-value">{stats.totalCustomers?.toLocaleString()}</span>
                  <div className="admin-kpi-trend trend-up">
                    <span>↑ 5.4%</span>
                    <span style={{ color: '#94a3b8', fontWeight: 500 }}>vs last week</span>
                  </div>
                  {/* SVG Sparkline */}
                  <div className="admin-kpi-sparkline">
                    <svg viewBox="0 0 100 30" width="100%" height="100%">
                      <path d="M 0 28 Q 15 20, 30 22 T 60 12 T 80 8 T 100 4" fill="none" stroke="#4caf50" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Avg Order Value */}
                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-label">Avg. Order Value</span>
                    <div className="admin-kpi-icon-box" style={{ backgroundColor: 'rgba(255, 152, 0, 0.15)', color: '#ff9800' }}>
                      <TrendingUp size={20} />
                    </div>
                  </div>
                  <span className="admin-kpi-value">₹{stats.avgOrderValue?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  <div className="admin-kpi-trend trend-up">
                    <span>↑ 3.1%</span>
                    <span style={{ color: '#94a3b8', fontWeight: 500 }}>vs last week</span>
                  </div>
                  {/* SVG Sparkline */}
                  <div className="admin-kpi-sparkline">
                    <svg viewBox="0 0 100 30" width="100%" height="100%">
                      <path d="M 0 20 Q 20 18, 40 10 T 80 15 T 100 8" fill="none" stroke="#ff9800" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Total Products */}
                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-label">Total Products</span>
                    <div className="admin-kpi-icon-box" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                      <Package size={20} />
                    </div>
                  </div>
                  <span className="admin-kpi-value">{stats.totalProducts?.toLocaleString()}</span>
                  <div className="admin-kpi-trend trend-up">
                    <span>↑ 2.7%</span>
                    <span style={{ color: '#94a3b8', fontWeight: 500 }}>vs last week</span>
                  </div>
                  {/* SVG Sparkline */}
                  <div className="admin-kpi-sparkline">
                    <svg viewBox="0 0 100 30" width="100%" height="100%">
                      <path d="M 0 25 L 20 22 L 40 23 L 60 19 L 80 20 L 100 17" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* THREE COLUMN GRID FOR METRICS */}
              <div className="admin-grid-layout">
                {/* Revenue Overview Line Chart */}
                <div className="admin-card" style={{ gridColumn: 'span 1' }}>
                  <div className="admin-card-header">
                    <h3 className="admin-card-title">Revenue Overview</h3>
                    <select style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600 }}>
                      <option>This Week</option>
                      <option>This Month</option>
                    </select>
                  </div>
                  <div className="revenue-chart-container">
                    {/* SVG Line Chart Representation */}
                    <svg viewBox="0 0 500 200" width="100%" height="100%">
                      {/* Grid Lines */}
                      <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1.5" />
                      <line x1="40" y1="70" x2="480" y2="70" stroke="#f1f5f9" strokeWidth="1.5" />
                      <line x1="40" y1="120" x2="480" y2="120" stroke="#f1f5f9" strokeWidth="1.5" />
                      <line x1="40" y1="170" x2="480" y2="170" stroke="#e2e8f0" strokeWidth="1.5" />
                      
                      {/* Area Fill */}
                      <path d="M 40 170 Q 100 130, 160 80 T 280 90 T 400 60 T 480 30 L 480 170 Z" fill="rgba(99, 91, 255, 0.06)" />
                      
                      {/* Line Bezier Path */}
                      <path d="M 40 170 Q 100 130, 160 80 T 280 90 T 400 60 T 480 30" fill="none" stroke="#635bff" strokeWidth="3" strokeLinecap="round" />
                      
                      {/* Points */}
                      <circle cx="40" cy="170" r="4.5" fill="#635bff" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="113" cy="120" r="4.5" fill="#635bff" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="186" cy="80" r="4.5" fill="#635bff" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="260" cy="98" r="4.5" fill="#635bff" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="333" cy="70" r="4.5" fill="#635bff" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="406" cy="60" r="4.5" fill="#635bff" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="480" cy="30" r="4.5" fill="#635bff" stroke="#ffffff" strokeWidth="2" />

                      {/* X Labels */}
                      <text x="40" y="190" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">Mon</text>
                      <text x="113" y="190" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">Tue</text>
                      <text x="186" y="190" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">Wed</text>
                      <text x="260" y="190" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">Thu</text>
                      <text x="333" y="190" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">Fri</text>
                      <text x="406" y="190" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">Sat</text>
                      <text x="480" y="190" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">Sun</text>
                    </svg>
                  </div>
                </div>

                {/* Orders Overview Doughnut Chart */}
                <div className="admin-card" style={{ gridColumn: 'span 1' }}>
                  <div className="admin-card-header">
                    <h3 className="admin-card-title">Orders Overview</h3>
                  </div>
                  <div className="orders-donut-wrapper">
                    {/* Doughnut Chart representation via SVG */}
                    <div className="orders-donut-chart">
                      <svg viewBox="0 0 36 36" width="100%" height="100%">
                        <circle cx="18" cy="18" r="15.91" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                        {/* 52% Delivered (Green) */}
                        <circle cx="18" cy="18" r="15.91" fill="none" stroke="#4caf50" strokeWidth="3.2" strokeDasharray="52 48" strokeDashoffset="25" />
                        {/* 26% Processing (Orange) */}
                        <circle cx="18" cy="18" r="15.91" fill="none" stroke="#ff9800" strokeWidth="3.2" strokeDasharray="26 74" strokeDashoffset="-27" />
                        {/* 14% Pending (Blue) */}
                        <circle cx="18" cy="18" r="15.91" fill="none" stroke="#2196f3" strokeWidth="3.2" strokeDasharray="14 86" strokeDashoffset="-53" />
                        {/* 8% Cancelled (Red) */}
                        <circle cx="18" cy="18" r="15.91" fill="none" stroke="#f44336" strokeWidth="3.2" strokeDasharray="8 92" strokeDashoffset="-67" />
                      </svg>
                      <div className="orders-donut-center-text">
                        <span className="donut-val">{stats.totalOrders?.toLocaleString()}</span>
                        <span className="donut-lbl">Total Orders</span>
                      </div>
                    </div>

                    <div className="orders-donut-legend">
                      {stats.ordersOverview?.map(item => (
                        <div key={item.status} className="legend-item">
                          <div className="legend-indicator">
                            <span className="legend-dot" style={{ backgroundColor: item.color }} />
                            <span>{item.status}</span>
                          </div>
                          <div>
                            <span>{item.count}</span>
                            <span className="legend-pct"> ({item.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Selling Products List */}
                <div className="admin-card" style={{ gridColumn: 'span 1' }}>
                  <div className="admin-card-header">
                    <h3 className="admin-card-title">Top Selling Products</h3>
                    <button className="btn-view-all" onClick={() => setActiveTab('products')}>View All</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {stats.topSellingProducts?.map(prod => (
                      <div key={prod.id} className="product-list-item">
                        <div className="product-list-left">
                          <img src={prod.image} alt={prod.name} className="product-list-img" />
                          <div className="product-list-info">
                            <span className="product-list-name">{prod.name}</span>
                            <span className="product-list-cat">{prod.category}</span>
                          </div>
                        </div>
                        <div className="product-list-sold">
                          {prod.unitsSold}
                          <span className="product-list-sold-lbl">Sold</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* GRID LAYOUT ROW 2 */}
              <div className="admin-grid-layout">
                {/* Recent Orders table */}
                <div className="admin-card" style={{ gridColumn: 'span 2' }}>
                  <div className="admin-card-header">
                    <h3 className="admin-card-title">Recent Orders</h3>
                    <button className="btn-view-all" onClick={() => setActiveTab('orders')}>View All</button>
                  </div>
                  <div className="admin-table-container">
                    <table className="admin-orders-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentOrders?.map(order => (
                          <tr key={order.orderId} style={{ cursor: 'pointer' }} onClick={() => setActiveTab('orders')}>
                            <td style={{ fontWeight: 700, color: '#635bff' }}>{order.orderId}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80" alt="avatar" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                                <span>{order.customer}</span>
                              </div>
                            </td>
                            <td style={{ color: '#64748b', fontWeight: 500 }}>{order.date}</td>
                            <td style={{ fontWeight: 800 }}>₹{order.amount.toFixed(2)}</td>
                            <td>
                              <span className={`status-pill ${order.status.toLowerCase()}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sales by Category bar indicators */}
                <div className="admin-card" style={{ gridColumn: 'span 1' }}>
                  <div className="admin-card-header">
                    <h3 className="admin-card-title">Sales by Category</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1, justifyContent: 'center' }}>
                    {stats.salesByCategory?.map((item, idx) => {
                      const colors = ['#635bff', '#00abc5', '#4caf50', '#ff9800', '#f44336'];
                      const barColor = colors[idx % colors.length];
                      return (
                        <div key={item.category} className="category-sales-row">
                          <div className="category-sales-info">
                            <span>{item.category}</span>
                            <span>
                              ₹{item.revenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}{' '}
                              <span className="category-sales-pct">({item.percentage}%)</span>
                            </span>
                          </div>
                          <div className="category-progress-bg">
                            <div
                              className="category-progress-fill"
                              style={{ width: `${item.percentage}%`, backgroundColor: barColor }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* THREE COLUMN GRID ROW 3 - CUSTOMERS BAR & FOOTER KPIs */}
              <div className="admin-grid-layout" style={{ gridTemplateColumns: '1.2fr 2fr' }}>
                {/* Customer Registrations Bar Chart */}
                <div className="admin-card">
                  <div className="admin-card-header">
                    <h3 className="admin-card-title">Customers Overview</h3>
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '2px' }}>
                    {(stats.totalCustomers - 4).toLocaleString()}
                    <span style={{ fontSize: '0.75rem', color: '#10b981', marginLeft: '6px', fontWeight: 700 }}>
                      ↑ 5.4% vs last week
                    </span>
                  </div>
                  
                  <div className="customers-bar-chart">
                    {stats.customersOverview?.map(item => {
                      // Normalize bar heights relative to max value
                      const maxVal = Math.max(...stats.customersOverview.map(c => c.count));
                      const heightPct = maxVal > 0 ? (item.count / maxVal) * 85 : 0;
                      return (
                        <div key={item.day} className="bar-col">
                          <div
                            className="bar-fill"
                            style={{ height: `${heightPct}%`, backgroundColor: '#635bff' }}
                            title={`${item.count} registrations`}
                          />
                          <span className="bar-lbl">{item.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* BOTTOM METRICS ROW GRID */}
                <div className="admin-bottom-metrics-row">
                  {/* Total Profit */}
                  <div className="admin-kpi-card" style={{ border: 'none', backgroundColor: '#fdfdff', boxShadow: 'inset 0 0 0 1px #e2e8f0' }}>
                    <div className="admin-kpi-header">
                      <span className="admin-kpi-label">Total Profit</span>
                      <div className="admin-kpi-icon-box" style={{ backgroundColor: '#e2f7ed', color: '#0d9488' }}>
                        <DollarSign size={18} />
                      </div>
                    </div>
                    <span className="admin-kpi-value" style={{ fontSize: '1.45rem' }}>
                      ₹{stats.totalProfit?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                    <div className="admin-kpi-trend trend-up">
                      <span>↑ 11.7%</span>
                    </div>
                  </div>

                  {/* Refunds */}
                  <div className="admin-kpi-card" style={{ border: 'none', backgroundColor: '#fdfdff', boxShadow: 'inset 0 0 0 1px #e2e8f0' }}>
                    <div className="admin-kpi-header">
                      <span className="admin-kpi-label">Refunds</span>
                      <div className="admin-kpi-icon-box" style={{ backgroundColor: '#ffebee', color: '#e53935' }}>
                        <RotateCcw size={18} />
                      </div>
                    </div>
                    <span className="admin-kpi-value" style={{ fontSize: '1.45rem' }}>
                      ₹{stats.refunds?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                    <div className="admin-kpi-trend trend-down">
                      <span>↓ 3.2%</span>
                    </div>
                  </div>

                  {/* Conversion Rate */}
                  <div className="admin-kpi-card" style={{ border: 'none', backgroundColor: '#fdfdff', boxShadow: 'inset 0 0 0 1px #e2e8f0' }}>
                    <div className="admin-kpi-header">
                      <span className="admin-kpi-label">Conversion Rate</span>
                      <div className="admin-kpi-icon-box" style={{ backgroundColor: '#fff3e0', color: '#ff9800' }}>
                        <TrendingUp size={18} />
                      </div>
                    </div>
                    <span className="admin-kpi-value" style={{ fontSize: '1.45rem' }}>{stats.conversionRate}%</span>
                    <div className="admin-kpi-trend trend-up">
                      <span>↑ 1.2%</span>
                    </div>
                  </div>

                  {/* Active Users */}
                  <div className="admin-kpi-card" style={{ border: 'none', backgroundColor: '#fdfdff', boxShadow: 'inset 0 0 0 1px #e2e8f0' }}>
                    <div className="admin-kpi-header">
                      <span className="admin-kpi-label">Active Users</span>
                      <div className="admin-kpi-icon-box" style={{ backgroundColor: '#e3f2fd', color: '#1e88e5' }}>
                        <Users size={18} />
                      </div>
                    </div>
                    <span className="admin-kpi-value" style={{ fontSize: '1.45rem' }}>{stats.activeUsers}</span>
                    <div className="admin-kpi-trend trend-up">
                      <span>↑ 8.6%</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ORDERS TAB */}
          {!loading && activeTab === 'orders' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <ShoppingCart size={20} /> System Orders
                </h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select 
                    className="admin-search-input" 
                    style={{ width: '160px', padding: '6px 12px' }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="PENDING">Pending</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  <button className="admin-date-picker-btn" onClick={fetchOrders}>
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer Name</th>
                      <th>Items Count</th>
                      <th>Total Amount</th>
                      <th>Payment Status</th>
                      <th>Delivery Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders
                      .filter(o => statusFilter === 'ALL' || o.deliveryStatus === statusFilter)
                      .map(order => (
                        <tr key={order.orderId}>
                          <td style={{ fontWeight: 700, color: '#635bff' }}>#ORD-{String(order.orderId).padStart(5, '0')}</td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 700 }}>{order.customerName || 'Retail Customer'}</span>
                              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{order.shippingAddress}</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{order.items?.length || 1} Items</td>
                          <td style={{ fontWeight: 800 }}>₹{order.totalAmount?.toFixed(2)}</td>
                          <td>
                            <span className={`status-pill ${order.paymentStatus === 'PAID' ? 'delivered' : order.paymentStatus === 'FAILED' ? 'cancelled' : 'pending'}`}>
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td>
                            <span className={`status-pill ${order.deliveryStatus.toLowerCase()}`}>
                              {order.deliveryStatus}
                            </span>
                          </td>
                          <td style={{ color: '#64748b' }}>
                            {new Date(order.orderDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td>
                            <button className="btn-upgrade-now" style={{ padding: '6px 12px', fontSize: '0.75rem', width: 'auto' }} onClick={() => openOrderModal(order)}>
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {!loading && activeTab === 'products' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <Package size={20} /> Store Products Catalog
                </h3>
                <button className="admin-date-picker-btn" onClick={fetchProducts}>
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-orders-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>SKU</th>
                      <th>Seller</th>
                      <th>Price</th>
                      <th>Stock Qty</th>
                      <th>Ratings</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(prod => (
                      <tr key={prod.productId}>
                        <td>
                          <img
                            src={prod.productImages?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                            alt={prod.productName}
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }}
                          />
                        </td>
                        <td style={{ fontWeight: 700 }}>{prod.productName}</td>
                        <td style={{ fontWeight: 600 }}>{prod.category}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{prod.sku}</td>
                        <td style={{ color: '#475569', fontWeight: 600 }}>{prod.sellerBusinessName || 'Vendor'}</td>
                        <td style={{ fontWeight: 800 }}>₹{prod.price?.toFixed(2)}</td>
                        <td>
                          {prod.stockQuantity === 0 ? (
                            <span className="status-pill cancelled">Sold Out</span>
                          ) : prod.stockQuantity < 5 ? (
                            <span className="status-pill processing">{prod.stockQuantity} Low</span>
                          ) : (
                            <span className="status-pill delivered">{prod.stockQuantity} Stock</span>
                          )}
                        </td>
                        <td style={{ fontWeight: 700 }}>⭐ {prod.ratings || '5.0'}</td>
                        <td>
                          <button
                            className="admin-top-icon-btn"
                            style={{ color: '#ef4444' }}
                            onClick={() => handleDeleteProduct(prod.productId)}
                            title="Delete Product Listing"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CUSTOMERS TAB */}
          {!loading && activeTab === 'customers' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <Users size={20} /> Registered Customers
                </h3>
                <button className="admin-date-picker-btn" onClick={fetchCustomers}>
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-orders-table">
                  <thead>
                    <tr>
                      <th>Customer ID</th>
                      <th>Full Name</th>
                      <th>Email Profile</th>
                      <th>Phone</th>
                      <th>Location / Address</th>
                      <th>Account Status</th>
                      <th>Joined Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(cust => (
                      <tr key={cust.id}>
                        <td style={{ fontWeight: 700 }}>#CUST-{cust.id}</td>
                        <td style={{ fontWeight: 700 }}>{cust.fullName}</td>
                        <td style={{ color: '#635bff', fontWeight: 600 }}>{cust.email}</td>
                        <td style={{ fontWeight: 500 }}>{cust.phoneNumber || 'N/A'}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem' }}>
                            <span>{cust.address || 'N/A'}</span>
                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{cust.city && `${cust.city}, ${cust.state}`}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-pill ${cust.accountStatus === 'ACTIVE' ? 'delivered' : 'cancelled'}`}>
                            {cust.accountStatus}
                          </span>
                        </td>
                        <td style={{ color: '#64748b' }}>
                          {new Date(cust.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td>
                          <button
                            className="btn-upgrade-now"
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.75rem',
                              width: 'auto',
                              backgroundColor: cust.accountStatus === 'ACTIVE' ? '#ef4444' : '#10b981'
                            }}
                            onClick={() => handleToggleCustomerStatus(cust.id, cust.accountStatus)}
                          >
                            {cust.accountStatus === 'ACTIVE' ? (
                              <>
                                <Lock size={12} style={{ marginRight: '4px', display: 'inline' }} /> Suspend
                              </>
                            ) : (
                              <>
                                <Unlock size={12} style={{ marginRight: '4px', display: 'inline' }} /> Activate
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DISCOUNTS / COUPONS TAB */}
          {!loading && (activeTab === 'discounts' || activeTab === 'coupons') && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <Ticket size={20} /> Promo Code Coupons
                </h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-upgrade-now" style={{ width: 'auto', padding: '8px 16px' }} onClick={() => setIsCouponFormOpen(true)}>
                    <Plus size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Create Coupon
                  </button>
                  <button className="admin-date-picker-btn" onClick={fetchCoupons}>
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-orders-table">
                  <thead>
                    <tr>
                      <th>Promo Code</th>
                      <th>Discount Value</th>
                      <th>Max Cap Limit</th>
                      <th>Expiry Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map(coupon => {
                      const isExpired = new Date(coupon.expiryDate) < new Date();
                      return (
                        <tr key={coupon.id}>
                          <td style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '0.95rem', letterSpacing: '0.05em', color: '#635bff' }}>
                            {coupon.code}
                          </td>
                          <td style={{ fontWeight: 700 }}>{coupon.discountPercentage}% OFF</td>
                          <td>{coupon.maxDiscountAmount ? `₹${coupon.maxDiscountAmount.toFixed(2)}` : 'No Limit'}</td>
                          <td style={{ color: isExpired ? '#ef4444' : '#64748b', fontWeight: 600 }}>
                            {new Date(coupon.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            {isExpired && ' (Expired)'}
                          </td>
                          <td>
                            <span className={`status-pill ${(!isExpired && coupon.active) ? 'delivered' : 'cancelled'}`}>
                              {(!isExpired && coupon.active) ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="admin-top-icon-btn"
                              style={{ color: '#ef4444' }}
                              onClick={() => handleDeleteCoupon(coupon.id)}
                              title="Delete Promo Code"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REVIEWS TAB */}
          {!loading && activeTab === 'reviews' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <MessageSquare size={20} /> Customer Reviews Moderation
                </h3>
                <button className="admin-date-picker-btn" onClick={fetchReviews}>
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-orders-table">
                  <thead>
                    <tr>
                      <th>Rating</th>
                      <th>Customer</th>
                      <th>Target Product</th>
                      <th>Comment Review</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map(rev => (
                      <tr key={rev.id}>
                        <td style={{ fontWeight: 700, fontSize: '1.05rem', color: '#ff9800' }}>
                          {'★'.repeat(Math.round(rev.rating))}
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '4px' }}>({rev.rating})</span>
                        </td>
                        <td style={{ fontWeight: 700 }}>{rev.customerName || `Customer #${rev.customerId}`}</td>
                        <td style={{ fontWeight: 600, color: '#1e293b' }}>{rev.productName || `Product #${rev.productId}`}</td>
                        <td style={{ color: '#475569', fontStyle: 'italic', maxWidth: '300px', whiteSpace: 'normal' }}>
                          "{rev.comment || 'No description comments left.'}"
                        </td>
                        <td style={{ color: '#64748b' }}>
                          {new Date(rev.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td>
                          <button
                            className="admin-top-icon-btn"
                            style={{ color: '#ef4444' }}
                            onClick={() => handleDeleteReview(rev.id)}
                            title="Remove Offensive Review"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CATEGORIES TAB */}
          {!loading && activeTab === 'categories' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <FolderTree size={20} /> Store Categories Breakdown
                </h3>
              </div>

              <div className="admin-table-container">
                <table className="admin-orders-table">
                  <thead>
                    <tr>
                      <th>Category Name</th>
                      <th>Listed Products</th>
                      <th>Total Stock Available</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(cat => (
                      <tr key={cat.category}>
                        <td style={{ fontWeight: 700, fontSize: '0.95rem' }}>{cat.category}</td>
                        <td style={{ fontWeight: 800 }}>{cat.productCount} Products listed</td>
                        <td style={{ fontWeight: 600 }}>{cat.totalStock} units available</td>
                        <td>
                          <span className="status-pill delivered">Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* RETURNS TAB */}
          {!loading && activeTab === 'returns' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <RotateCcw size={20} /> Returned & Cancelled Orders
                </h3>
              </div>

              <div className="admin-table-container">
                <table className="admin-orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer Name</th>
                      <th>Refund Amount</th>
                      <th>Payment Mode</th>
                      <th>Refund Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders
                      .filter(o => o.deliveryStatus === 'CANCELLED')
                      .map(order => (
                        <tr key={order.orderId}>
                          <td style={{ fontWeight: 700, color: '#ef4444' }}>#ORD-{String(order.orderId).padStart(5, '0')}</td>
                          <td style={{ fontWeight: 700 }}>{order.customerName || 'Retail Customer'}</td>
                          <td style={{ fontWeight: 800, color: '#ef4444' }}>₹{order.totalAmount?.toFixed(2)}</td>
                          <td style={{ fontWeight: 600 }}>{order.paymentMethod}</td>
                          <td>
                            <span className="status-pill processing">Refund Processed</span>
                          </td>
                          <td style={{ color: '#64748b' }}>
                            {new Date(order.orderDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ANALYTICS & MARKETING TAB MOCK */}
          {!loading && (activeTab === 'analytics' || activeTab === 'marketing') && (
            <div className="admin-card" style={{ textAlign: 'center', padding: '60px' }}>
              <ShieldAlert size={48} style={{ color: '#635bff', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Analytics & Promotional Campaign Portal</h3>
              <p style={{ color: '#64748b', maxWidth: '450px', margin: '0 auto 20px auto' }}>
                Advanced campaign telemetry and conversion funnel charts are generated on daily cron tasks. Run the export below to sync details.
              </p>
              <button className="btn-upgrade-now" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => alert("Data synchronization initiated successfully.")}>
                Sync Campaign Logs
              </button>
            </div>
          )}

          {/* SETTINGS TAB */}
          {!loading && activeTab === 'settings' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Core Settings */}
              <div className="admin-card">
                <h3 className="admin-card-title" style={{ marginBottom: '20px' }}>
                  <Settings size={18} /> Store Configuration
                </h3>
                <form onSubmit={(e) => { e.preventDefault(); alert("Configuration settings saved successfully."); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Store Front Name</label>
                    <input
                      type="text"
                      className="admin-search-input"
                      style={{ backgroundColor: '#ffffff', width: '100%' }}
                      value={settingsData.storeName}
                      onChange={(e) => setSettingsData({ ...settingsData, storeName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Support Email address</label>
                    <input
                      type="email"
                      className="admin-search-input"
                      style={{ backgroundColor: '#ffffff', width: '100%' }}
                      value={settingsData.supportEmail}
                      onChange={(e) => setSettingsData({ ...settingsData, supportEmail: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Store Base Currency</label>
                    <select className="admin-search-input" style={{ backgroundColor: '#ffffff', width: '100%', padding: '8px' }} value={settingsData.currency} onChange={(e) => setSettingsData({ ...settingsData, currency: e.target.value })}>
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-upgrade-now">Save Config Settings</button>
                </form>
              </div>

              {/* Sellers verification panel */}
              <div className="admin-card">
                <h3 className="admin-card-title" style={{ marginBottom: '20px' }}>
                  <ShieldAlert size={18} /> Vendor Verification Requests
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {sellers.length === 0 ? (
                    <div style={{ color: '#64748b', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>No sellers registered.</div>
                  ) : (
                    sellers.map(s => (
                      <div key={s.sellerId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{s.businessName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {s.sellerName} • GST: <code style={{ color: '#635bff' }}>{s.gstNumber}</code>
                          </div>
                        </div>
                        <div>
                          {s.verificationStatus === 'PENDING' ? (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button className="admin-top-icon-btn" style={{ color: '#10b981' }} onClick={() => handleVerifySeller(s.sellerId, 'APPROVED')} title="Approve">
                                <Check size={16} />
                              </button>
                              <button className="admin-top-icon-btn" style={{ color: '#ef4444' }} onClick={() => handleVerifySeller(s.sellerId, 'REJECTED')} title="Reject">
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <span className={`status-pill ${s.verificationStatus === 'APPROVED' ? 'delivered' : 'cancelled'}`} style={{ fontSize: '0.7rem' }}>
                              {s.verificationStatus}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* COUPON DIALOG FORM */}
      {isCouponFormOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsCouponFormOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Generate Discount Code</h3>
              <button className="admin-top-icon-btn" onClick={() => setIsCouponFormOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateCoupon}>
              <div className="admin-modal-body">
                {couponFormError && (
                  <div className="badge-pending-indicator" style={{ padding: '8px 12px', borderRadius: '8px' }}>
                    <ShieldAlert size={16} />
                    <span>{couponFormError}</span>
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Coupon Promo Code (Uppercase)</label>
                    <input
                      type="text"
                      className="admin-search-input"
                      style={{ backgroundColor: '#ffffff', width: '100%' }}
                      placeholder="e.g. FESTIVE30"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      required
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Discount Percent (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        className="admin-search-input"
                        style={{ backgroundColor: '#ffffff', width: '100%' }}
                        placeholder="e.g. 30"
                        value={discountPercentage}
                        onChange={(e) => setDiscountPercentage(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Max Cap Amount (₹, Optional)</label>
                      <input
                        type="number"
                        min="1"
                        className="admin-search-input"
                        style={{ backgroundColor: '#ffffff', width: '100%' }}
                        placeholder="e.g. 500"
                        value={maxDiscountAmount}
                        onChange={(e) => setMaxDiscountAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Expiry date</label>
                    <input
                      type="datetime-local"
                      className="admin-search-input"
                      style={{ backgroundColor: '#ffffff', width: '100%', padding: '8px' }}
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn-view-all" onClick={() => setIsCouponFormOpen(false)}>Cancel</button>
                <button type="submit" className="btn-upgrade-now" style={{ width: 'auto', padding: '8px 20px' }}>Create Promo Code</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER MANAGER DETAIL MODAL */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Manage Order #ORD-{String(selectedOrder.orderId).padStart(5, '0')}</h3>
              <button className="admin-top-icon-btn" onClick={() => setSelectedOrder(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdateOrderDetails}>
              <div className="admin-modal-body" style={{ fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div><strong>Customer Profile:</strong> {selectedOrder.customerName || 'Anonymous User'} ({selectedOrder.customerEmail || 'No Email'})</div>
                    <div><strong>Physical Address:</strong> {selectedOrder.shippingAddress}</div>
                    <div><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</div>
                    <div><strong>Total Bill:</strong> ₹{selectedOrder.totalAmount?.toFixed(2)}</div>
                  </div>
                  
                  {/* Order items lists */}
                  <div>
                    <h5 style={{ fontWeight: 800, textTransform: 'uppercase', color: '#64748b', fontSize: '0.75rem', marginBottom: '8px' }}>Purchased Items</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                          <span>• {item.productName} (x{item.quantity})</span>
                          <strong>₹{(item.price * item.quantity).toFixed(2)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Delivery Status</label>
                      <select
                        className="admin-search-input"
                        style={{ backgroundColor: '#ffffff', width: '100%', padding: '8px' }}
                        value={deliveryStatus}
                        onChange={(e) => setDeliveryStatus(e.target.value)}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Payment Status</label>
                      <select
                        className="admin-search-input"
                        style={{ backgroundColor: '#ffffff', width: '100%', padding: '8px' }}
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value)}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="FAILED">Failed</option>
                        <option value="REFUNDED">Refunded</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Delivery Tracking ID</label>
                    <input
                      type="text"
                      className="admin-search-input"
                      style={{ backgroundColor: '#ffffff', width: '100%' }}
                      placeholder="e.g. TRK7748923"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn-view-all" onClick={() => setSelectedOrder(null)}>Cancel</button>
                <button type="submit" className="btn-upgrade-now" style={{ width: 'auto', padding: '8px 20px' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
