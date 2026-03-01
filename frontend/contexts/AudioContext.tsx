import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Platform } from 'react-native';

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
  currentPodcast: Podcast | null;
  isPlaying: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
  playbackSpeed: number;
  playlist: Podcast[];
  currentIndex: number;
  
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
  const isLoadingRef = useRef(false);

  // Configure audio mode on mount
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error('Error setting audio mode:', error);
      }
    };
    
    setupAudio();
    
    return () => {
      // Cleanup on unmount
      const cleanup = async () => {
        if (soundRef.current) {
          try {
            await soundRef.current.stopAsync();
            await soundRef.current.unloadAsync();
          } catch (e) {
            // Ignore cleanup errors
          }
          soundRef.current = null;
        }
      };
      cleanup();
    };
  }, []);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error('Playback error:', status.error);
      }
      return;
    }
    
    setIsPlaying(status.isPlaying);
    setPosition(status.positionMillis || 0);
    setDuration(status.durationMillis || 0);
    
    // Auto-play next when finished
    if (status.didJustFinish && !status.isLooping) {
      // Use setTimeout to avoid state update issues
      setTimeout(() => {
        playNextInternal();
      }, 500);
    }
  }, []);

  const playNextInternal = async () => {
    if (playlist.length === 0 || currentIndex >= playlist.length - 1) return;
    
    const nextIndex = currentIndex + 1;
    const nextPodcast = playlist[nextIndex];
    if (nextPodcast && nextPodcast.audioUrl) {
      await loadAndPlayAudio(nextPodcast, nextIndex);
    }
  };

  const stopCurrentSound = async () => {
    if (soundRef.current) {
      try {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
        }
      } catch (error) {
        console.log('Error stopping sound:', error);
      }
      soundRef.current = null;
    }
  };

  const loadAndPlayAudio = async (podcast: Podcast, index: number) => {
    if (!podcast.audioUrl || isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      // IMPORTANT: Stop and unload any existing sound first
      await stopCurrentSound();

      // Update state
      setCurrentPodcast(podcast);
      setCurrentIndex(index);
      setPosition(0);
      setDuration(0);

      // Small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: podcast.audioUrl },
        { 
          shouldPlay: true, 
          rate: playbackSpeed,
          progressUpdateIntervalMillis: 500,
        },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing podcast:', error);
      setCurrentPodcast(null);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  };

  const playPodcast = async (podcast: Podcast, newPlaylist?: Podcast[], index?: number) => {
    if (!podcast.audioUrl) {
      console.error('No audio URL for podcast');
      return;
    }

    // Update playlist if provided
    if (newPlaylist) {
      setPlaylist(newPlaylist);
    }

    const podcastIndex = index ?? 0;
    await loadAndPlayAudio(podcast, podcastIndex);
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
    await playNextInternal();
  };

  const playPrevious = async () => {
    if (playlist.length === 0 || currentIndex <= 0) return;
    
    const prevIndex = currentIndex - 1;
    const prevPodcast = playlist[prevIndex];
    if (prevPodcast && prevPodcast.audioUrl) {
      await loadAndPlayAudio(prevPodcast, prevIndex);
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
    await stopCurrentSound();
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
