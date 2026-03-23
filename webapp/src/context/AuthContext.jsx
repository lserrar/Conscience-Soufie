import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('cs_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('cs_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/check-membership`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user regardless of membership status (like the mobile app)
        const userData = {
          email: email.toLowerCase().trim(),
          isMember: data.isMember,
          memberName: data.memberName || null,
          loginDate: new Date().toISOString(),
        };
        setUser(userData);
        localStorage.setItem('cs_user', JSON.stringify(userData));
        return { success: true, isMember: data.isMember, memberName: data.memberName };
      } else {
        return { success: false, message: data.detail || 'Une erreur est survenue' };
      }
    } catch (error) {
      return { success: false, message: 'Impossible de vérifier votre adhésion. Veuillez réessayer.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cs_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user, isMember: user?.isMember || false }}>
      {children}
    </AuthContext.Provider>
  );
};
