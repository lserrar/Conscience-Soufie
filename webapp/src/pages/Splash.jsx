import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LOGO_URL = '/logo-cs-blanc.png';

const Splash = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [animState, setAnimState] = useState('initial');

  useEffect(() => {
    // Phase 1: fade in + scale to 0.9 (like mobile spring)
    requestAnimationFrame(() => setAnimState('fadeIn'));

    // Phase 2: slow grow to 1.15 (like mobile)
    const growTimer = setTimeout(() => setAnimState('grow'), 800);

    // Navigate after 5 seconds (like mobile)
    const navTimer = setTimeout(() => {
      if (!loading) {
        if (isAuthenticated) {
          navigate('/accueil', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      }
    }, 5000);

    return () => {
      clearTimeout(growTimer);
      clearTimeout(navTimer);
    };
  }, [loading, isAuthenticated, navigate]);

  const logoStyle = {
    opacity: animState === 'initial' ? 0 : 1,
    transform:
      animState === 'initial'
        ? 'scale(0.6)'
        : animState === 'fadeIn'
        ? 'scale(0.9)'
        : 'scale(1.15)',
    transition:
      animState === 'fadeIn'
        ? 'opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
        : 'transform 2.5s ease-out',
  };

  return (
    <div
      className="min-h-screen bg-[#1c679f] flex items-center justify-center"
      data-testid="splash-screen"
    >
      <div style={logoStyle}>
        <img
          src={LOGO_URL}
          alt="Conscience Soufie"
          className="w-[320px] h-[120px] object-contain"
          data-testid="splash-logo"
        />
      </div>
    </div>
  );
};

export default Splash;
