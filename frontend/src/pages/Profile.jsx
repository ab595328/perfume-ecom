import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { User, ClipboardList, LogOut, Compass, MapPin, Sparkles, Check, PackageOpen } from 'lucide-react';
import './Profile.css';

export default function Profile() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('orders'); // 'orders' or 'address'
  
  // Mock Address Details
  const [address, setAddress] = useState({
    name: 'Connoisseur Guest',
    street: '12, Luxury Boulevard, Chanakyapuri',
    city: 'New Delhi',
    postalCode: '110021',
    phone: '+91 98765 43210'
  });
  const [addressSaved, setAddressSaved] = useState(false);

  // Retrieve Scent Preference from localStorage (if Quiz was taken)
  const [scentPreferences, setScentPreferences] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Load Scent Quiz Results
    const quizResults = localStorage.getItem('scent_quiz_results');
    if (quizResults) {
      try {
        setScentPreferences(JSON.parse(quizResults));
      } catch (e) {
        console.error(e);
      }
    }

    // Load user orders from backend and local mockup storage
    setLoadingOrders(true);
    const localOrders = JSON.parse(localStorage.getItem('aura_mock_orders') || '[]')
      .filter(order => order.user_email.toLowerCase() === user.email.toLowerCase());

    fetch(`http://localhost:5000/api/orders/user/${encodeURIComponent(user.email)}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
      })
      .then(dbOrders => {
        // Merge database and local mockup orders, filtering duplicates by ID
        const merged = [...dbOrders];
        localOrders.forEach(localOrder => {
          if (!merged.some(dbOrder => dbOrder.id === localOrder.id)) {
            merged.push(localOrder);
          }
        });
        merged.sort((a, b) => b.id - a.id);
        setOrders(merged);
        setLoadingOrders(false);
      })
      .catch(err => {
        console.warn("Backend offline or orders query failed, using localStorage only.", err);
        setOrders(localOrders);
        setLoadingOrders(false);
      });
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    setAddressSaved(true);
    setTimeout(() => setAddressSaved(false), 2000);
  };

  if (!user) return null;

  return (
    <div className="profile-page container animate-fade">
      {/* Profile Header */}
      <div className="profile-header-banner glass-panel">
        <div className="profile-avatar-row">
          <div className="profile-avatar-wrap">
            <User size={38} className="avatar-icon" />
          </div>
          <div className="profile-user-info">
            <span className="profile-badge">ROYAL REGISTRY</span>
            <h1>{user.email.split('@')[0].toUpperCase()}</h1>
            <p>{user.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="gold-button logout-header-btn">
          <LogOut size={16} /> Log Out
        </button>
      </div>

      <div className="profile-layout">
        {/* Sidebar Controls */}
        <aside className="profile-sidebar glass-panel">
          <h3>My Account</h3>
          <div className="profile-nav-links">
            <button 
              className={`profile-nav-btn ${activeSubTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('orders')}
            >
              <ClipboardList size={16} /> Acquisitions Vault ({orders.length})
            </button>
            <button 
              className={`profile-nav-btn ${activeSubTab === 'address' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('address')}
            >
              <MapPin size={16} /> Delivery Address
            </button>
          </div>

          {/* Scent Quiz Result Card */}
          <div className="scent-preference-card">
            <h4><Sparkles size={14} className="gold-icon" /> Olfactory Accord</h4>
            {scentPreferences ? (
              <div className="scent-results-summary">
                <span className="scent-family-label">{scentPreferences.family} Family</span>
                <p>Based on your digital scent consultation, your skin chemistry responds to: <strong>{scentPreferences.notes}</strong>.</p>
                <Link to="/shop" className="gold-button solid mini-btn">Filter Catalog</Link>
              </div>
            ) : (
              <div className="scent-results-empty">
                <p>Consult our digital scent concierge to identify your signature scent pyramid.</p>
                <button onClick={() => navigate('/?quiz=open')} className="gold-button solid mini-btn">
                  <Compass size={12} /> Begin Quiz
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Tab Display Panel */}
        <main className="profile-main-display glass-panel">
          {activeSubTab === 'orders' && (
            <div className="profile-orders-tab animate-fade">
              <h2>Acquisitions Vault (Order History)</h2>
              <div className="title-underline left"></div>

              {loadingOrders ? (
                <div className="orders-loading">
                  <div className="spinner"></div>
                  <p>Unlocking transaction logs...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="no-orders-box">
                  <PackageOpen size={48} className="empty-box-icon" />
                  <h3>Vault is Empty</h3>
                  <p>You have not made any luxury fragrance acquisitions yet.</p>
                  <Link to="/shop" className="gold-button solid">Explore Private Curation</Link>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order.id} className="order-item-card glass-panel">
                      <div className="order-item-header">
                        <div>
                          <span className="order-id-label">REGISTRY ID: #AST-{order.id}</span>
                          <span className="order-date">{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <span className={`order-status-badge ${order.status}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="order-items-list">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="order-item-row">
                            <span className="item-qty">{item.qty}x</span>
                            <div className="item-name-brand">
                              <h4>{item.name}</h4>
                              <p>{item.brand}</p>
                            </div>
                            <span className="item-price">₹{item.price.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>

                      <div className="order-item-footer">
                        <span>Total Paid</span>
                        <h3>₹{order.total_amount.toLocaleString('en-IN')}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'address' && (
            <div className="profile-address-tab animate-fade">
              <h2>Delivery Registry Address</h2>
              <div className="title-underline left"></div>
              <p className="tab-desc">Specify your primary residence for secure, insured armor-courier deliveries.</p>

              <form onSubmit={handleSaveAddress} className="address-form">
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Recipient Name</label>
                    <input 
                      type="text" 
                      required 
                      value={address.name}
                      onChange={(e) => setAddress({...address, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Phone</label>
                    <input 
                      type="text" 
                      required 
                      value={address.phone}
                      onChange={(e) => setAddress({...address, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Street Address</label>
                  <input 
                    type="text" 
                    required 
                    value={address.street}
                    onChange={(e) => setAddress({...address, street: e.target.value})}
                  />
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>City</label>
                    <input 
                      type="text" 
                      required 
                      value={address.city}
                      onChange={(e) => setAddress({...address, city: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Postal Code / ZIP</label>
                    <input 
                      type="text" 
                      required 
                      value={address.postalCode}
                      onChange={(e) => setAddress({...address, postalCode: e.target.value})}
                    />
                  </div>
                </div>

                <button type="submit" className="gold-button solid save-address-btn">
                  {addressSaved ? <><Check size={16} /> Saved Registry Address</> : 'Update Delivery Address'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
