import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Video, Calendar, ExternalLink, Users, Lock, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || '';

const Videos = () => {
  const { isMember } = useAuth();
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membershipUrl, setMembershipUrl] = useState(null);
  const liveDotRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch both Zoom webinars and HelloAsso events in parallel (like mobile)
      const [zoomRes, helloAssoRes, membershipRes] = await Promise.allSettled([
        axios.get(`${API_URL}/api/zoom/webinars`),
        axios.get(`${API_URL}/api/helloasso/events`),
        axios.get(`${API_URL}/api/helloasso/membership-form`),
      ]);

      const zoomWebinars = zoomRes.status === 'fulfilled' ? (zoomRes.value.data.webinars || []) : [];
      const helloAssoEvents = helloAssoRes.status === 'fulfilled' ? (helloAssoRes.value.data.events || []) : [];

      if (membershipRes.status === 'fulfilled' && membershipRes.value.data?.url) {
        setMembershipUrl(membershipRes.value.data.url);
      }

      // Match webinars with HelloAsso event images by date (like mobile)
      const webinarsWithImages = zoomWebinars.map((webinar) => {
        const webinarDate = new Date(webinar.start_time);
        const matchingEvent = helloAssoEvents.find((event) => {
          const eventDate = new Date(event.startDate);
          return (
            webinarDate.getFullYear() === eventDate.getFullYear() &&
            webinarDate.getMonth() === eventDate.getMonth() &&
            webinarDate.getDate() === eventDate.getDate()
          );
        });
        return {
          ...webinar,
          imageUrl: matchingEvent?.logo || matchingEvent?.banner || null,
        };
      });

      setWebinars(webinarsWithImages);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const adhesionUrl = membershipUrl || 'https://www.helloasso.com/associations/conscience-soufie';

  const formatShortDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  const formatTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatFullDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    } catch {
      return '';
    }
  };

  const isLive = (webinar) => {
    const now = new Date();
    const startTime = new Date(webinar.start_time);
    const endTime = new Date(startTime.getTime() + (webinar.duration || 60) * 60000);
    return now >= startTime && now <= endTime;
  };

  const isSoon = (webinar) => {
    const now = new Date();
    const startTime = new Date(webinar.start_time);
    const timeDiff = (startTime.getTime() - now.getTime()) / (1000 * 60);
    return timeDiff <= 30 && timeDiff > 0;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white min-h-full">
        <div className="w-8 h-8 border-2 border-[#1c679f] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-sm font-serif text-gray-500">Chargement des conférences...</p>
      </div>
    );
  }

  const nextWebinar = webinars[0];
  const upcomingWebinars = webinars.slice(1);

  return (
    <div className="bg-white min-h-full pb-6 relative" data-testid="videos-page">

      {/* Hero - Prochain Direct (like mobile) */}
      {nextWebinar ? (
        <div className="mx-4 mt-4">
          {nextWebinar.imageUrl ? (
            <a href={nextWebinar.join_url} target="_blank" rel="noopener noreferrer" className="block">
              {/* Image container like mobile Accueil style */}
              <div className="rounded-xl overflow-hidden bg-[#f0f4f8]">
                <img
                  src={nextWebinar.imageUrl}
                  alt={nextWebinar.topic}
                  className="w-full aspect-video object-contain"
                />
              </div>
              {/* Info below image */}
              <div className="pt-4">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#1c679f]" />
                    <span className="text-sm text-gray-500">
                      {formatShortDate(nextWebinar.start_time)} à {formatTime(nextWebinar.start_time)}
                    </span>
                  </div>
                  {(isLive(nextWebinar) || isSoon(nextWebinar)) && (
                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold text-white tracking-wide ${
                      isLive(nextWebinar) ? 'bg-[#e53935]' : 'bg-[#ff9800]'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      {isLive(nextWebinar) ? 'EN DIRECT' : 'BIENTÔT'}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-serif font-bold text-[#1a2a3a] mb-3 leading-6">
                  {nextWebinar.topic}
                </h3>
                <a
                  href={nextWebinar.join_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#1c679f] text-white py-3 px-5 rounded-lg text-[15px] font-semibold"
                  data-testid="join-zoom-button"
                >
                  <Video size={18} />
                  Rejoindre Zoom
                </a>
              </div>
            </a>
          ) : (
            /* Fallback without image - gradient style like mobile */
            <div className="bg-[#1c679f] rounded-2xl p-5 flex flex-col justify-between" style={{ aspectRatio: '1/0.8' }}>
              <div className="flex justify-between items-start">
                <span className="flex items-center gap-2 bg-[rgba(28,103,159,0.9)] text-white text-sm font-semibold px-3.5 py-2 rounded-full">
                  <Calendar size={14} />
                  {formatShortDate(nextWebinar.start_time)} à {formatTime(nextWebinar.start_time)}
                </span>
                {(isLive(nextWebinar) || isSoon(nextWebinar)) && (
                  <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-white tracking-wider ${
                    isLive(nextWebinar) ? 'bg-[#e53935]' : 'bg-[#ff9800]'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    {isLive(nextWebinar) ? 'EN DIRECT' : 'BIENTÔT'}
                  </span>
                )}
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-serif font-bold text-white leading-[26px]">
                  {nextWebinar.topic}
                </h3>
                <a
                  href={nextWebinar.join_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 bg-[#1c679f] border border-white/30 text-white py-3.5 px-6 rounded-lg text-base font-semibold"
                >
                  <Video size={20} />
                  Rejoindre Zoom
                </a>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mx-4 mt-4 bg-[#f8f8f8] rounded-2xl flex flex-col items-center py-10 px-8">
          <Video className="text-gray-400" size={48} />
          <h3 className="text-lg font-serif font-bold text-[#1a2a3a] mt-4">Aucune conférence programmée</h3>
          <p className="text-sm text-gray-500 mt-2">Les prochains événements apparaîtront ici</p>
        </div>
      )}

      {/* Carousel - Prochains événements (like mobile) */}
      {upcomingWebinars.length > 0 && (
        <div className="mt-8 pl-4">
          <h2 className="text-xl font-serif font-bold text-[#1a2a3a] mb-4">À venir</h2>
          <div className="flex gap-3.5 overflow-x-auto pr-4 pb-2 hide-scrollbar">
            {upcomingWebinars.map((webinar) => (
              <a
                key={webinar.id}
                href={webinar.join_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-[70vw] max-w-[280px] bg-white rounded-xl overflow-hidden border border-[rgba(28,103,159,0.1)]"
              >
                {webinar.imageUrl ? (
                  <>
                    <img
                      src={webinar.imageUrl}
                      alt={webinar.topic}
                      className="w-full h-[90px] object-cover"
                    />
                    <div className="p-3">
                      <h3 className="text-[13px] font-serif text-[#1a2a3a] line-clamp-2 leading-[18px] mb-1.5">
                        {webinar.topic}
                      </h3>
                      <p className="text-xs text-[#1c679f]">
                        {formatShortDate(webinar.start_time)} à {formatTime(webinar.start_time)}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="bg-gradient-to-br from-[#1a5276] to-[#2471a3] p-4 flex flex-col justify-between h-[160px]">
                    <span className="self-start bg-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded-full capitalize">
                      {formatShortDate(webinar.start_time)}
                    </span>
                    <div>
                      <h3 className="text-[15px] font-serif font-bold text-white leading-5 line-clamp-2 mb-2">
                        {webinar.topic}
                      </h3>
                      <div className="flex items-center gap-1.5 text-white/80 text-[13px]">
                        <Calendar size={14} />
                        {formatTime(webinar.start_time)}
                      </div>
                    </div>
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Section Comment participer - Style À propos (like mobile) */}
      <div className="px-7 pt-12 bg-[#FAFAFA] mt-8">
        {/* Header */}
        <div className="flex items-center justify-center gap-4 mb-9">
          <div className="flex-1 h-px bg-[#1c679f]"></div>
          <span className="text-sm font-medium text-[#1c679f] tracking-[3px] uppercase">Comment participer</span>
          <div className="flex-1 h-px bg-[#1c679f]"></div>
        </div>

        {/* Drop cap intro */}
        <div className="flex mb-5">
          <span className="text-[56px] font-serif font-bold text-[#1c679f] leading-[56px] mr-2 -mt-2">R</span>
          <span className="flex-1 text-[17px] font-serif text-[#1a2a3a] leading-[26px] pt-2">
            ejoignez nos conférences en direct depuis chez vous !
          </span>
        </div>

        <p className="text-base text-[#1a2a3a] leading-[26px] mb-4">
          Un lien personnalisé vous permettra, à l'heure prévue, de vous connecter à la réunion via Zoom. Même en cas de retard, vous pouvez accéder à la conférence en cours.
        </p>

        {/* Divider */}
        <div className="flex items-center my-7">
          <div className="flex-1 h-px bg-[rgba(28,103,159,0.2)]"></div>
          <span className="px-4 text-sm text-[#1c679f]">✦</span>
          <div className="flex-1 h-px bg-[rgba(28,103,159,0.2)]"></div>
        </div>

        {/* Se connecter */}
        <h3 className="text-xl font-serif font-bold text-[#1c679f] mb-5">Se connecter</h3>

        <div className="flex mb-6">
          <span className="text-2xl font-serif font-bold text-[#1c679f] w-10">I</span>
          <div className="flex-1">
            <h4 className="text-base font-serif font-bold text-[#1a2a3a] mb-1.5">Choisissez votre appareil</h4>
            <p className="text-[15px] text-gray-500 leading-6">
              Participez depuis l'application Zoom, une tablette ou votre téléphone, connecté à internet.
            </p>
          </div>
        </div>

        <div className="flex mb-6">
          <span className="text-2xl font-serif font-bold text-[#1c679f] w-10">II</span>
          <div className="flex-1">
            <h4 className="text-base font-serif font-bold text-[#1a2a3a] mb-1.5">Identifiez-vous</h4>
            <p className="text-[15px] text-gray-500 leading-6">
              Entrez les informations demandées (prénom, ville) puis cliquez sur « Connexion ».
            </p>
          </div>
        </div>

        <div className="flex mb-6">
          <span className="text-2xl font-serif font-bold text-[#1c679f] w-10">III</span>
          <div className="flex-1">
            <h4 className="text-base font-serif font-bold text-[#1a2a3a] mb-1.5">Profitez du direct</h4>
            <p className="text-[15px] text-gray-500 leading-6">
              Visualisez en temps réel la retransmission vidéo de la conférence.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center my-7">
          <div className="flex-1 h-px bg-[rgba(28,103,159,0.2)]"></div>
          <span className="px-4 text-sm text-[#1c679f]">✦</span>
          <div className="flex-1 h-px bg-[rgba(28,103,159,0.2)]"></div>
        </div>

        {/* Poser des questions */}
        <h3 className="text-xl font-serif font-bold text-[#1c679f] mb-5">Poser vos questions</h3>

        <p className="text-base text-[#1a2a3a] leading-[26px] mb-4">
          En bas à droite de votre écran, cliquez sur <strong>« Q&R »</strong> ou <strong>« Q&A »</strong>, puis tapez votre message dans la boîte de dialogue.
        </p>
        <p className="text-base text-[#1a2a3a] leading-[26px] mb-4">
          Les questions sont vues en temps réel par le modérateur et traitées lors de la session de questions/réponses à la fin de l'intervention.
        </p>

        <div className="flex gap-3 bg-[rgba(28,103,159,0.08)] p-4 rounded-xl mt-2">
          <span className="text-[#1c679f] flex-shrink-0 mt-0.5">ℹ</span>
          <p className="text-sm text-gray-500 italic leading-[22px]">
            Note : Les participants ne peuvent pas intervenir oralement durant la conférence.
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center my-7">
          <div className="flex-1 h-px bg-[rgba(28,103,159,0.2)]"></div>
          <span className="px-4 text-sm text-[#1c679f]">✦</span>
          <div className="flex-1 h-px bg-[rgba(28,103,159,0.2)]"></div>
        </div>

        {/* Conseils pratiques */}
        <h3 className="text-xl font-serif font-bold text-[#1c679f] mb-5">Conseils pratiques</h3>

        <div className="space-y-3.5 mb-8">
          {[
            'Connectez-vous quelques minutes avant le début',
            'Téléchargez l\'application gratuite « ZOOM Cloud Meetings »',
            'Utilisez un casque pour une meilleure qualité sonore',
            'Fermez les applications gourmandes en bande passante',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1c679f] mt-2.5 flex-shrink-0"></div>
              <p className="text-[15px] text-gray-500 leading-6">{tip}</p>
            </div>
          ))}
        </div>

        {/* Closing */}
        <div className="flex flex-col items-center pt-8 pb-5">
          <div className="w-[60px] h-0.5 bg-[#1c679f] mb-6"></div>
          <p className="text-lg font-serif italic text-[#1c679f] text-center mb-3">
            Au plaisir de vous retrouver en direct !
          </p>
          <p className="text-base font-serif font-bold text-[#1a2a3a]">Conscience Soufie</p>
        </div>
      </div>

      {/* Non-member Overlay - matches mobile live.tsx NonMemberOverlay exactly */}
      {!isMember && (
        <div
          className="absolute inset-0 bg-white/95 flex items-center justify-center p-6 z-10"
          data-testid="non-member-overlay"
        >
          <div className="flex flex-col items-center max-w-[320px] text-center">
            <Lock className="text-[#1c679f]" size={48} />
            <h2 className="text-[22px] font-serif font-bold text-[#1a2a3a] mt-5 mb-3">
              Réservé aux adhérents
            </h2>
            <p className="text-[15px] text-gray-500 leading-[22px] mb-6">
              L'adhésion à Conscience Soufie est annuelle, gratuite et vous permet d'assister à nos assemblées générales, mais également d'accéder aux événements Zoom en direct ici.
              <br /><br />
              Elle s'effectue en moins de 3 minutes sur le site HelloAsso.
            </p>
            <a
              href={adhesionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 bg-[#1c679f] text-white py-3.5 px-7 rounded-xl text-base font-semibold"
              data-testid="non-member-cta"
            >
              <Heart size={20} />
              Devenir adhérent
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;
