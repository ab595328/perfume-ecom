import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('aura_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('aura_token') || null;
  });

  // Track Firebase auth state changes
  useEffect(() => {
    if (!auth || !db) return;
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          let role = 'user';
          
          if (docSnap.exists()) {
            role = docSnap.data().role || 'user';
          } else {
            role = firebaseUser.email.toLowerCase() === 'admin@astraire.com' ? 'admin' : 'user';
            // Sync profile
            await setDoc(docRef, { email: firebaseUser.email, role });
          }
          
          const profile = { email: firebaseUser.email, role };
          const idToken = await firebaseUser.getIdToken();
          
          setUser(profile);
          setToken(idToken);
          localStorage.setItem('aura_user', JSON.stringify(profile));
          localStorage.setItem('aura_token', idToken);
        } catch (err) {
          console.error("Error synchronization on auth change:", err);
        }
      } else {
        // Only clear if not using a static offline bypass token
        const currentToken = localStorage.getItem('aura_token');
        if (currentToken && !currentToken.startsWith('static_')) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('aura_user');
          localStorage.removeItem('aura_token');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    // 1. Firebase Live Login (Prioritized when active)
    if (auth && db) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        // Fetch role
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        let role = 'user';
        
        if (docSnap.exists()) {
          role = docSnap.data().role || 'user';
        } else {
          role = email.toLowerCase() === 'admin@astraire.com' ? 'admin' : 'user';
          await setDoc(docRef, { email: firebaseUser.email, role });
        }
        
        const profile = { email: firebaseUser.email, role };
        const idToken = await firebaseUser.getIdToken();
        
        setUser(profile);
        setToken(idToken);
        localStorage.setItem('aura_user', JSON.stringify(profile));
        localStorage.setItem('aura_token', idToken);
        return { success: true };
      } catch (error) {
        console.error('Firebase login error:', error);
        return { success: false, error: error.message };
      }
    }

    // 2. Static/Offline Credentials Bypasses (Fallback only when Firebase is unconfigured)
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

    return { success: false, error: 'Firebase is not initialized' };
  };

  const register = async (email, password) => {
    // 1. Firebase Live Register
    if (auth && db) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        // Admin configuration by specific email
        const role = email.toLowerCase() === 'admin@astraire.com' ? 'admin' : 'user';
        const profile = { email: firebaseUser.email, role };
        
        // Store profile details
        await setDoc(doc(db, 'users', firebaseUser.uid), profile);
        
        const idToken = await firebaseUser.getIdToken();
        setUser(profile);
        setToken(idToken);
        localStorage.setItem('aura_user', JSON.stringify(profile));
        localStorage.setItem('aura_token', idToken);
        return { success: true };
      } catch (error) {
        console.error('Firebase registration error:', error);
        return { success: false, error: error.message };
      }
    }

    // 2. Offline Fallback
    console.warn('Firebase connection failed or not configured, running offline static fallback.');
    const mockUser = { email: email, role: 'user' };
    setUser(mockUser);
    setToken('static_register_token');
    localStorage.setItem('aura_user', JSON.stringify(mockUser));
    localStorage.setItem('aura_token', 'static_register_token');
    return { success: true };
  };

  const logout = async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Firebase signOut error:", err);
      }
    }
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
