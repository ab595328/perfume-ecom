import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Plus, Edit2, Trash2, LayoutDashboard, ShoppingBag, ClipboardList, LogOut, Check, X } from 'lucide-react';
import './Admin.css';

export default function Admin() {
  const { user, authenticatedFetch, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State for Adding / Editing Product
  const [editingProduct, setEditingProduct] = useState(null); // Null if adding, product object if editing
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

  // Check admin rights
  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
    }
  }, [isAdmin, navigate]);

  // Load Products & Orders
  const loadData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      // Load Products
      const prodRes = await fetch('http://localhost:5000/api/products');
      const prodData = await prodRes.json();
      setProducts(prodData);

      // Load Orders
      const orderRes = await authenticatedFetch('http://localhost:5000/api/orders');
      const orderData = await orderRes.json();
      setOrders(orderRes.ok ? orderData : []);

      setLoading(false);
    } catch (error) {
      console.error("Error loading admin dashboard data:", error);
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

  // Open Form to Add
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

  // Open Form to Edit
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
    const url = editingProduct 
      ? `http://localhost:5000/api/products/${editingProduct.id}`
      : 'http://localhost:5000/api/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify({
          ...productFormData,
          price: Number(productFormData.price),
          stock: Number(productFormData.stock)
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save product');

      setShowProductForm(false);
      loadData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to retire this fragrance recipe?")) return;

    try {
      const response = await authenticatedFetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete product');
      }

      loadData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (id, newStatus) => {
    try {
      const response = await authenticatedFetch(`http://localhost:5000/api/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update order status');
      }

      loadData();
    } catch (err) {
      alert("Error: " + err.message);
    }
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
      {/* Sidebar Nav */}
      <div className="admin-layout">
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
          </div>

          <button onClick={handleLogout} className="admin-logout-btn">
            <LogOut size={16} /> Close Vault Session
          </button>
        </aside>

        {/* Content Panel */}
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
                    <h3>Recent Acquisitions</h3>
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.slice(0, 5).map((order) => (
                            <tr key={order.id}>
                              <td>#AE-{order.id}</td>
                              <td>
                                <div className="customer-info-cell">
                                  <span>{order.user_name}</span>
                                  <span className="email-sub">{order.user_email}</span>
                                </div>
                              </td>
                              <td className="gold-text">₹{order.total_amount.toLocaleString('en-IN')}</td>
                              <td>
                                <span className={`status-badge ${order.status}`}>
                                  {order.status}
                                </span>
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

              {/* Tab 2: Products Management */}
              {activeTab === 'products' && (
                <div className="tab-content products-tab animate-fade">
                  <div className="tab-header">
                    <h2>Fragrance Catalog Manager</h2>
                    <button className="gold-button solid" onClick={handleOpenAddForm}>
                      <Plus size={16} /> Blend New Perfume
                    </button>
                  </div>

                  {showProductForm && (
                    <div className="form-modal-overlay">
                      <div className="product-form-card glass-panel animate-fade">
                        <div className="form-header">
                          <h3>{editingProduct ? `Refining Recipe: ${editingProduct.name}` : 'Formulate New Fragrance'}</h3>
                          <button className="close-form-btn" onClick={() => setShowProductForm(false)}><X size={18}/></button>
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
                              <label>Brand / House Line</label>
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
                              <label>Category (Scent Family)</label>
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
                            <div className="form-group">
                              <label>Retail Price ($)</label>
                              <input 
                                type="number" 
                                step="0.01" 
                                required 
                                value={productFormData.price} 
                                onChange={(e) => setProductFormData({...productFormData, price: e.target.value})} 
                              />
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label>Bottle Image URL</label>
                              <input 
                                type="text" 
                                value={productFormData.image} 
                                onChange={(e) => setProductFormData({...productFormData, image: e.target.value})} 
                                placeholder="https://unsplash.com/..."
                              />
                            </div>
                            <div className="form-group">
                              <label>Stock Qty</label>
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
                              <label>Top Notes</label>
                              <input 
                                type="text" 
                                value={productFormData.top_notes} 
                                onChange={(e) => setProductFormData({...productFormData, top_notes: e.target.value})} 
                                placeholder="e.g. Cardamom, Lemon"
                              />
                            </div>
                            <div className="form-group">
                              <label>Heart (Middle) Notes</label>
                              <input 
                                type="text" 
                                value={productFormData.middle_notes} 
                                onChange={(e) => setProductFormData({...productFormData, middle_notes: e.target.value})} 
                                placeholder="e.g. Rose, Jasmine"
                              />
                            </div>
                            <div className="form-group">
                              <label>Base Notes</label>
                              <input 
                                type="text" 
                                value={productFormData.base_notes} 
                                onChange={(e) => setProductFormData({...productFormData, base_notes: e.target.value})} 
                                placeholder="e.g. Amber, Sandalwood"
                              />
                            </div>
                          </div>

                          <div className="form-group full-width">
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
            </>
          )}
        </main>
      </div>
    </div>
  );
}
