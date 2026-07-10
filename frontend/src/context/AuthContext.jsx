import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('aura_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('aura_token') || null;
  });

  const login = async (email, password) => {
    // 1. Static/Offline Credentials Bypasses
    if (email.toLowerCase() === 'admin@astraire.com' && password === 'admin123') {
      const staticAdmin = { email: 'admin@astraire.com', role: 'admin' };
      setUser(staticAdmin);
      setToken('static_admin_token');
      localStorage.setItem('aura_user', JSON.stringify(staticAdmin));
      localStorage.setItem('aura_token', 'static_admin_token');
      return { success: true };
    }

    if (email.toLowerCase() === 'user@astraire.com' && password === 'user123') {
      const staticUser = { email: 'user@astraire.com', role: 'user' };
      setUser(staticUser);
      setToken('static_user_token');
      localStorage.setItem('aura_user', JSON.stringify(staticUser));
      localStorage.setItem('aura_token', 'static_user_token');
      return { success: true };
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('aura_user', JSON.stringify(data.user));
      localStorage.setItem('aura_token', data.token);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('aura_user', JSON.stringify(data.user));
      localStorage.setItem('aura_token', data.token);
      return { success: true };
    } catch (error) {
      console.warn('Backend register connection failed, running offline static fallback.', error);
      const mockUser = { email: email, role: 'user' };
      setUser(mockUser);
      setToken('static_register_token');
      localStorage.setItem('aura_user', JSON.stringify(mockUser));
      localStorage.setItem('aura_token', 'static_register_token');
      return { success: true };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('aura_user');
    localStorage.removeItem('aura_token');
  };

  const authenticatedFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });
    if (response.status === 401 || response.status === 403) {
      // Auto logout on unauthorized
      logout();
    }
    return response;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      authenticatedFetch,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
