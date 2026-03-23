import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LOGO_URL = '/logo-cs-blanc.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Veuillez entrer votre adresse email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    setError('');
    setLoading(true);

    const result = await login(email);

    if (result.success) {
      navigate('/accueil', { replace: true });
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" data-testid="login-screen">
      {/* Blue Header with Logo - matches mobile auth.tsx */}
      <div className="bg-[#1c679f] flex items-center justify-center py-10 px-4">
        <img
          src={LOGO_URL}
          alt="Conscience Soufie"
          className="h-[70px] object-contain"
          data-testid="login-logo"
        />
      </div>

      {/* White Form Area - matches mobile formContainer */}
      <div className="flex-1 px-6 pt-10">
        <h1
          className="text-[28px] font-serif font-bold text-[#1a2a3a] mb-2 italic"
          data-testid="login-title"
        >
          Bienvenue ! Marhaban !
        </h1>
        <p className="text-base text-gray-500 mb-8 leading-relaxed" data-testid="login-subtitle">
          Entrez votre email adhérent pour accéder à l'application
        </p>

        <form onSubmit={handleSubmit}>
          {/* Input - matches mobile inputContainer */}
          <div
            className="flex items-center border-[1.5px] border-[#e0e0e0] rounded-xl px-4 mb-4 bg-[#fafafa]"
            data-testid="login-input-container"
          >
            <Mail className="text-[#1c679f] mr-3 flex-shrink-0" size={20} />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="Votre adresse email"
              className="flex-1 h-[54px] text-base text-[#1a2a3a] bg-transparent outline-none placeholder-gray-400"
              disabled={loading}
              data-testid="login-email-input"
            />
          </div>

          {/* Error message - matches mobile errorContainer */}
          {error && (
            <div className="flex items-center gap-2 mb-4" data-testid="login-error">
              <AlertCircle className="text-[#e53935] flex-shrink-0" size={16} />
              <p className="text-sm text-[#e53935]">{error}</p>
            </div>
          )}

          {/* Button - matches mobile button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#1c679f] text-white py-4 rounded-xl text-[17px] font-semibold mt-2 disabled:opacity-70 transition-opacity"
            data-testid="login-submit-button"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Continuer
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Info text - matches mobile infoText */}
        <p
          className="text-[13px] text-gray-500 text-center mt-6 leading-5"
          data-testid="login-info-text"
        >
          L'accès complet à l'application est réservé aux adhérents de Conscience Soufie.
        </p>
      </div>
    </div>
  );
};

export default Login;
