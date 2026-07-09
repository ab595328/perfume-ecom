import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, User, LogOut, ShieldAlert, Menu, X } from 'lucide-react';
import logoImg from '../assets/logo.jpg';
import './Navbar.css';

export default function Navbar({ onOpenCart }) {
  const { cartCount } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar glass-panel">
      <div className="nav-container">
        {/* Toggle menu button on mobile */}
        <button className="mobile-menu-trigger" onClick={toggleMobileMenu} aria-label="Toggle menu">
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/" className="nav-logo" onClick={() => setIsMobileMenuOpen(false)}>
          <img src={logoImg} alt="Astraire Logo" className="logo-img" />
          <span className="logo-brand">ASTRAIRE</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-item">Home</Link>
          <Link to="/shop" className="nav-item">Collections</Link>
          <Link to="/about" className="nav-item">About</Link>
          <Link to="/contact" className="nav-item">Contact</Link>
          <Link to="/faq" className="nav-item">FAQ</Link>
          {isAdmin && (
            <Link to="/admin" className="nav-item admin-link">
              <ShieldAlert size={16} /> Admin Panel
            </Link>
          )}
        </div>

        <div className="nav-actions">
          {user ? (
            <div className="user-profile">
              <span className="user-email">{user.email.split('@')[0]}</span>
              <button onClick={() => { logout(); navigate('/'); }} className="logout-btn" title="Log Out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-link" title="Admin Login">
              <User size={18} />
            </Link>
          )}

          <button className="cart-trigger" onClick={onOpenCart}>
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <div className={`mobile-nav-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-inner">
          <Link to="/" className="drawer-item" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link to="/shop" className="drawer-item" onClick={() => setIsMobileMenuOpen(false)}>Collections</Link>
          <Link to="/about" className="drawer-item" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
          <Link to="/contact" className="drawer-item" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
          <Link to="/faq" className="drawer-item" onClick={() => setIsMobileMenuOpen(false)}>FAQs</Link>
          {isAdmin && (
            <Link to="/admin" className="drawer-item admin-link-drawer" onClick={() => setIsMobileMenuOpen(false)}>
              Admin Panel
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
