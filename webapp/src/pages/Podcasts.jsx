import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Pause, Headphones, List } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const API_URL = import.meta.env.VITE_API_URL || '';
const DEFAULT_COVER = 'https://i1.sndcdn.com/avatars-000342847280-qdvr5o-t500x500.jpg';

const Podcasts = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentTrack, isPlaying, playTrack, pauseTrack, resumeTrack, setPlaylist } = useAudio();

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    try {
      setError(null);
      const response = await axios.get(`${API_URL}/api/podcasts`);
      const podcastData = response.data.podcasts || response.data || [];
      setPodcasts(podcastData);
      setPlaylist(podcastData.map(p => ({
        id: p.id,
        title: p.title,
        url: p.audioUrl,
        image: p.imageUrl || DEFAULT_COVER
      })));
    } catch (err) {
      console.error('Error fetching podcasts:', err);
      setError('Impossible de charger les podcasts.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = (podcast) => {
    if (currentTrack?.id === podcast.id) {
      if (isPlaying) {
        pauseTrack();
      } else {
        resumeTrack();
      }
    } else {
      playTrack({
        id: podcast.id,
        title: podcast.title,
        url: podcast.audioUrl,
        image: podcast.imageUrl || DEFAULT_COVER
      });
    }
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return '';
    if (duration.includes(':')) {
      const parts = duration.split(':');
      if (parts.length === 3) {
        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        if (hours > 0) return `${hours}h ${minutes}min`;
        return `${minutes} min`;
      }
      return duration;
    }
    const secs = parseInt(duration);
    const mins = Math.floor(secs / 60);
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainMins = mins % 60;
      return `${hours}h ${remainMins}min`;
    }
    return `${mins} min`;
  };

  const cleanDescription = (html) => {
    return (html || '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .substring(0, 200);
  };

  const isCurrentlyPlaying = (podcast) => {
    return currentTrack?.id === podcast.id;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white min-h-full">
        <div className="w-8 h-8 border-2 border-[#1c679f] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-sm font-serif text-gray-500">Chargement des podcasts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 bg-white min-h-full">
        <Headphones className="text-gray-400" size={48} />
        <p className="mt-3 text-sm text-gray-500 text-center">{error}</p>
        <button 
          onClick={fetchPodcasts}
          className="mt-4 px-6 py-2.5 bg-[#1c679f] text-white rounded-lg text-sm font-medium"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const heroPodcast = podcasts[0];
  const otherPodcasts = podcasts.slice(1);

  return (
    <div className="bg-white min-h-full pb-6">
      {/* Hero - Dernier épisode */}
      {heroPodcast && (
        <section className="pt-5 pb-6">
          <div className="px-4 mb-4">
            <h2 className="text-2xl font-serif font-bold text-[#1a2a3a]">Dernier épisode</h2>
            <div className="w-[60px] h-[3px] bg-[#c9a96e] mt-2 rounded-sm"></div>
          </div>
          
          <div 
            className="mx-4 rounded-xl overflow-hidden bg-black relative cursor-pointer"
            onClick={() => handlePlayPause(heroPodcast)}
          >
            <img
              src={heroPodcast.imageUrl || DEFAULT_COVER}
              alt={heroPodcast.title}
              className="w-full aspect-video object-cover"
            />
            <div className="absolute inset-0 bg-black/50"></div>
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex items-center gap-1.5 bg-[#1c679f] px-3 py-1.5 rounded-full w-fit mb-3">
                <Headphones size={14} className="text-white" />
                <span className="text-white text-[11px] font-semibold tracking-wide">NOUVEAU</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-white mb-2 leading-[26px] line-clamp-3">
                {heroPodcast.title}
              </h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-white/80 text-[13px]">{formatDate(heroPodcast.pubDate)}</span>
                {heroPodcast.duration && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-white/50"></div>
                    <span className="text-white/80 text-[13px]">{formatDuration(heroPodcast.duration)}</span>
                  </>
                )}
              </div>
              <button className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full">
                {isCurrentlyPlaying(heroPodcast) && isPlaying ? (
                  <>
                    <Pause size={20} className="text-[#1c679f]" />
                    <span className="text-sm font-semibold text-[#1c679f]">En lecture</span>
                  </>
                ) : (
                  <>
                    <Play size={20} className="text-[#1c679f] ml-0.5" />
                    <span className="text-sm font-semibold text-[#1c679f]">Écouter</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Liste des podcasts */}
      {otherPodcasts.length > 0 && (
        <section className="px-4">
          <div className="flex items-center gap-2.5 mb-4">
            <List size={20} className="text-[#1c679f]" />
            <h2 className="text-xl font-serif font-bold text-[#1a2a3a]">Tous les épisodes</h2>
          </div>

          <div className="space-y-3">
            {otherPodcasts.map((podcast) => (
              <div
                key={podcast.id}
                className={`flex items-center p-3 bg-white rounded-xl border cursor-pointer transition-colors ${
                  isCurrentlyPlaying(podcast) 
                    ? 'border-[#1c679f] bg-[rgba(28,103,159,0.05)]' 
                    : 'border-[rgba(28,103,159,0.1)]'
                }`}
                onClick={() => handlePlayPause(podcast)}
              >
                <img
                  src={podcast.imageUrl || DEFAULT_COVER}
                  alt={podcast.title}
                  className="w-20 h-20 rounded object-cover flex-shrink-0"
                />
                <div className="flex-1 ml-3.5 mr-2 min-w-0">
                  <h3 className="text-[15px] font-serif font-bold text-[#1a2a3a] line-clamp-2 leading-5 mb-1">
                    {podcast.title}
                  </h3>
                  <p className="text-[13px] text-gray-500 line-clamp-2 leading-[18px] mb-1.5">
                    {cleanDescription(podcast.description)}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500">{formatDate(podcast.pubDate)}</span>
                    {podcast.duration && (
                      <>
                        <div className="w-0.5 h-0.5 rounded-full bg-gray-400"></div>
                        <span className="text-xs text-gray-500">{formatDuration(podcast.duration)}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 p-1">
                  {isCurrentlyPlaying(podcast) && isPlaying ? (
                    <Pause size={36} className="text-[#1c679f]" />
                  ) : (
                    <Play size={36} className="text-[#1c679f]" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {podcasts.length === 0 && (
        <div className="flex flex-col items-center py-12 px-4">
          <Headphones className="text-gray-400" size={48} />
          <p className="mt-3 text-sm text-gray-500 text-center">Aucun podcast disponible</p>
        </div>
      )}
    </div>
  );
};

export default Podcasts;
