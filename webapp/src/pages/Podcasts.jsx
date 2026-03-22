import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Pause, Clock } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const API_URL = import.meta.env.VITE_API_URL || '';

const Podcasts = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentTrack, isPlaying, playTrack, pauseTrack, resumeTrack, setPlaylist } = useAudio();

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/podcasts`);
      const podcastData = response.data.podcasts || response.data || [];
      setPodcasts(podcastData);
      setPlaylist(podcastData.map(p => ({
        id: p.id,
        title: p.title,
        url: p.audio_url,
        image: p.image
      })));
    } catch (error) {
      console.error('Error fetching podcasts:', error);
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
        url: podcast.audio_url,
        image: podcast.image
      });
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 skeleton rounded-lg w-48" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-24 skeleton rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">Podcasts</h1>
        <p className="text-gray-600">
          Écoutez nos podcasts sur le soufisme, la spiritualité et les grandes figures de la tradition.
        </p>
      </div>

      <div className="space-y-4">
        {podcasts.map((podcast, index) => (
          <div
            key={podcast.id}
            className={`bg-white rounded-xl shadow-sm overflow-hidden flex items-center card-hover ${
              currentTrack?.id === podcast.id ? 'ring-2 ring-primary' : ''
            }`}
          >
            <div className="relative flex-shrink-0">
              <img 
                src={podcast.image} 
                alt={podcast.title} 
                className="w-24 h-24 md:w-32 md:h-32 object-cover"
              />
              <button
                onClick={() => handlePlayPause(podcast)}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  {currentTrack?.id === podcast.id && isPlaying ? (
                    <Pause className="text-primary" size={24} />
                  ) : (
                    <Play className="text-primary ml-1" size={24} />
                  )}
                </div>
              </button>
            </div>
            
            <div className="flex-1 p-4 md:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-400 mb-1 block">Épisode {podcasts.length - index}</span>
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{podcast.title}</h3>
                  {podcast.duration && (
                    <p className="text-sm text-gray-500 flex items-center">
                      <Clock size={14} className="mr-1" />
                      {formatDuration(podcast.duration)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handlePlayPause(podcast)}
                  className={`flex-shrink-0 ml-4 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    currentTrack?.id === podcast.id && isPlaying
                      ? 'bg-primary text-white'
                      : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                  }`}
                >
                  {currentTrack?.id === podcast.id && isPlaying ? (
                    <Pause size={20} />
                  ) : (
                    <Play size={20} className="ml-1" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {podcasts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Aucun podcast disponible pour le moment.
        </div>
      )}
    </div>
  );
};

export default Podcasts;
