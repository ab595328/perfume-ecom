import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CreditCard, CheckCircle, Sparkles, MapPin, Mail, User, ShieldCheck } from 'lucide-react';
import './Checkout.css';

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: formData.name,
          user_email: formData.email,
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            qty: item.qty
          })),
          total_amount: cartTotal
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to place order');

      // Luxury simulated payment delay
      setTimeout(() => {
        setCreatedOrderId(data.id);
        setOrderSuccess(true);
        setIsSubmitting(false);
        clearCart();
      }, 2000);

    } catch (error) {
      console.error("Checkout order error:", error);
      alert("Error placing order: " + error.message);
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="checkout-success-container container animate-fade">
        <div className="success-card glass-panel">
          <CheckCircle className="success-icon animate-pulse" size={64} />
          <span className="success-subtitle">ACQUISITION COMPLETE</span>
          <h1>Your Signature Awaits</h1>
          <p className="success-desc">
            Your order <strong>#AE-{createdOrderId}</strong> has been secured in the House vault. A confirmation email has been dispatched to <strong>{formData.email}</strong>.
          </p>
          <div className="order-details-summary">
            <h3>Shipment Details</h3>
            <p><strong>Deliveree:</strong> {formData.name}</p>
            <p><strong>Destination:</strong> {formData.address}, {formData.city}</p>
            <p><strong>Carrier:</strong> House Private Courier Service (Insured)</p>
          </div>
          <Link to="/" className="gold-button solid">Return to Homepage</Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-empty-container container">
        <h2>Your Selection is Empty</h2>
        <p>You cannot proceed to checkout with an empty shopping cart.</p>
        <Link to="/shop" className="gold-button">Browse Reserves</Link>
      </div>
    );
  }

  return (
    <div className="checkout-page container animate-fade">
      <div className="checkout-header reveal-item stagger-1">
        <span className="section-subtitle">SECURE ORDER</span>
        <h1>Concierge Checkout</h1>
        <div className="title-underline"></div>
      </div>

      <div className="checkout-layout">
        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="checkout-form reveal-item stagger-2">
          {/* Shipping Address */}
          <div className="form-section glass-panel">
            <div className="section-title">
              <MapPin size={18} className="gold-icon" />
              <h3>Delivery Details</h3>
            </div>
            
            <div className="form-grid">
              <div className="form-group full-width">
                <label><User size={12} /> Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Sterling Archer"
                />
              </div>

              <div className="form-group full-width">
                <label><Mail size={12} /> Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  placeholder="name@luxury.com"
                />
              </div>

              <div className="form-group full-width">
                <label>Shipping Address</label>
                <input 
                  type="text" 
                  name="address" 
                  required 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  placeholder="Street and Number"
                />
              </div>

              <div className="form-group">
                <label>City</label>
                <input 
                  type="text" 
                  name="city" 
                  required 
                  value={formData.city} 
                  onChange={handleInputChange} 
                  placeholder="Beverly Hills"
                />
              </div>

              <div className="form-group">
                <label>Zip Code</label>
                <input 
                  type="text" 
                  name="zip" 
                  required 
                  value={formData.zip} 
                  onChange={handleInputChange} 
                  placeholder="90210"
                />
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="form-section glass-panel">
            <div className="section-title">
              <CreditCard size={18} className="gold-icon" />
              <h3>Private Payment</h3>
            </div>

            <div className="form-grid">
              <div className="form-group full-width">
                <label>Name on Card</label>
                <input 
                  type="text" 
                  name="cardName" 
                  required 
                  value={formData.cardName} 
                  onChange={handleInputChange} 
                  placeholder="Sterling Archer"
                />
              </div>

              <div className="form-group full-width">
                <label>Card Number</label>
                <input 
                  type="text" 
                  name="cardNumber" 
                  required 
                  value={formData.cardNumber} 
                  onChange={handleInputChange} 
                  placeholder="4111 •••• •••• ••••"
                />
              </div>

              <div className="form-group">
                <label>Expiration Date</label>
                <input 
                  type="text" 
                  name="cardExpiry" 
                  required 
                  value={formData.cardExpiry} 
                  onChange={handleInputChange} 
                  placeholder="MM/YY"
                />
              </div>

              <div className="form-group">
                <label>CVC / CVV</label>
                <input 
                  type="text" 
                  name="cardCvc" 
                  required 
                  value={formData.cardCvc} 
                  onChange={handleInputChange} 
                  placeholder="123"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="gold-button solid submit-order-btn" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="small-spinner"></div> Securing Vault Transaction...
              </>
            ) : (
              <>
                <ShieldCheck size={18} /> Authorize Order - ₹{cartTotal.toLocaleString('en-IN')}
              </>
            )}
          </button>
        </form>

        {/* Order Summary Sidebar */}
        <aside className="order-summary-sidebar glass-panel reveal-item stagger-3">
          <h3>Selection Summary</h3>
          <div className="summary-items">
            {cartItems.map((item) => (
              <div key={item.id} className="summary-item">
                <div className="summary-item-info">
                  <span className="summary-item-qty">{item.qty}x</span>
                  <div>
                    <h4>{item.name}</h4>
                    <p className="summary-item-brand">{item.brand}</p>
                  </div>
                </div>
                <span className="summary-item-price">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="totals-row">
              <span>Subtotal</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="totals-row">
              <span>Insured Shipping</span>
              <span className="free-badge">Complimentary</span>
            </div>
            <div className="totals-row border-top">
              <span className="grand-label">Total Acquisition</span>
              <span className="grand-price">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="checkout-guarantee">
            <Sparkles size={16} className="gold-icon" />
            <p>Every Astraire decant is hand-inspected and shipped in sealed custom wax-stamped velvet presentation boxes.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
