import React, { useState } from 'react';
import { MapPin, Mail, Phone, Clock, Send, Check } from 'lucide-react';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Luxury simulation delay
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
      setTimeout(() => setSent(false), 4000);
    }, 1500);
  };

  const salons = [
    {
      city: "Paris Boutique",
      address: "14 Rue du Faubourg Saint-Honoré, 75008 Paris",
      phone: "+33 1 42 68 53 00",
      hours: "Mon - Sat: 10:00 AM - 7:00 PM"
    },
    {
      city: "Milano Salon",
      address: "Via Montenapoleone 8, 20121 Milano",
      phone: "+39 02 7600 3400",
      hours: "Mon - Sat: 10:30 AM - 7:30 PM"
    },
    {
      city: "London Atelier",
      address: "32 Burlington Arcade, Mayfair, London W1J 0PX",
      phone: "+44 20 7493 2200",
      hours: "Mon - Sat: 10:00 AM - 6:00 PM"
    },
    {
      city: "New Delhi Salon",
      address: "The Chanakya, Chanakyapuri, New Delhi 110021",
      phone: "+91 11 6688 8800",
      hours: "Mon - Sun: 11:00 AM - 9:00 PM"
    }
  ];

  return (
    <div className="contact-page container animate-fade">
      {/* Header */}
      <div className="contact-header reveal-item stagger-1">
        <span className="section-subtitle">THE CONCIERGE</span>
        <h1>Connect with Astraire</h1>
        <div className="title-underline"></div>
        <p className="contact-intro">
          Whether you need a bespoke fragrance consultation, boutique reservation, or private order assistance, our House concierges are at your service.
        </p>
      </div>

      <div className="contact-layout">
        {/* Contact Form */}
        <section className="contact-form-section glass-panel reveal-item stagger-2">
          <h2>Private Correspondence</h2>
          <p className="form-subtext">Send a secure message directly to our compounding laboratory or client services team.</p>

          {sent ? (
            <div className="contact-success-alert glass-panel">
              <Check className="success-icon" size={32} />
              <h3>Transmission Secured</h3>
              <p>Your inquiry has been logged in our registry. An Astraire concierge will contact you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="e.g. Julian Vance" 
                />
              </div>

              <div className="form-group">
                <label>Secure Email</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="e.g. julian@vance.com" 
                />
              </div>

              <div className="form-group">
                <label>Inquiry Nature</label>
                <select name="subject" value={formData.subject} onChange={handleChange} className="contact-select">
                  <option value="General Inquiry">General Curation Inquiry</option>
                  <option value="Bespoke Blend">Bespoke Fragrance Consultation</option>
                  <option value="Boutique Reservation">Boutique Appointment Booking</option>
                  <option value="Vault Orders">Private Reserve Orders</option>
                </select>
              </div>

              <div className="form-group">
                <label>Message Details</label>
                <textarea 
                  name="message" 
                  required 
                  rows={6}
                  value={formData.message} 
                  onChange={handleChange} 
                  placeholder="Detail your scent preference or concierge request..."
                />
              </div>

              <button type="submit" className="gold-button solid contact-submit-btn" disabled={loading}>
                {loading ? (
                  <>Securing Transmission...</>
                ) : (
                  <>
                    <Send size={14} /> Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </section>

        {/* Boutiques Sidebar */}
        <aside className="contact-sidebar reveal-item stagger-3">
          {/* Support Helpline */}
          <div className="helpline-card glass-panel">
            <h3>Concierge Helpline</h3>
            <div className="helpline-items">
              <div className="helpline-item">
                <Phone size={16} className="gold-icon" />
                <div>
                  <p className="helpline-label">Global Toll-Free</p>
                  <p className="helpline-val">1-800-ASTRAIRE (278-724)</p>
                </div>
              </div>
              <div className="helpline-item">
                <Mail size={16} className="gold-icon" />
                <div>
                  <p className="helpline-label">Secure Inquiry Email</p>
                  <p className="helpline-val">concierge@astraire.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Boutique List */}
          <div className="boutiques-list-container">
            <h2>Worldwide Boutiques</h2>
            <div className="boutiques-grid">
              {salons.map((salon, idx) => (
                <div key={idx} className={`boutique-card glass-panel reveal-item stagger-${(idx % 4) + 1}`}>
                  <div className="boutique-header-row">
                    <MapPin size={16} className="gold-icon" />
                    <h4>{salon.city}</h4>
                  </div>
                  <p className="boutique-address">{salon.address}</p>
                  <p className="boutique-phone"><Phone size={10} /> {salon.phone}</p>
                  <p className="boutique-hours"><Clock size={10} /> {salon.hours}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
