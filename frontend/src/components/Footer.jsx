import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Compass } from 'lucide-react';
import logoImg from '../assets/logo.jpg';
import './Footer.css';
 
const InstagramIcon = ({ size = 24, ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);
 
const FacebookIcon = ({ size = 24, ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
 
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo-container">
            <img src={logoImg} alt="Astraire Logo" className="footer-logo-img" />
            <h3>ASTRAIRE</h3>
          </div>
          <p className="footer-tagline">Crafting liquid memories & olfactory poetry.</p>
          <p className="footer-desc">
            A luxury house of fine perfumery. We source the most exquisite oils from Grasse, France and the wild forests of Cambodia to create timeless, complex signatures.
          </p>
          <div className="footer-socials">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon size={18} /></a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><FacebookIcon size={18} /></a>
            <a href="#" className="scent-guide-icon" aria-label="Scent Quiz"><Compass size={18} /></a>
          </div>
        </div>
 
        <div className="footer-links-group">
          <div className="footer-column">
            <h4>Collections</h4>
            <ul>
              <li><Link to="/shop?category=Woody">The Woody Accords</Link></li>
              <li><Link to="/shop?category=Floral">Floral Velvets</Link></li>
              <li><Link to="/shop?category=Fresh">Citrus L'Eau</Link></li>
              <li><Link to="/shop?category=Oriental">Mystique Oriental</Link></li>
            </ul>
          </div>
 
          <div className="footer-column">
            <h4>The House</h4>
            <ul>
              <li><Link to="/about">Our Story</Link></li>
              <li><Link to="/about#ingredients">Rare Ingredients</Link></li>
              <li><Link to="/contact">Boutiques</Link></li>
              <li><Link to="/faq">Concierge FAQs</Link></li>
            </ul>
          </div>
 
          <div className="footer-column newsletter">
            <h4>Newsletter</h4>
            <p>Subscribe to receive private catalog updates and exclusive blend releases.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your email address" required />
              <button type="submit" className="gold-button">Subscribe</button>
            </form>
          </div>
        </div>
      </div>
 
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Astraire. All rights reserved. Created with absolute luxury.</p>
      </div>
    </footer>
  );
}
