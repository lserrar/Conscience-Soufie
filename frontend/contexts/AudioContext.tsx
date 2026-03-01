import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Audio, AVPlaybackStatus, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { AppState, AppStateStatus, Platform } from 'react-native';

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

// Singleton to track if audio mode has been configured
let audioModeConfigured = false;

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [playlist, setPlaylist] = useState<Podcast[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  // Use refs for critical state to avoid stale closures
  const soundRef = useRef<Audio.Sound | null>(null);
  const isLoadingRef = useRef(false);
  const currentPodcastIdRef = useRef<string | null>(null);
  const playlistRef = useRef<Podcast[]>([]);
  const currentIndexRef = useRef(-1);

  // Keep refs in sync with state
  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Configure audio mode once on mount
  useEffect(() => {
    const setupAudio = async () => {
      if (audioModeConfigured) return;
      
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });
        audioModeConfigured = true;
        console.log('Audio mode configured successfully');
      } catch (error) {
        console.error('Error setting audio mode:', error);
      }
    };
    
    setupAudio();
    
    // Handle app state changes for background audio
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // Audio should continue in background - no special handling needed
      // because staysActiveInBackground: true handles this
      console.log('App state changed to:', nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
      // Cleanup sound on unmount
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

  const playNextInternal = useCallback(async () => {
    const currentPlaylist = playlistRef.current;
    const currentIdx = currentIndexRef.current;
    
    if (currentPlaylist.length === 0 || currentIdx >= currentPlaylist.length - 1) {
      return;
    }
    
    const nextIndex = currentIdx + 1;
    const nextPodcast = currentPlaylist[nextIndex];
    if (nextPodcast && nextPodcast.audioUrl) {
      await loadAndPlayAudio(nextPodcast, nextIndex);
    }
  }, []);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error('Playback error:', status.error);
        setIsLoading(false);
        isLoadingRef.current = false;
      }
      return;
    }
    
    setIsPlaying(status.isPlaying);
    setPosition(status.positionMillis || 0);
    setDuration(status.durationMillis || 0);
    
    // Auto-play next when finished
    if (status.didJustFinish && !status.isLooping) {
      setTimeout(() => {
        playNextInternal();
      }, 300);
    }
  }, [playNextInternal]);

  const stopCurrentSound = useCallback(async () => {
    const currentSound = soundRef.current;
    if (!currentSound) return;
    
    // Clear ref immediately to prevent double cleanup
    soundRef.current = null;
    
    try {
      const status = await currentSound.getStatusAsync();
      if (status.isLoaded) {
        // Remove status callback first
        currentSound.setOnPlaybackStatusUpdate(null);
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
      }
    } catch (error) {
      // Sound might already be unloaded, ignore errors
      console.log('Cleanup notice:', error);
    }
  }, []);

  const loadAndPlayAudio = useCallback(async (podcast: Podcast, index: number) => {
    // Prevent double-loading
    if (!podcast.audioUrl) {
      console.warn('No audio URL for podcast');
      return;
    }

    // Prevent concurrent loads
    if (isLoadingRef.current) {
      console.log('Already loading, skipping...');
      return;
    }

    // Check if we're already playing this exact podcast
    if (currentPodcastIdRef.current === podcast.id && soundRef.current) {
      console.log('Same podcast, toggling play/pause instead');
      try {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          if (status.isPlaying) {
            await soundRef.current.pauseAsync();
          } else {
            await soundRef.current.playAsync();
          }
        }
      } catch (e) {
        console.error('Toggle error:', e);
      }
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      // CRITICAL: Stop and unload any existing sound FIRST
      await stopCurrentSound();

      // Update state atomically
      currentPodcastIdRef.current = podcast.id;
      setCurrentPodcast(podcast);
      setCurrentIndex(index);
      setPosition(0);
      setDuration(0);

      // Brief delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 50));

      // Create new sound with explicit configuration
      const { sound, status } = await Audio.Sound.createAsync(
        { uri: podcast.audioUrl },
        { 
          shouldPlay: true, 
          rate: playbackSpeed,
          progressUpdateIntervalMillis: 500,
          positionMillis: 0,
        },
        onPlaybackStatusUpdate
      );

      // Store the new sound
      soundRef.current = sound;
      
      // Update initial status
      if (status.isLoaded) {
        setIsPlaying(status.isPlaying);
        setDuration(status.durationMillis || 0);
      }
      
    } catch (error) {
      console.error('Error playing podcast:', error);
      currentPodcastIdRef.current = null;
      setCurrentPodcast(null);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [playbackSpeed, stopCurrentSound, onPlaybackStatusUpdate]);

  const playPodcast = useCallback(async (podcast: Podcast, newPlaylist?: Podcast[], index?: number) => {
    if (!podcast.audioUrl) {
      console.error('No audio URL for podcast');
      return;
    }

    // Update playlist if provided
    if (newPlaylist) {
      setPlaylist(newPlaylist);
      playlistRef.current = newPlaylist;
    }

    const podcastIndex = index ?? 0;
    await loadAndPlayAudio(podcast, podcastIndex);
  }, [loadAndPlayAudio]);

  const togglePlayPause = useCallback(async () => {
    const currentSound = soundRef.current;
    if (!currentSound) return;

    try {
      const status = await currentSound.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await currentSound.pauseAsync();
        } else {
          await currentSound.playAsync();
        }
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  }, []);

  const seekTo = useCallback(async (positionMs: number) => {
    const currentSound = soundRef.current;
    if (!currentSound) return;

    try {
      await currentSound.setPositionAsync(positionMs);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }, []);

  const skipForward = useCallback(async (seconds: number = 30) => {
    const currentSound = soundRef.current;
    if (!currentSound) return;

    try {
      const status = await currentSound.getStatusAsync();
      if (status.isLoaded) {
        const newPosition = Math.min((status.positionMillis || 0) + seconds * 1000, status.durationMillis || 0);
        await currentSound.setPositionAsync(newPosition);
      }
    } catch (error) {
      console.error('Error skipping forward:', error);
    }
  }, []);

  const skipBackward = useCallback(async (seconds: number = 30) => {
    const currentSound = soundRef.current;
    if (!currentSound) return;

    try {
      const status = await currentSound.getStatusAsync();
      if (status.isLoaded) {
        const newPosition = Math.max((status.positionMillis || 0) - seconds * 1000, 0);
        await currentSound.setPositionAsync(newPosition);
      }
    } catch (error) {
      console.error('Error skipping backward:', error);
    }
  }, []);

  const playNext = useCallback(async () => {
    await playNextInternal();
  }, [playNextInternal]);

  const playPrevious = useCallback(async () => {
    const currentPlaylist = playlistRef.current;
    const currentIdx = currentIndexRef.current;
    
    if (currentPlaylist.length === 0 || currentIdx <= 0) return;
    
    const prevIndex = currentIdx - 1;
    const prevPodcast = currentPlaylist[prevIndex];
    if (prevPodcast && prevPodcast.audioUrl) {
      await loadAndPlayAudio(prevPodcast, prevIndex);
    }
  }, [loadAndPlayAudio]);

  const setSpeed = useCallback(async (speed: number) => {
    setPlaybackSpeed(speed);
    
    const currentSound = soundRef.current;
    if (currentSound) {
      try {
        await currentSound.setRateAsync(speed, true);
      } catch (error) {
        console.error('Error setting speed:', error);
      }
    }
  }, []);

  const stopPlayback = useCallback(async () => {
    await stopCurrentSound();
    currentPodcastIdRef.current = null;
    setCurrentPodcast(null);
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
    setCurrentIndex(-1);
  }, [stopCurrentSound]);

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
