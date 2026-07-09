import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Key, Mail, ShieldAlert, ArrowRight } from 'lucide-react';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error || 'Authentication failed');
    }
  };

  return (
    <div className="login-page container animate-fade">
      <div className="login-card glass-panel">
        <div className="login-header">
          <ShieldAlert size={36} className="gold-icon" />
          <span>VAULT ACCESS</span>
          <h1>Admin Authentication</h1>
          <p>Login to manage private reserves, adjust inventory and monitor customer acquisitions.</p>
        </div>

        {error && (
          <div className="login-error-alert">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label><Mail size={12} /> Registered Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@astraire.com"
            />
          </div>
 
          <div className="form-group">
            <label><Key size={12} /> Key Code (Password)</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
 
          <button type="submit" className="gold-button solid login-submit-btn" disabled={loading}>
            {loading ? 'Decrypting Credentials...' : 'Authenticate Access'} <ArrowRight size={16} />
          </button>
        </form>
 
        <div className="login-hint">
          <p>Demo Credentials: <strong>admin@astraire.com</strong> / <strong>admin123</strong></p>
        </div>
      </div>
    </div>
  );
}
