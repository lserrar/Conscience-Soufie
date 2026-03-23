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
          <Route index element={<Videos />} />
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
