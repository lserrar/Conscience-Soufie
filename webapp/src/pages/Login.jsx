import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-primary font-serif font-bold text-3xl">CS</span>
            </div>
          </Link>
          <h1 className="font-serif text-3xl font-bold text-white mb-2">
            Conscience Soufie
          </h1>
          <p className="text-white/70">Espace Membres</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Connexion réussie !
              </h2>
              <p className="text-gray-600">
                Redirection en cours...
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2 text-center">
                Connexion
              </h2>
              <p className="text-gray-600 text-center mb-8">
                Entrez l'email associé à votre adhésion HelloAsso
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start">
                    <AlertCircle className="text-red-500 flex-shrink-0 mr-3 mt-0.5" size={20} />
                    <div>
                      <p className="text-red-700 text-sm">{error}</p>
                      <a
                        href="https://www.helloasso.com/associations/conscience-soufie"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline mt-1 inline-block"
                      >
                        Devenir membre →
                      </a>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Se connecter
                      <ArrowRight size={20} className="ml-2" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Pas encore membre ?
                </p>
                <a
                  href="https://www.helloasso.com/associations/conscience-soufie"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-dark font-medium"
                >
                  Rejoindre l'association →
                </a>
              </div>
            </>
          )}
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link to="/" className="text-white/70 hover:text-white text-sm">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
