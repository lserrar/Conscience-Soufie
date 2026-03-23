import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Splash = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) {
        if (isAuthenticated) {
          navigate('/accueil');
        } else {
          navigate('/login');
        }
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [loading, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-[#1c679f] flex flex-col items-center justify-center">
      <img 
        src="/logo-cs-blanc.png" 
        alt="Conscience Soufie" 
        className="w-32 h-32 object-contain animate-pulse"
      />
      <h1 className="text-white text-2xl font-serif mt-6">Conscience Soufie</h1>
      <p className="text-white/60 text-sm mt-2">Sagesse • Spiritualité • Partage</p>
      <div className="mt-8">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default Splash;
