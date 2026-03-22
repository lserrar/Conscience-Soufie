import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Podcasts from './pages/Podcasts';
import Videos from './pages/Videos';
import Magazines from './pages/Magazines';
import About from './pages/About';
import Login from './pages/Login';

function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="articles" element={<Articles />} />
              <Route path="articles/:slug" element={<ArticleDetail />} />
              <Route path="podcasts" element={<Podcasts />} />
              <Route path="videos" element={<Videos />} />
              <Route path="magazines" element={<Magazines />} />
              <Route path="a-propos" element={<About />} />
            </Route>
          </Routes>
        </Router>
      </AudioProvider>
    </AuthProvider>
  );
}

export default App;
