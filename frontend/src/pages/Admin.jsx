import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, getDocs, doc, setDoc, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { 
  ShieldCheck, Plus, Edit2, Trash2, LayoutDashboard, ShoppingBag, 
  ClipboardList, LogOut, Check, X, Users as UsersIcon, Ticket 
} from 'lucide-react';
import './Admin.css';

export default function Admin() {
  const { user, authenticatedFetch, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State for Adding / Editing Product
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productFormData, setProductFormData] = useState({
    name: '',
    brand: 'Astraire Private Blend',
    description: '',
    price: '',
    image: '',
    category: 'Woody',
    top_notes: '',
    middle_notes: '',
    base_notes: '',
    stock: 10
  });

  // Coupon Creation Form Modal State
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponFormData, setCouponFormData] = useState({
    code: '',
    discountType: 'percent',
    discountValue: '',
    minSpend: '',
    description: ''
  });

  // Cloudinary client image upload state
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert("Cloudinary keys (VITE_CLOUDINARY_CLOUD_NAME & VITE_CLOUDINARY_UPLOAD_PRESET) are not configured. Direct client-side image uploading disabled.");
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setProductFormData(prev => ({ ...prev, image: data.secure_url }));
      } else {
        throw new Error(data.error?.message || 'Direct upload process failed');
      }
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Check admin rights
  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
    }
  }, [isAdmin, navigate]);

  // Load Products, Orders, Users, & Coupons
  const loadData = async () => {
    if (!isAdmin) return;
    setLoading(true);

    const localOrders = JSON.parse(localStorage.getItem('aura_mock_orders') || '[]');

    try {
      // 1. Fetch Products
      let prodData = [];
      if (db) {
        try {
          const snap = await getDocs(collection(db, 'products'));
          snap.forEach(docSnap => {
            prodData.push({ id: docSnap.id, ...docSnap.data() });
          });
        } catch (e) {
          console.error("Firestore read products error:", e);
        }
      }
      
      if (prodData.length === 0) {
        prodData = [
          { id: '1', name: 'Oud Élixir', brand: 'Astraire Private Blend', category: 'Woody', price: 24500, stock: 12, description: 'Compounded matured Cambodian Oud absolute resins.' },
          { id: '2', name: 'Aurée', brand: 'Astraire Private Blend', category: 'Floral', price: 18500, stock: 8, description: 'Bulgarian Rose Damascena blended with absolute Jasmine.' },
          { id: '3', name: 'Santal de Ciel', brand: 'Astraire Private Blend', category: 'Woody', price: 21000, stock: 15, description: 'Aged Mysore Sandalwood extract with ambergris fixatives.' },
          { id: '4', name: 'Noir Extrême', brand: 'Astraire Private Blend', category: 'Oriental', price: 26000, stock: 5, description: 'Black Vanilla beans macerated in Limousin oak barrels.' }
        ];
      }
      setProducts(prodData);

      // 2. Fetch Orders
      let dbOrders = [];
      if (db) {
        try {
          const snap = await getDocs(collection(db, 'orders'));
          snap.forEach(docSnap => {
            dbOrders.push({ id: docSnap.id, ...docSnap.data() });
          });
        } catch (e) {
          console.error("Firestore read orders error:", e);
        }
      }

      // Merge database orders and local mock orders
      const mergedOrders = [...dbOrders];
      localOrders.forEach(localOrder => {
        if (!mergedOrders.some(dbOrder => dbOrder.id === localOrder.id)) {
          mergedOrders.push(localOrder);
        }
      });
      mergedOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setOrders(mergedOrders);

      // 3. Fetch Registered Users
      let userData = [];
      if (db) {
        try {
          const snap = await getDocs(collection(db, 'users'));
          snap.forEach(docSnap => {
            userData.push({ id: docSnap.id, ...docSnap.data() });
          });
        } catch (e) {
          console.error("Firestore read users error:", e);
        }
      }
      const mockUsers = [
        { id: '1', email: 'admin@astraire.com', role: 'admin' },
        { id: '2', email: 'user@astraire.com', role: 'user' },
        { id: '3', email: 'customer@astraire.com', role: 'user' },
        { id: '4', email: 'connoisseur@luxury.com', role: 'user' }
      ];
      const mergedUsers = [...userData];
      mockUsers.forEach(mu => {
        if (!mergedUsers.some(u => u.email === mu.email)) {
          mergedUsers.push(mu);
        }
      });
      setUsersList(mergedUsers);

      // 4. Fetch/Seed Coupons
      const savedCoupons = localStorage.getItem('aura_coupons');
      if (savedCoupons) {
        setCoupons(JSON.parse(savedCoupons));
      } else {
        const defaultCoupons = [
          { code: 'ASTRA10', discountType: 'percent', discountValue: 10, minSpend: 5000, description: '10% off all private compounding reserves.' },
          { code: 'ROYAL20', discountType: 'percent', discountValue: 20, minSpend: 15000, description: '20% off priority reserves for connoisseurs.' },
          { code: 'WELCOME1000', discountType: 'flat', discountValue: 1000, minSpend: 10000, description: 'Flat ₹1,000 off on first catalog purchase.' }
        ];
        localStorage.setItem('aura_coupons', JSON.stringify(defaultCoupons));
        setCoupons(defaultCoupons);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading admin dashboard data:", error);
      setOrders(localOrders);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  // Handle Log Out
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Open Form to Add Product
  const handleOpenAddForm = () => {
    setEditingProduct(null);
    setProductFormData({
      name: '',
      brand: 'Astraire Private Blend',
      description: '',
      price: '',
      image: '',
      category: 'Woody',
      top_notes: '',
      middle_notes: '',
      base_notes: '',
      stock: 10
    });
    setShowProductForm(true);
  };

  // Open Form to Edit Product
  const handleOpenEditForm = (prod) => {
    setEditingProduct(prod);
    setProductFormData({
      name: prod.name,
      brand: prod.brand,
      description: prod.description || '',
      price: prod.price,
      image: prod.image || '',
      category: prod.category,
      top_notes: prod.top_notes || '',
      middle_notes: prod.middle_notes || '',
      base_notes: prod.base_notes || '',
      stock: prod.stock
    });
    setShowProductForm(true);
  };

  // Submit Product Form
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: productFormData.name,
      brand: productFormData.brand,
      description: productFormData.description,
      price: Number(productFormData.price),
      image: productFormData.image,
      category: productFormData.category,
      top_notes: productFormData.top_notes,
      middle_notes: productFormData.middle_notes,
      base_notes: productFormData.base_notes,
      stock: Number(productFormData.stock)
    };

    if (db) {
      try {
        if (editingProduct) {
          await setDoc(doc(db, 'products', editingProduct.id), payload, { merge: true });
        } else {
          await addDoc(collection(db, 'products'), payload);
        }
        setShowProductForm(false);
        loadData();
        return;
      } catch (err) {
        console.error("Firestore save product failed:", err);
        alert("Firestore Error: " + err.message);
        return;
      }
    }

    alert("Firestore not initialized. Cannot perform direct DB writes.");
    setShowProductForm(false);
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to retire this fragrance recipe?")) return;

    if (db) {
      try {
        await deleteDoc(doc(db, 'products', id));
        loadData();
        return;
      } catch (err) {
        console.error("Firestore delete product failed:", err);
        alert("Firestore Error: " + err.message);
        return;
      }
    }

    alert("Firestore not initialized. Cannot delete product.");
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (id, newStatus) => {
    const localOrders = JSON.parse(localStorage.getItem('aura_mock_orders') || '[]');
    const isLocal = localOrders.some(o => o.id === id);

    if (isLocal) {
      const updated = localOrders.map(o => o.id === id ? { ...o, status: newStatus } : o);
      localStorage.setItem('aura_mock_orders', JSON.stringify(updated));
      loadData();
      return;
    }

    if (db) {
      try {
        await updateDoc(doc(db, 'orders', id), { status: newStatus });
        loadData();
        return;
      } catch (err) {
        console.error("Firestore order update failed:", err);
      }
    }

    const localUpdated = localOrders.map(o => o.id === id ? { ...o, status: newStatus } : o);
    localStorage.setItem('aura_mock_orders', JSON.stringify(localUpdated));
    loadData();
  };

  // Add Coupon Handler
  const handleAddCoupon = (e) => {
    e.preventDefault();
    if (!couponFormData.code) return;

    const newCode = {
      code: couponFormData.code.toUpperCase().trim(),
      discountType: couponFormData.discountType,
      discountValue: Number(couponFormData.discountValue),
      minSpend: Number(couponFormData.minSpend || 0),
      description: couponFormData.description
    };

    const updated = [...coupons, newCode];
    setCoupons(updated);
    localStorage.setItem('aura_coupons', JSON.stringify(updated));
    setShowCouponModal(false);
    setCouponFormData({ code: '', discountType: 'percent', discountValue: '', minSpend: '', description: '' });
  };

  // Delete Coupon Handler
  const handleDeleteCoupon = (code) => {
    if (!window.confirm(`Are you sure you want to retire coupon ${code}?`)) return;
    const updated = coupons.filter(c => c.code !== code);
    setCoupons(updated);
    localStorage.setItem('aura_coupons', JSON.stringify(updated));
  };

  // Math Statistics
  const totalRevenue = orders.reduce((sum, order) => {
    return order.status === 'completed' || order.status === 'pending' || order.status === 'processing'
      ? sum + order.total_amount 
      : sum;
  }, 0);

  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  if (!isAdmin) return null;

  return (
    <div className="admin-page container animate-fade">
      <div className="admin-layout">
        {/* Sidebar Nav */}
        <aside className="admin-sidebar glass-panel">
          <div className="admin-profile-badge">
            <ShieldCheck size={28} className="gold-icon" />
            <div>
              <h3>House Vault</h3>
              <p>Security Level: Admin</p>
            </div>
          </div>

          <div className="sidebar-nav">
            <button 
              className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button 
              className={`nav-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <ShoppingBag size={18} /> Catalog Management
            </button>
            <button 
              className={`nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <ClipboardList size={18} /> Order Monitor {pendingOrders > 0 && <span className="nav-badge">{pendingOrders}</span>}
            </button>
            <button 
              className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <UsersIcon size={18} /> Registrants Vault
            </button>
            <button 
              className={`nav-btn ${activeTab === 'coupons' ? 'active' : ''}`}
              onClick={() => setActiveTab('coupons')}
            >
              <Ticket size={18} /> Treasury Promos
            </button>
          </div>

          <button onClick={handleLogout} className="admin-logout-btn">
            <LogOut size={16} /> Close Vault Session
          </button>
        </aside>

        {/* Content Pane */}
        <main className="admin-content-pane">
          {loading ? (
            <div className="admin-loading">
              <div className="spinner"></div>
              <p>Unlocking admin ledger...</p>
            </div>
          ) : (
            <>
              {/* Tab 1: Dashboard */}
              {activeTab === 'dashboard' && (
                <div className="tab-content dashboard-tab animate-fade">
                  <h2>Executive Overview</h2>
                  <div className="stats-grid">
                    <div className="stat-card glass-panel">
                      <span className="stat-title">House Income</span>
                      <span className="stat-value">₹{totalRevenue.toLocaleString('en-IN')}</span>
                      <span className="stat-desc">From completed & pending acquisitions</span>
                    </div>

                    <div className="stat-card glass-panel">
                      <span className="stat-title">Total Orders</span>
                      <span className="stat-value">{orders.length}</span>
                      <span className="stat-desc">{pendingOrders} pending fulfillment</span>
                    </div>

                    <div className="stat-card glass-panel">
                      <span className="stat-title">Catalog Reserves</span>
                      <span className="stat-value">{products.length}</span>
                      <span className="stat-desc">Private extract recipes active</span>
                    </div>
                  </div>

                  {/* Recent Orders table preview */}
                  <div className="recent-orders-section glass-panel">
                    <h3>Recent Acquisitions Logs</h3>
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Acquirer</th>
                            <th>Charge</th>
                            <th>Fulfillment Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.slice(0, 5).map((order) => (
                            <tr key={order.id}>
                              <td>#AE-{order.id}</td>
                              <td>{order.user_email}</td>
                              <td className="gold-text">₹{order.total_amount.toLocaleString('en-IN')}</td>
                              <td>
                                <span className={`status-badge ${order.status}`}>{order.status}</span>
                              </td>
                            </tr>
                          ))}
                          {orders.length === 0 && (
                            <tr>
                              <td colSpan="4" className="empty-row">No orders recorded yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Catalog Management */}
              {activeTab === 'products' && (
                <div className="tab-content products-tab animate-fade">
                  <div className="tab-header">
                    <h2>Catalog Reserves</h2>
                    <button onClick={handleOpenAddForm} className="gold-button solid">
                      <Plus size={16} /> Compound New Blend
                    </button>
                  </div>

                  {showProductForm && (
                    <div className="form-modal-overlay">
                      <div className="product-form-card glass-panel animate-fade">
                        <div className="form-header">
                          <h3>{editingProduct ? 'Modify Secret Recipe' : 'Add New Formulation'}</h3>
                          <button onClick={() => setShowProductForm(false)} className="close-form-btn">
                            <X size={20} />
                          </button>
                        </div>

                        <form onSubmit={handleProductSubmit} className="product-admin-form">
                          <div className="form-row">
                            <div className="form-group">
                              <label>Fragrance Name</label>
                              <input 
                                type="text" 
                                required 
                                value={productFormData.name} 
                                onChange={(e) => setProductFormData({...productFormData, name: e.target.value})} 
                              />
                            </div>
                            <div className="form-group">
                              <label>Brand House</label>
                              <input 
                                type="text" 
                                required 
                                value={productFormData.brand} 
                                onChange={(e) => setProductFormData({...productFormData, brand: e.target.value})} 
                              />
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label>Retail Price (₹)</label>
                              <input 
                                type="number" 
                                required 
                                value={productFormData.price} 
                                onChange={(e) => setProductFormData({...productFormData, price: e.target.value})} 
                              />
                            </div>
                            <div className="form-group">
                              <label>Concentration Category</label>
                              <select 
                                value={productFormData.category} 
                                onChange={(e) => setProductFormData({...productFormData, category: e.target.value})}
                              >
                                <option value="Woody">Woody</option>
                                <option value="Floral">Floral</option>
                                <option value="Fresh">Fresh</option>
                                <option value="Oriental">Oriental</option>
                              </select>
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label>Image Reference URL</label>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input 
                                  type="text" 
                                  value={productFormData.image} 
                                  onChange={(e) => setProductFormData({...productFormData, image: e.target.value})} 
                                  style={{ flexGrow: 1 }}
                                />
                                <label className="gold-button solid" style={{ margin: 0, padding: '0.4rem 0.75rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                  Upload
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageUpload} 
                                    style={{ display: 'none' }}
                                    disabled={uploadingImage}
                                  />
                                </label>
                              </div>
                              {uploadingImage && <span style={{ fontSize: '0.7rem', color: 'var(--gold)', marginTop: '0.2rem', display: 'block' }}>Uploading to Cloudinary...</span>}
                            </div>
                            <div className="form-group">
                              <label>Initial Stock (Units)</label>
                              <input 
                                type="number" 
                                required 
                                value={productFormData.stock} 
                                onChange={(e) => setProductFormData({...productFormData, stock: e.target.value})} 
                              />
                            </div>
                          </div>

                          <div className="form-row note-inputs">
                            <div className="form-group">
                              <label>Top Accord Notes</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Saffron, Rose"
                                value={productFormData.top_notes} 
                                onChange={(e) => setProductFormData({...productFormData, top_notes: e.target.value})} 
                              />
                            </div>
                            <div className="form-group">
                              <label>Heart Accord Notes</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Amberwood"
                                value={productFormData.middle_notes} 
                                onChange={(e) => setProductFormData({...productFormData, middle_notes: e.target.value})} 
                              />
                            </div>
                            <div className="form-group">
                              <label>Base Accord Notes</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Cedar, Musk"
                                value={productFormData.base_notes} 
                                onChange={(e) => setProductFormData({...productFormData, base_notes: e.target.value})} 
                              />
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Descriptive Summary</label>
                            <textarea 
                              rows="3" 
                              value={productFormData.description} 
                              onChange={(e) => setProductFormData({...productFormData, description: e.target.value})} 
                            />
                          </div>

                          <button type="submit" className="gold-button solid save-product-btn">
                            Save Recipe details
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  <div className="products-table-card glass-panel">
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Image</th>
                            <th>Blend</th>
                            <th>Family</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((prod) => (
                            <tr key={prod.id}>
                              <td>
                                <div className="product-table-img">
                                  <img src={prod.image} alt={prod.name} />
                                </div>
                              </td>
                              <td>
                                <div className="product-table-name">
                                  <strong>{prod.name}</strong>
                                  <span>{prod.brand}</span>
                                </div>
                              </td>
                              <td>{prod.category}</td>
                              <td className="gold-text">₹{prod.price.toLocaleString('en-IN')}</td>
                              <td>{prod.stock} left</td>
                              <td>
                                <div className="action-btns">
                                  <button onClick={() => handleOpenEditForm(prod)} className="edit-btn" title="Modify recipe details"><Edit2 size={14}/></button>
                                  <button onClick={() => handleDeleteProduct(prod.id)} className="delete-btn" title="Decommission blend"><Trash2 size={14}/></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Orders Monitor */}
              {activeTab === 'orders' && (
                <div className="tab-content orders-tab animate-fade">
                  <h2>Acquisitions Dashboard Monitor</h2>

                  <div className="orders-table-card glass-panel">
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Acquirer</th>
                            <th>Details</th>
                            <th>Total Charge</th>
                            <th>Fulfillment Status</th>
                            <th>Mark Fulfillment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr key={order.id}>
                              <td>#AE-{order.id}</td>
                              <td>
                                <div className="customer-info-cell">
                                  <span>{order.user_name}</span>
                                  <span className="email-sub">{order.user_email}</span>
                                </div>
                              </td>
                              <td>
                                <div className="items-list-cell">
                                  {order.items.map((it, idx) => (
                                    <span key={idx} className="item-token">
                                      {it.qty}x {it.name}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="gold-text">₹{order.total_amount.toLocaleString('en-IN')}</td>
                              <td>
                                <span className={`status-badge ${order.status}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td>
                                <div className="status-actions">
                                  {order.status !== 'completed' && (
                                    <button 
                                      onClick={() => handleUpdateOrderStatus(order.id, 'completed')} 
                                      className="complete-order-btn"
                                      title="Mark Dispatched / Completed"
                                    >
                                      <Check size={14} /> Complete
                                    </button>
                                  )}
                                  {order.status !== 'cancelled' && (
                                    <button 
                                      onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')} 
                                      className="cancel-order-btn"
                                      title="Void / Cancel Transaction"
                                    >
                                      <X size={14} /> Void
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                          {orders.length === 0 && (
                            <tr>
                              <td colSpan="6" className="empty-row">No orders recorded yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Registrants Vault (Users List) */}
              {activeTab === 'users' && (
                <div className="tab-content users-tab animate-fade">
                  <h2>Registrants Vault (Users List)</h2>
                  <div className="orders-table-card glass-panel">
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>User ID</th>
                            <th>Email Address</th>
                            <th>Role / Clearance Level</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usersList.map((usr) => (
                            <tr key={usr.id}>
                              <td>#{usr.id}</td>
                              <td>{usr.email}</td>
                              <td>
                                <span className={`status-badge ${usr.role === 'admin' ? 'completed' : 'pending'}`}>
                                  {usr.role.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Treasury Promos (Coupons Manager) */}
              {activeTab === 'coupons' && (
                <div className="tab-content coupons-tab animate-fade">
                  <div className="tab-header">
                    <h2>Treasury Promos (Coupons Manager)</h2>
                    <button onClick={() => setShowCouponModal(true)} className="gold-button solid">
                      <Plus size={16} /> Create Promo Code
                    </button>
                  </div>

                  {showCouponModal && (
                    <div className="form-modal-overlay">
                      <div className="product-form-card glass-panel animate-fade">
                        <div className="form-header">
                          <h3>Create Treasury Promo Code</h3>
                          <button onClick={() => setShowCouponModal(false)} className="close-form-btn">
                            <X size={20} />
                          </button>
                        </div>

                        <form onSubmit={handleAddCoupon} className="product-admin-form">
                          <div className="form-row">
                            <div className="form-group">
                              <label>Promo Code (Uppercase)</label>
                              <input 
                                type="text" 
                                required 
                                placeholder="e.g. ASTRA50"
                                value={couponFormData.code} 
                                onChange={(e) => setCouponFormData({...couponFormData, code: e.target.value})} 
                              />
                            </div>
                            <div className="form-group">
                              <label>Discount Type</label>
                              <select 
                                value={couponFormData.discountType} 
                                onChange={(e) => setCouponFormData({...couponFormData, discountType: e.target.value})}
                              >
                                <option value="percent">Percentage Off (%)</option>
                                <option value="flat">Flat Discount (₹)</option>
                              </select>
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label>Discount Value</label>
                              <input 
                                type="number" 
                                required 
                                placeholder="e.g. 10 or 1000"
                                value={couponFormData.discountValue} 
                                onChange={(e) => setCouponFormData({...couponFormData, discountValue: e.target.value})} 
                              />
                            </div>
                            <div className="form-group">
                              <label>Minimum Purchase (₹)</label>
                              <input 
                                type="number" 
                                placeholder="e.g. 5000"
                                value={couponFormData.minSpend} 
                                onChange={(e) => setCouponFormData({...couponFormData, minSpend: e.target.value})} 
                              />
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Promotion Description</label>
                            <textarea 
                              rows="2" 
                              required
                              placeholder="Describe the offer rules..."
                              value={couponFormData.description} 
                              onChange={(e) => setCouponFormData({...couponFormData, description: e.target.value})} 
                            />
                          </div>

                          <button type="submit" className="gold-button solid save-product-btn">
                            Activate Promo Code
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  <div className="orders-table-card glass-panel">
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Promo Code</th>
                            <th>Value</th>
                            <th>Min Purchase</th>
                            <th>Offer Details</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {coupons.map((coupon, index) => (
                            <tr key={index}>
                              <td className="gold-text"><strong>{coupon.code}</strong></td>
                              <td>{coupon.discountType === 'percent' ? `${coupon.discountValue}% Off` : `₹${coupon.discountValue} Off`}</td>
                              <td>₹{(coupon.minSpend || 0).toLocaleString('en-IN')}</td>
                              <td>{coupon.description}</td>
                              <td>
                                <button 
                                  onClick={() => handleDeleteCoupon(coupon.code)} 
                                  className="delete-btn"
                                  title="Retire promo code"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {coupons.length === 0 && (
                            <tr>
                              <td colSpan="5" className="empty-row">No active promo codes found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
