import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard, CheckCircle, Sparkles, MapPin, Mail, User, ShieldCheck } from 'lucide-react';
import './Checkout.css';

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '12, Luxury Boulevard, Chanakyapuri',
    city: 'New Delhi',
    zip: '110021',
    cardName: '',
    cardNumber: '4111 2222 3333 4444',
    cardExpiry: '12/28',
    cardCvc: '123'
  });

  // Prefill details if user is authenticated
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.email.split('@')[0].toUpperCase(),
        email: user.email
      }));
    }
  }, [user]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    
    const savedCoupons = JSON.parse(localStorage.getItem('aura_coupons') || '[]');
    const match = savedCoupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase().trim());
    
    if (!match) {
      setCouponError('Invalid promo code');
      setAppliedCoupon(null);
      setDiscountAmount(0);
      return;
    }
    
    if (cartTotal < match.minSpend) {
      setCouponError(`Minimum purchase of ₹${match.minSpend.toLocaleString('en-IN')} required`);
      setAppliedCoupon(null);
      setDiscountAmount(0);
      return;
    }
    
    let discount = 0;
    if (match.discountType === 'percent') {
      discount = Math.round((cartTotal * match.discountValue) / 100);
    } else {
      discount = match.discountValue;
    }
    
    setAppliedCoupon(match);
    setDiscountAmount(discount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setIsSubmitting(true);
    const finalTotal = cartTotal - discountAmount;

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
          total_amount: finalTotal
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
      console.warn("Backend offline or order endpoint failed. Saving offline local mockup order.", error);
      
      const mockId = Math.floor(Math.random() * 9000) + 1000;
      const newMockOrder = {
        id: mockId,
        user_name: formData.name,
        user_email: formData.email,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          qty: item.qty,
          brand: item.brand || 'Astraire Private Blend'
        })),
        total_amount: finalTotal,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      const existingMockOrders = JSON.parse(localStorage.getItem('aura_mock_orders') || '[]');
      existingMockOrders.unshift(newMockOrder);
      localStorage.setItem('aura_mock_orders', JSON.stringify(existingMockOrders));

      setTimeout(() => {
        setCreatedOrderId(mockId);
        setOrderSuccess(true);
        setIsSubmitting(false);
        clearCart();
      }, 2000);
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
                <ShieldCheck size={18} /> Authorize Order - ₹{(cartTotal - discountAmount).toLocaleString('en-IN')}
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

          {/* Coupon Entry Section */}
          <div className="coupon-entry-section" style={{ padding: '1.5rem 0', borderTop: '1px solid rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', margin: '1.5rem 0' }}>
            <h4 style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem', textAlign: 'left' }}>Promo Registry Code</h4>
            <div className="coupon-apply-form" style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="e.g. ASTRA10" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={!!appliedCoupon}
                style={{
                  flexGrow: 1,
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '4px',
                  padding: '0.4rem 0.75rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
              {appliedCoupon ? (
                <button 
                  type="button" 
                  onClick={() => { setAppliedCoupon(null); setDiscountAmount(0); setCouponCode(''); }}
                  className="gold-button solid"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.72rem' }}
                >
                  Remove
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={handleApplyCoupon}
                  className="gold-button solid"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.72rem' }}
                >
                  Apply
                </button>
              )}
            </div>
            {couponError && <p className="coupon-error-text" style={{ fontSize: '0.72rem', color: '#ff8080', marginTop: '0.4rem', textAlign: 'left' }}>{couponError}</p>}
            {appliedCoupon && (
              <p className="coupon-success-text" style={{ fontSize: '0.72rem', color: '#27ae60', marginTop: '0.4rem', textAlign: 'left' }}>
                Code <strong>{appliedCoupon.code}</strong> applied! 
                ({appliedCoupon.discountType === 'percent' ? `${appliedCoupon.discountValue}%` : `₹${appliedCoupon.discountValue}`} off)
              </p>
            )}
          </div>

          <div className="summary-totals">
            <div className="totals-row">
              <span>Subtotal</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            {discountAmount > 0 && (
              <div className="totals-row discount-row" style={{ color: '#27ae60' }}>
                <span>Discount ({appliedCoupon?.code})</span>
                <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="totals-row">
              <span>Insured Shipping</span>
              <span className="free-badge">Complimentary</span>
            </div>
            <div className="totals-row border-top">
              <span className="grand-label">Total Acquisition</span>
              <span className="grand-price">₹{(cartTotal - discountAmount).toLocaleString('en-IN')}</span>
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
