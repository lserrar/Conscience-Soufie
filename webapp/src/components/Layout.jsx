import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Home, FileText, Headphones, Video, BookOpen, Info, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AudioPlayer from './AudioPlayer';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Accueil', icon: Home },
    { path: '/articles', label: 'Articles', icon: FileText },
    { path: '/podcasts', label: 'Podcasts', icon: Headphones },
    { path: '/videos', label: 'Vidéos', icon: Video },
    { path: '/magazines', label: 'Revues', icon: BookOpen },
    { path: '/a-propos', label: 'À Propos', icon: Info },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Menu button (mobile) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-primary-dark transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu size={24} />
            </button>

            {/* Logo */}
            <NavLink to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-primary font-serif font-bold text-xl">CS</span>
              </div>
              <span className="font-serif text-xl font-semibold hidden sm:block">
                Conscience Soufie
              </span>
            </NavLink>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* User menu */}
            <div className="flex items-center space-x-2">
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <span className="hidden sm:block text-sm text-white/80">{user?.email}</span>
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    title="Se déconnecter"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <NavLink
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  <User size={18} />
                  <span className="hidden sm:block">Connexion</span>
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl animate-slideIn">
            <div className="p-4 bg-primary text-white flex items-center justify-between">
              <span className="font-serif text-lg font-semibold">Menu</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
            {isAuthenticated && (
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
                <div className="text-sm text-gray-600 mb-2">{user?.email}</div>
                <button
                  onClick={() => {
                    logout();
                    setSidebarOpen(false);
                  }}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                >
                  <LogOut size={18} />
                  <span>Se déconnecter</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Audio Player */}
      <AudioPlayer />

      {/* Footer */}
      <footer className="bg-primary text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-serif text-xl font-semibold mb-4">Conscience Soufie</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Association dédiée à la diffusion et à l'étude de la sagesse soufie, 
                patrimoine spirituel universel de l'humanité.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Liens Rapides</h4>
              <ul className="space-y-2 text-sm text-white/70">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <NavLink to={item.path} className="hover:text-white transition-colors">
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-sm text-white/70">
                contact@consciencesoufie.com
              </p>
              <div className="mt-4 flex space-x-4">
                <a 
                  href="https://www.youtube.com/@ConscienceSoufie" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  YouTube
                </a>
                <a 
                  href="https://soundcloud.com/consciencesoufie" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  SoundCloud
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/20 text-center text-sm text-white/50">
            © {new Date().getFullYear()} Conscience Soufie. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
