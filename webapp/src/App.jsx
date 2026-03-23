import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';
import MobileLayout from './components/MobileLayout';
import Splash from './pages/Splash';
import Home from './pages/Home';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Podcasts from './pages/Podcasts';
import Videos from './pages/Videos';
import About from './pages/About';
import Login from './pages/Login';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1c679f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const MemberOnlyRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user?.isMember) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-[rgba(28,103,159,0.1)] rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-[#1c679f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-serif font-bold text-[#1a2a3a] mb-3">Contenu réservé aux membres</h2>
        <p className="text-gray-600 mb-6">Rejoignez Conscience Soufie pour accéder aux webinaires Zoom.</p>
        <a
          href="https://www.helloasso.com/associations/conscience-soufie/adhesions/adhesion-2025"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-[#1c679f] text-white rounded-lg font-medium"
        >
          Devenir membre
        </a>
      </div>
    );
  }
  
  return children;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/accueil" element={<ProtectedRoute><MobileLayout /></ProtectedRoute>}>
          <Route index element={<Home />} />
        </Route>
        <Route path="/articles" element={<ProtectedRoute><MobileLayout /></ProtectedRoute>}>
          <Route index element={<Articles />} />
        </Route>
        <Route path="/articles/:slug" element={<ProtectedRoute><MobileLayout /></ProtectedRoute>}>
          <Route index element={<ArticleDetail />} />
        </Route>
        <Route path="/podcasts" element={<ProtectedRoute><MobileLayout /></ProtectedRoute>}>
          <Route index element={<Podcasts />} />
        </Route>
        <Route path="/videos" element={<ProtectedRoute><MobileLayout /></ProtectedRoute>}>
          <Route index element={<MemberOnlyRoute><Videos /></MemberOnlyRoute>} />
        </Route>
        <Route path="/a-propos" element={<ProtectedRoute><MobileLayout /></ProtectedRoute>}>
          <Route index element={<About />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <AppContent />
      </AudioProvider>
    </AuthProvider>
  );
}

export default App;
