import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Key, Mail, ShieldAlert, ArrowRight, UserPlus } from 'lucide-react';
import './Login.css';

export default function Login() {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (activeTab === 'register') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const result = await register(email, password);
      setLoading(false);
      if (result.success) {
        navigate('/profile');
      } else {
        setError(result.error || 'Registration failed');
      }
    } else {
      const result = await login(email, password);
      setLoading(false);
      if (result.success) {
        // Check if admin email or check result status
        if (email.toLowerCase() === 'admin@astraire.com') {
          navigate('/admin');
        } else {
          navigate('/profile');
        }
      } else {
        setError(result.error || 'Authentication failed');
      }
    }
  };

  return (
    <div className="login-page container animate-fade">
      <div className="login-card glass-panel">
        {/* Tab Selection */}
        <div className="login-tabs">
          <button 
            type="button" 
            className={`login-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setError(''); }}
          >
            Sign In
          </button>
          <button 
            type="button" 
            className={`login-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => { setActiveTab('register'); setError(''); }}
          >
            Create Registry
          </button>
        </div>

        <div className="login-header">
          {activeTab === 'login' ? (
            <>
              <ShieldAlert size={36} className="gold-icon" />
              <span>VAULT ACCESS</span>
              <h1>Sign In to Astraire</h1>
              <p>Access your private collection, track decant orders, and manage your scent preferences.</p>
            </>
          ) : (
            <>
              <UserPlus size={36} className="gold-icon" />
              <span>THE COFFRET REGISTRY</span>
              <h1>Create Registry Account</h1>
              <p>Register to unlock priority reserves, track macerations, and receive personalized consultations.</p>
            </>
          )}
        </div>

        {error && (
          <div className="login-error-alert animate-fade">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label><Mail size={12} /> Email Address</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. customer@astraire.com"
            />
          </div>
 
          <div className="form-group">
            <label><Key size={12} /> Passcode (Password)</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {activeTab === 'register' && (
            <div className="form-group animate-fade">
              <label><Key size={12} /> Confirm Passcode</label>
              <input 
                type="password" 
                required 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          )}
 
          <button type="submit" className="gold-button solid login-submit-btn" disabled={loading}>
            {loading 
              ? (activeTab === 'login' ? 'Decrypting Credentials...' : 'Registering Account...') 
              : (activeTab === 'login' ? 'Authenticate Access' : 'Register Account')} 
            <ArrowRight size={16} />
          </button>
        </form>
 
        <div className="login-hint">
          {activeTab === 'login' ? (
            <p style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <span>Admin Access: <strong>admin@astraire.com</strong> / <strong>admin123</strong></span>
              <span>User Access: <strong>user@astraire.com</strong> / <strong>user123</strong></span>
            </p>
          ) : (
            <p>You can also enter any custom credentials to auto-register offline and preview the profile.</p>
          )}
        </div>
      </div>
    </div>
  );
}
