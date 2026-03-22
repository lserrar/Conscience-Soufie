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
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (data.is_member) {
        const userData = { email, isMember: true, loginDate: new Date().toISOString() };
        setUser(userData);
        localStorage.setItem('cs_user', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, message: 'Cet email n\'est pas associé à un membre actif.' };
      }
    } catch (error) {
      return { success: false, message: 'Erreur de connexion. Veuillez réessayer.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cs_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
