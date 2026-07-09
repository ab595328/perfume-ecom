import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CartDrawer.css';

export default function CartDrawer({ isOpen, onClose }) {
  const { cartItems, updateQty, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-drawer glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="cart-drawer-header">
          <div className="title-area">
            <ShoppingBag size={20} className="gold-icon" />
            <h2>Your Selection</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close Cart">
            <X size={22} />
          </button>
        </div>

        <div className="cart-items-container">
          {cartItems.length === 0 ? (
            <div className="empty-cart-message">
              <ShoppingBag size={48} className="empty-icon" />
              <h3>Your selection is empty</h3>
              <p>Explore our private collections and find your signature scent.</p>
              <button 
                className="gold-button" 
                onClick={() => {
                  onClose();
                  navigate('/shop');
                }}
              >
                Browse Shop
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-img-wrapper">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="item-details">
                  <div className="item-header">
                    <h4>{item.name}</h4>
                    <span className="item-price">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                  </div>
                  <p className="item-brand">{item.brand}</p>
                  
                  <div className="item-actions">
                    <div className="qty-control">
                      <button onClick={() => updateQty(item.id, item.qty - 1)}>
                        <Minus size={12} />
                      </button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)}>
                        <Plus size={12} />
                      </button>
                    </div>

                    <button 
                      className="delete-btn" 
                      onClick={() => removeFromCart(item.id)}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="subtotal-row">
              <span>Subtotal</span>
              <span className="total-price">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <p className="shipping-note">Complimentary shipping & signature gift packaging included.</p>
            <button 
              className="gold-button solid checkout-btn"
              onClick={() => {
                onClose();
                navigate('/checkout');
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
