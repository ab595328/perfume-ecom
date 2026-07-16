import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { User, ClipboardList, LogOut, Compass, MapPin, Sparkles, Check, PackageOpen, ShieldCheck, Award } from 'lucide-react';
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
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [consultationRequested, setConsultationRequested] = useState(false);
  const [consultationData, setConsultationData] = useState({
    date: '',
    slot: 'afternoon',
    accords: '',
    notes: ''
  });

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

    // Load user orders from Firestore and local mockup storage
    const fetchUserOrders = async () => {
      setLoadingOrders(true);
      const localOrders = JSON.parse(localStorage.getItem('aura_mock_orders') || '[]')
        .filter(order => order.user_email.toLowerCase() === user.email.toLowerCase());

      if (db) {
        try {
          const q = query(
            collection(db, 'orders'),
            where('user_email', '==', user.email.toLowerCase().trim())
          );
          
          const querySnapshot = await getDocs(q);
          const dbOrders = [];
          querySnapshot.forEach(docSnap => {
            dbOrders.push({ id: docSnap.id, ...docSnap.data() });
          });

          // Merge database and local mockup orders, filtering duplicates by ID
          const merged = [...dbOrders];
          localOrders.forEach(localOrder => {
            if (!merged.some(dbOrder => dbOrder.id === localOrder.id)) {
              merged.push(localOrder);
            }
          });
          merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setOrders(merged);
          setLoadingOrders(false);
          return;
        } catch (err) {
          console.error("Firestore user orders read failed:", err);
        }
      }

      setOrders(localOrders);
      setLoadingOrders(false);
    };

    // Fetch products for recommendations
    const fetchRecommendations = async () => {
      let list = [];
      if (db) {
        try {
          const snap = await getDocs(collection(db, 'products'));
          snap.forEach(docSnap => {
            list.push({ id: docSnap.id, ...docSnap.data() });
          });
        } catch (e) {
          console.error("Error fetching recommended products:", e);
        }
      }
      if (list.length === 0) {
        list = [
          { id: '1', name: 'Oud Élixir', brand: 'Astraire Private Blend', category: 'Woody', price: 24500, image: '/images/oud_elixir.png' },
          { id: '2', name: 'Aurée', brand: 'Astraire Private Blend', category: 'Floral', price: 18500, image: '/images/auree.png' },
          { id: '3', name: 'Santal de Ciel', brand: 'Astraire Private Blend', category: 'Woody', price: 21000, image: '/images/santal_ciel.png' },
          { id: '4', name: 'Noir Extrême', brand: 'Astraire Private Blend', category: 'Oriental', price: 26000, image: '/images/noir_extreme.png' }
        ];
      }
      
      const quizResults = localStorage.getItem('scent_quiz_results');
      let family = quizResults ? JSON.parse(quizResults).family : null;
      
      const filtered = family 
        ? list.filter(p => p.category.toLowerCase() === family.toLowerCase()).slice(0, 3)
        : list.slice(0, 3);
        
      setRecommendedProducts(filtered.length > 0 ? filtered : list.slice(0, 3));
    };

    fetchUserOrders();
    fetchRecommendations();
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

  const handleBookConsultation = (e) => {
    e.preventDefault();
    setConsultationRequested(true);
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
              className={`profile-nav-btn ${activeSubTab === 'membership' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('membership')}
            >
              <ShieldCheck size={16} /> Club Royale Status
            </button>
            <button 
              className={`profile-nav-btn ${activeSubTab === 'recommendations' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('recommendations')}
            >
              <Award size={16} /> Olfactory Recommendations
            </button>
            <button 
              className={`profile-nav-btn ${activeSubTab === 'consultation' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('consultation')}
            >
              <Compass size={16} /> Private Consultation
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

          {activeSubTab === 'membership' && (
            <div className="profile-membership-tab animate-fade">
              <h2>Club Royale Loyalty Membership</h2>
              <div className="title-underline left"></div>
              <p className="tab-desc">Your status in the elite circle of perfume connoisseurs.</p>
              
              {(() => {
                const totalSpend = orders.reduce((sum, o) => sum + o.total_amount, 0);
                const tier = totalSpend >= 50000 ? 'Imperial Platinum Connoisseur' : totalSpend >= 20000 ? 'Royal Gold Collector' : 'Club Silver Initiate';
                const points = Math.floor(totalSpend / 100);
                
                let nextTier = '';
                let progressPercent = 0;
                let targetSpend = 0;
                if (totalSpend < 20000) {
                  nextTier = 'Royal Gold Collector';
                  targetSpend = 20000;
                  progressPercent = Math.min(100, (totalSpend / 20000) * 100);
                } else if (totalSpend < 50000) {
                  nextTier = 'Imperial Platinum Connoisseur';
                  targetSpend = 50000;
                  progressPercent = Math.min(100, ((totalSpend - 20000) / 30000) * 100);
                }

                return (
                  <div className="vip-tier-card glass-panel">
                    <span className="vip-badge-large">{tier}</span>
                    <p className="vip-tier-desc" style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Thank you for compounding your luxury journey with Astraire.</p>
                    
                    <div className="vip-stats-row">
                      <div className="vip-stat-box" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '1.25rem', borderRadius: '6px', textAlign: 'center' }}>
                        <span className="vip-stat-val" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)' }}>₹{totalSpend.toLocaleString('en-IN')}</span>
                        <span className="vip-stat-label" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginTop: '0.25rem' }}>Total Acquisition Value</span>
                      </div>
                      <div className="vip-stat-box" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '1.25rem', borderRadius: '6px', textAlign: 'center' }}>
                        <span className="vip-stat-val" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)' }}>{points.toLocaleString()} pts</span>
                        <span className="vip-stat-label" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginTop: '0.25rem' }}>Royale Loyalty Points</span>
                      </div>
                    </div>

                    {nextTier && (
                      <div className="tier-progress-section" style={{ margin: '2rem 0' }}>
                        <div className="tier-progress-label" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                          <span>Progress to {nextTier}</span>
                          <span>₹{totalSpend.toLocaleString('en-IN')} / ₹{targetSpend.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="tier-progress-track" style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div className="tier-progress-fill" style={{ height: '100%', background: 'linear-gradient(90deg, var(--gold-dark), var(--gold))', width: `${progressPercent}%` }}></div>
                        </div>
                      </div>
                    )}

                    <div className="vip-privileges-box" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold-light)', marginBottom: '1rem' }}>Your Exclusive Privileges</h4>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <li style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={14} className="gold-icon" /> Complimentary insured armored-courier transport delivery.</li>
                        <li style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={14} className="gold-icon" /> Priority preview allocations of secret vintage distillations.</li>
                        <li style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={14} className="gold-icon" /> Double points on private blend compounding selections.</li>
                        {totalSpend >= 20000 && (
                          <li style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={14} className="gold-icon" /> Complimentary 15ml seasonal master perfumer decants.</li>
                        )}
                        {totalSpend >= 50000 && (
                          <li style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={14} className="gold-icon" /> Access to private, physical laboratory blending sessions.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {activeSubTab === 'recommendations' && (
            <div className="profile-recommendations-tab animate-fade">
              <h2>Olfactory Recommendations</h2>
              <div className="title-underline left"></div>
              <p className="tab-desc">Bespoke fragrance matches curated for your skin chemistry and olfactory archetype.</p>
              
              {recommendedProducts.length === 0 ? (
                <p>Loading curated recommendations...</p>
              ) : (
                <div className="rec-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                  {recommendedProducts.map((prod) => (
                    <div key={prod.id} className="rec-card glass-panel animate-fade" style={{ padding: '1.25rem', borderRadius: '8px', background: 'var(--bg-card)' }}>
                      <div className="rec-img-wrap" style={{ height: '180px', overflow: 'hidden', borderRadius: '6px', marginBottom: '0.85rem' }}>
                        <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div className="rec-details">
                        <span className="card-brand" style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', letterSpacing: '0.1em' }}>{prod.brand}</span>
                        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', margin: '0.2rem 0' }}>{prod.name}</h4>
                        <p style={{ fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>{prod.category} Family</p>
                        <div className="rec-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.75rem' }}>
                          <span className="rec-price" style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>₹{prod.price.toLocaleString('en-IN')}</span>
                          <Link to={`/product/${prod.id}`} className="gold-button solid" style={{ padding: '0.35rem 0.75rem', fontSize: '0.65rem', letterSpacing: '0.1em' }}>
                            Explore
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'consultation' && (
            <div className="profile-consultation-tab animate-fade">
              <h2>Master Perfumer Consultation</h2>
              <div className="title-underline left"></div>
              <p className="tab-desc">Request a private virtual session with Astraire's chief compounder to design a bespoke fragrance.</p>
              
              {consultationRequested ? (
                <div className="consultation-success glass-panel animate-fade" style={{ padding: '3rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', background: 'var(--bg-card)' }}>
                  <Sparkles size={48} className="gold-icon" />
                  <h3>Consultation Requested</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>Our chief compounder has been notified. A vault assistant will contact you at <strong>{user.email}</strong> shortly to finalize your schedule on <strong>{consultationData.date} ({consultationData.slot})</strong>.</p>
                  <button onClick={() => setConsultationRequested(false)} className="gold-button">
                    Request Another Session
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookConsultation} className="consultation-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Note: changed onSubmit to handleBookConsultation */}
                  <div className="form-group-row">
                    <div className="form-group">
                      <label>Preferred Consultation Date</label>
                      <input 
                        type="date" 
                        required 
                        value={consultationData.date}
                        onChange={(e) => setConsultationData({...consultationData, date: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Preferred Time Slot</label>
                      <select 
                        value={consultationData.slot}
                        onChange={(e) => setConsultationData({...consultationData, slot: e.target.value})}
                        style={{ background: 'var(--bg-darker)', color: 'var(--text-primary)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '0.75rem', borderRadius: '4px', outline: 'none', height: '42px', fontSize: '0.85rem' }}
                      >
                        <option value="morning">Morning (10:00 AM - 12:00 PM)</option>
                        <option value="afternoon">Afternoon (2:00 PM - 5:00 PM)</option>
                        <option value="evening">Evening (6:00 PM - 8:00 PM)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Olfactory Notes / Accords You Adore</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Saffron, Smoky Oud, White Iris"
                      value={consultationData.accords}
                      onChange={(e) => setConsultationData({...consultationData, accords: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>Aura / Mood / Narrative to Evoke</label>
                    <textarea 
                      rows="3" 
                      placeholder="Describe the mood, environment, or memory you want your bespoke fragrance to capture..."
                      value={consultationData.notes}
                      onChange={(e) => setConsultationData({...consultationData, notes: e.target.value})}
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)', padding: '0.75rem', borderRadius: '4px', resize: 'vertical' }}
                    />
                  </div>

                  <button type="submit" className="gold-button solid" onClick={handleBookConsultation} style={{ alignSelf: 'flex-start' }}>
                    Submit Concierge Request
                  </button>
                </form>
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
