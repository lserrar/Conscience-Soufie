import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';

interface Podcast {
  id: string;
  title: string;
  description: string;
  pubDate: string;
  link: string;
  audioUrl: string | null;
  imageUrl: string | null;
  duration: string | null;
}

interface AudioContextType {
  // Current state
  currentPodcast: Podcast | null;
  isPlaying: boolean;
  isLoading: boolean;
  position: number; // in milliseconds
  duration: number; // in milliseconds
  playbackSpeed: number;
  
  // Playlist
  playlist: Podcast[];
  currentIndex: number;
  
  // Actions
  playPodcast: (podcast: Podcast, playlist?: Podcast[], index?: number) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  skipForward: (seconds?: number) => Promise<void>;
  skipBackward: (seconds?: number) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  setSpeed: (speed: number) => Promise<void>;
  stopPlayback: () => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [playlist, setPlaylist] = useState<Podcast[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  const soundRef = useRef<Audio.Sound | null>(null);

  // Configure audio mode on mount
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      setIsLoading(true);
      return;
    }
    
    setIsLoading(false);
    setIsPlaying(status.isPlaying);
    setPosition(status.positionMillis || 0);
    setDuration(status.durationMillis || 0);
    
    // Auto-play next when finished
    if (status.didJustFinish && !status.isLooping) {
      playNext();
    }
  }, []);

  const playPodcast = async (podcast: Podcast, newPlaylist?: Podcast[], index?: number) => {
    if (!podcast.audioUrl) {
      console.error('No audio URL for podcast');
      return;
    }

    try {
      setIsLoading(true);
      
      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Update playlist if provided
      if (newPlaylist) {
        setPlaylist(newPlaylist);
        setCurrentIndex(index ?? 0);
      } else if (index !== undefined) {
        setCurrentIndex(index);
      }

      setCurrentPodcast(podcast);

      // Create and load new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: podcast.audioUrl },
        { shouldPlay: true, rate: playbackSpeed },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing podcast:', error);
      setIsLoading(false);
    }
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) return;

    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await soundRef.current.pauseAsync();
        } else {
          await soundRef.current.playAsync();
        }
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const seekTo = async (positionMs: number) => {
    if (!soundRef.current) return;

    try {
      await soundRef.current.setPositionAsync(positionMs);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const skipForward = async (seconds: number = 30) => {
    if (!soundRef.current) return;

    try {
      const newPosition = Math.min(position + seconds * 1000, duration);
      await soundRef.current.setPositionAsync(newPosition);
    } catch (error) {
      console.error('Error skipping forward:', error);
    }
  };

  const skipBackward = async (seconds: number = 30) => {
    if (!soundRef.current) return;

    try {
      const newPosition = Math.max(position - seconds * 1000, 0);
      await soundRef.current.setPositionAsync(newPosition);
    } catch (error) {
      console.error('Error skipping backward:', error);
    }
  };

  const playNext = async () => {
    if (playlist.length === 0 || currentIndex >= playlist.length - 1) return;
    
    const nextIndex = currentIndex + 1;
    const nextPodcast = playlist[nextIndex];
    if (nextPodcast) {
      await playPodcast(nextPodcast, undefined, nextIndex);
    }
  };

  const playPrevious = async () => {
    if (playlist.length === 0 || currentIndex <= 0) return;
    
    const prevIndex = currentIndex - 1;
    const prevPodcast = playlist[prevIndex];
    if (prevPodcast) {
      await playPodcast(prevPodcast, undefined, prevIndex);
    }
  };

  const setSpeed = async (speed: number) => {
    setPlaybackSpeed(speed);
    
    if (soundRef.current) {
      try {
        await soundRef.current.setRateAsync(speed, true);
      } catch (error) {
        console.error('Error setting speed:', error);
      }
    }
  };

  const stopPlayback = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      } catch (error) {
        console.error('Error stopping:', error);
      }
    }
    
    setCurrentPodcast(null);
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
    setCurrentIndex(-1);
  };

  return (
    <AudioContext.Provider
      value={{
        currentPodcast,
        isPlaying,
        isLoading,
        position,
        duration,
        playbackSpeed,
        playlist,
        currentIndex,
        playPodcast,
        togglePlayPause,
        seekTo,
        skipForward,
        skipBackward,
        playNext,
        playPrevious,
        setSpeed,
        stopPlayback,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
