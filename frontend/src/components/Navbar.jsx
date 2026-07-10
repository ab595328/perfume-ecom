import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingBag, Search, X, Home as HomeIcon, 
  Percent, Star, Layers, User, MoreVertical 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/logo.jpg';
import './Navbar.css';

export default function Navbar({ onOpenCart, isLoading }) {
  const { cartCount } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <nav className="navbar glass-panel">
        <div className="nav-container-new">
          
          {/* Logo (Left) */}
          <Link to="/" className="nav-logo">
            <div className="logo-img-placeholder" style={{ width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              {!isLoading && (
                <motion.div 
                  layoutId="logo-image-wrap" 
                  style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}
                  transition={{ duration: 2.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <img src={logoImg} alt="Astraire Logo" className="logo-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </motion.div>
              )}
            </div>
            {!isLoading && (
              <span className="logo-brand">ASTRAIRE</span>
            )}
          </Link>

          {/* Full Search Bar (Center, expanding space) */}
          {!isLoading && (
            <form onSubmit={handleSearchSubmit} className="nav-search-full-form">
              <Search size={15} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search scents, notes, catalog..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="nav-search-full-input"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="clear-search-btn">
                  <X size={12} />
                </button>
              )}
            </form>
          )}

          {/* Right Actions Block */}
          <div className="nav-actions-new" ref={menuRef}>
            <button className="cart-trigger" onClick={onOpenCart} aria-label="Open Cart">
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>

            {/* 3-Dots Ellipsis Menu Trigger */}
            <button 
              className={`three-dots-trigger ${isMenuOpen ? 'active' : ''}`} 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Pages"
            >
              <MoreVertical size={20} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="three-dots-dropdown glass-panel"
                >
                  <Link to="/" className="dropdown-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
                  <Link to="/shop" className="dropdown-link" onClick={() => setIsMenuOpen(false)}>Collections</Link>
                  <Link to="/about" className="dropdown-link" onClick={() => setIsMenuOpen(false)}>About Us</Link>
                  <Link to="/contact" className="dropdown-link" onClick={() => setIsMenuOpen(false)}>Contact</Link>
                  <Link to="/faq" className="dropdown-link" onClick={() => setIsMenuOpen(false)}>FAQs</Link>
                  
                  <div className="dropdown-divider"></div>
                  
                  {user ? (
                    <>
                      <Link to="/profile" className="dropdown-link highlight" onClick={() => setIsMenuOpen(false)}>My Profile</Link>
                      {isAdmin && (
                        <Link to="/admin" className="dropdown-link admin-highlight" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>
                      )}
                      <button 
                        onClick={() => { logout(); navigate('/'); setIsMenuOpen(false); }} 
                        className="dropdown-link logout-btn-drop"
                      >
                        Log Out
                      </button>
                    </>
                  ) : (
                    <Link to="/login" className="dropdown-link highlight" onClick={() => setIsMenuOpen(false)}>Sign In / Register</Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar (Fixed in Viewport - Contrast Cream Palette) */}
      {!isLoading && (
        <div className="mobile-bottom-nav">
          <Link to="/" className={`bottom-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            <HomeIcon size={20} />
            <span>Home</span>
          </Link>
          <Link to="/shop" className={`bottom-nav-item ${location.pathname === '/shop' ? 'active' : ''}`}>
            <Layers size={20} />
            <span>Catalog</span>
          </Link>
          <button onClick={onOpenCart} className="bottom-nav-item bottom-nav-btn">
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="cart-badge-bottom">{cartCount}</span>}
            </div>
            <span>Cart</span>
          </button>
          <Link to={user ? "/profile" : "/login"} className={`bottom-nav-item ${location.pathname === '/profile' || location.pathname === '/login' ? 'active' : ''}`}>
            <User size={20} />
            <span>Account</span>
          </Link>
        </div>
      )}
    </>
  );
}
