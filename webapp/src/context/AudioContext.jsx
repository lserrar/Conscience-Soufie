import React, { createContext, useContext, useState, useRef } from 'react';

const AudioContext = createContext(null);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
};

export const AudioProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const audioRef = useRef(null);

  const playTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const pauseTrack = () => {
    setIsPlaying(false);
  };

  const resumeTrack = () => {
    setIsPlaying(true);
  };

  const stopTrack = () => {
    setCurrentTrack(null);
    setIsPlaying(false);
  };

  const nextTrack = () => {
    if (playlist.length > 0 && currentTrack) {
      const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
      if (currentIndex < playlist.length - 1) {
        playTrack(playlist[currentIndex + 1]);
      }
    }
  };

  const previousTrack = () => {
    if (playlist.length > 0 && currentTrack) {
      const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
      if (currentIndex > 0) {
        playTrack(playlist[currentIndex - 1]);
      }
    }
  };

  return (
    <AudioContext.Provider 
      value={{ 
        currentTrack, 
        isPlaying, 
        playlist,
        setPlaylist,
        playTrack, 
        pauseTrack, 
        resumeTrack, 
        stopTrack,
        nextTrack,
        previousTrack,
        audioRef
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
