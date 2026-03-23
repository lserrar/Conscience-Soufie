import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Home, FileText, Headphones, Video, Info, Search, Bell, Moon, Sun, Monitor, Globe, Heart, Mail, Shield, FileText as FileIcon, LogOut, ChevronRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AudioPlayer from './AudioPlayer';

// Logo URL - same as mobile app
const LOGO_URL = '/logo-cs-blanc.png';

const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/ConscienceSoufie',
  instagram: 'https://www.instagram.com/conscience_soufie/',
  youtube: 'https://www.youtube.com/channel/UCK37umfJRkclvPvuVXFkjQA/videos',
  website: 'https://consciencesoufie.com/',
  spotify: 'https://open.spotify.com/show/3zKLZijUDiFANmWvH76fqa',
  soundcloud: 'https://soundcloud.com/user-431553500',
};

const MobileLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/accueil', label: 'Accueil', icon: Home, iconFilled: Home },
    { path: '/articles', label: 'Articles', icon: FileText, iconFilled: FileText },
    { path: '/podcasts', label: 'Podcasts', icon: Headphones, iconFilled: Headphones },
    { path: '/videos', label: 'Zoom', icon: Video, iconFilled: Video },
    { path: '/a-propos', label: 'À Propos', icon: Info, iconFilled: Info },
  ];

  const isActive = (path) => {
    if (path === '/accueil') return location.pathname === '/accueil';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex flex-col">
      {/* Header - Same as mobile app */}
      <header className="bg-[#1c679f] text-white sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-2.5">
          {/* Menu button */}
          <button
            onClick={() => setMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-start"
            aria-label="Menu"
          >
            <Menu size={22} />
          </button>

          {/* Logo - Center */}
          <div className="flex-1 flex justify-center">
            <img 
              src={LOGO_URL} 
              alt="Conscience Soufie" 
              className="h-14 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span className="hidden font-serif text-xl font-semibold">Conscience Soufie</span>
          </div>

          {/* Search button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="w-10 h-10 flex items-center justify-end"
            aria-label="Rechercher"
          >
            <Search size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Tab Bar - Same as mobile app */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1c679f] z-40 safe-area-bottom">
        <div className="flex items-center justify-around py-2 pb-safe">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center min-w-[64px] py-1"
              >
                <Icon 
                  size={24} 
                  className={active ? 'text-white' : 'text-white/60'}
                  fill={active ? 'currentColor' : 'none'}
                />
                <span className={`text-[11px] mt-1 font-medium ${active ? 'text-white' : 'text-white/60'}`}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Profile/Menu Sidebar - Same as mobile app */}
      {menuOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl animate-slideIn flex flex-col">
            {/* Blue Header */}
            <div className="bg-[#1c679f] px-4 pt-12 pb-6 relative">
              <button
                onClick={() => setMenuOpen(false)}
                className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center text-white"
              >
                <X size={28} />
              </button>
              
              <div className="flex flex-col items-center pt-4">
                <img 
                  src={LOGO_URL} 
                  alt="Conscience Soufie" 
                  className="h-14 object-contain mb-3"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <span className="text-white/90 text-lg font-serif">
                  {user?.email ? `Bienvenue` : 'Bienvenue'}
                </span>
              </div>
            </div>

            {/* Menu Content */}
            <div className="flex-1 overflow-auto bg-[#f8f8f8]">
              {/* Préférences */}
              <div className="bg-white mb-2 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                  Préférences
                </h3>
                
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
                  <div className="flex items-center gap-3.5">
                    <Bell size={22} className="text-gray-800" />
                    <span className="text-base text-gray-800">Notifications</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1c679f]"></div>
                  </label>
                </div>

                <button className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
                  <div className="flex items-center gap-3.5">
                    <Sun size={22} className="text-gray-800" />
                    <span className="text-base text-gray-800">Thème</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Clair</span>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                </button>

                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3.5">
                    <Globe size={22} className="text-gray-800" />
                    <span className="text-base text-gray-800">Langue</span>
                  </div>
                  <span className="text-sm text-gray-500">Français</span>
                </div>
              </div>

              {/* Paramètres */}
              <div className="bg-white mb-2 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                  Paramètres
                </h3>
                
                <button className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
                  <div className="flex items-center gap-3.5">
                    <Shield size={22} className="text-gray-800" />
                    <span className="text-base text-gray-800">Confidentialité</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </button>

                <button className="w-full flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3.5">
                    <FileIcon size={22} className="text-gray-800" />
                    <span className="text-base text-gray-800">Conditions d'utilisation</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </button>
              </div>

              {/* À propos */}
              <div className="bg-white mb-2 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                  À propos
                </h3>
                
                <a 
                  href="https://www.helloasso.com/associations/conscience-soufie/formulaires/1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-100"
                >
                  <div className="flex items-center gap-3.5">
                    <Heart size={22} className="text-gray-800" />
                    <span className="text-base text-gray-800">Don et adhésion</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </a>

                <NavLink 
                  to="/a-propos"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-100"
                >
                  <div className="flex items-center gap-3.5">
                    <Info size={22} className="text-gray-800" />
                    <span className="text-base text-gray-800">Qui sommes-nous</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </NavLink>

                <a 
                  href="mailto:info@consciencesoufie.com"
                  className="w-full flex items-center justify-between px-4 py-3.5"
                >
                  <div className="flex items-center gap-3.5">
                    <Mail size={22} className="text-gray-800" />
                    <span className="text-base text-gray-800">Nous contacter</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </a>
              </div>

              {/* Réseaux sociaux */}
              <div className="bg-white mb-2 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                  Suivez-nous
                </h3>
                
                <div className="flex flex-wrap justify-center gap-4 px-4 py-4">
                  <a href={SOCIAL_LINKS.website} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Globe size={24} className="text-[#1c679f]" />
                  </a>
                  <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                  <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#E4405F]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                  <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#FF0000]" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                  <a href={SOCIAL_LINKS.spotify} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#1DB954]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                  </a>
                  <a href={SOCIAL_LINKS.soundcloud} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#FF5500]" fill="currentColor" viewBox="0 0 24 24"><path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.06-.052-.1-.099-.1zm-.899.828c-.06 0-.091.037-.104.094L0 14.479l.172 1.283c.013.06.045.094.09.094.044 0 .08-.038.09-.094l.206-1.283-.206-1.332c-.01-.057-.046-.094-.09-.094zm1.83-1.229c-.061 0-.12.045-.12.104l-.21 2.563.225 2.458c0 .06.045.104.106.104.061 0 .12-.044.12-.104l.24-2.458-.24-2.563c0-.06-.059-.104-.12-.104zm.945-.089c-.075 0-.135.06-.15.135l-.193 2.64.21 2.544c.016.077.075.138.149.138.075 0 .135-.061.15-.138l.225-2.544-.225-2.64c-.015-.075-.075-.135-.15-.135z"/></svg>
                  </a>
                </div>
              </div>

              {/* Déconnexion */}
              {isAuthenticated && (
                <button 
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="mx-4 my-2 flex items-center justify-center gap-2.5 py-4 bg-white rounded-lg border border-red-500"
                >
                  <LogOut size={22} className="text-red-500" />
                  <span className="text-base font-semibold text-red-500">Se déconnecter</span>
                </button>
              )}

              {/* App Version */}
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 font-serif">Conscience Soufie</p>
                <p className="text-xs text-gray-400 mt-1">Version 1.0.0</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          {/* Search Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2.5">
              <Search size={20} className="text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-base"
                autoFocus
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}>
                  <X size={20} className="text-gray-400" />
                </button>
              )}
            </div>
            <button 
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery('');
              }}
              className="text-[#1c679f] font-medium"
            >
              Annuler
            </button>
          </div>

          {/* Search Content */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-semibold text-gray-800">Rechercher dans les articles</p>
              <p className="text-sm text-gray-500 mt-2">Entrez un mot-clé et appuyez sur Entrée</p>
            </div>
          </div>
        </div>
      )}

      {/* Audio Player */}
      <AudioPlayer />
    </div>
  );
};

export default MobileLayout;
