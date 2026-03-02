import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync, AudioPlayer } from 'expo-audio';
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

// Default podcast cover
const DEFAULT_COVER = 'https://i1.sndcdn.com/avatars-000342847280-qdvr5o-t500x500.jpg';

// Singleton to track if audio mode has been configured
let audioModeConfigured = false;

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackSpeed, setPlaybackSpeedState] = useState(1);
  const [playlist, setPlaylist] = useState<Podcast[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  // Create audio player - using empty source initially
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);
  
  // Refs for stable callbacks
  const currentPodcastIdRef = useRef<string | null>(null);
  const playlistRef = useRef<Podcast[]>([]);
  const currentIndexRef = useRef(-1);
  const isLoadingRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Derive state from player status
  const isPlaying = status?.playing || false;
  const position = (status?.currentTime || 0) * 1000; // Convert to milliseconds for compatibility
  const duration = (status?.duration || 0) * 1000; // Convert to milliseconds for compatibility

  // Configure audio mode once on mount for background playback
  useEffect(() => {
    const setupAudio = async () => {
      if (audioModeConfigured) return;
      
      try {
        // Configure audio mode for background playback
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'doNotMix',
        });
        audioModeConfigured = true;
        console.log('Audio mode configured for background playback');
      } catch (error) {
        console.error('Error setting audio mode:', error);
      }
    };
    
    setupAudio();
    
    // Handle app state changes for background audio
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log('App state changed to:', nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, []);

  // Handle track completion - auto-play next
  useEffect(() => {
    if (status?.didJustFinish && !isLoadingRef.current) {
      const currentPlaylist = playlistRef.current;
      const currentIdx = currentIndexRef.current;
      
      if (currentPlaylist.length > 0 && currentIdx < currentPlaylist.length - 1) {
        // Auto-play next track
        setTimeout(() => {
          const nextIndex = currentIdx + 1;
          const nextPodcast = currentPlaylist[nextIndex];
          if (nextPodcast && nextPodcast.audioUrl) {
            playPodcastInternal(nextPodcast, nextIndex);
          }
        }, 300);
      }
    }
  }, [status?.didJustFinish]);

  const playPodcastInternal = useCallback(async (podcast: Podcast, index: number) => {
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
    if (currentPodcastIdRef.current === podcast.id && player) {
      console.log('Same podcast, toggling play/pause instead');
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      // Stop current playback if any
      if (player && currentPodcastIdRef.current) {
        player.pause();
        try {
          player.setActiveForLockScreen(false);
        } catch (e) {
          // Ignore if not supported
        }
      }

      // Update state
      currentPodcastIdRef.current = podcast.id;
      setCurrentPodcast(podcast);
      setCurrentIndex(index);

      // Small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 50));

      // Replace the audio source with the new one
      player.replace({ uri: podcast.audioUrl });
      
      // Start playback
      player.play();

      // Enable lock screen controls with metadata for background playback
      try {
        player.setActiveForLockScreen(true, {
          title: podcast.title,
          artist: 'Conscience Soufie',
          albumTitle: 'Podcasts',
          artworkUrl: podcast.imageUrl || DEFAULT_COVER,
        });
        console.log('Lock screen controls enabled');
      } catch (lockScreenError) {
        console.log('Lock screen controls not available:', lockScreenError);
      }

      // Set playback speed if not default
      if (playbackSpeed !== 1) {
        try {
          player.setPlaybackRate(playbackSpeed);
        } catch (e) {
          console.log('Could not set playback rate:', e);
        }
      }

      console.log('Started playback:', podcast.title);
      
    } catch (error) {
      console.error('Error playing podcast:', error);
      currentPodcastIdRef.current = null;
      setCurrentPodcast(null);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [player, isPlaying, playbackSpeed]);

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
    await playPodcastInternal(podcast, podcastIndex);
  }, [playPodcastInternal]);

  const togglePlayPause = useCallback(async () => {
    if (!player) return;

    try {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  }, [player, isPlaying]);

  const seekTo = useCallback(async (positionMs: number) => {
    if (!player) return;

    try {
      // Convert from milliseconds to seconds
      player.seekTo(positionMs / 1000);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }, [player]);

  const skipForward = useCallback(async (seconds: number = 30) => {
    if (!player || !status) return;

    try {
      const newPosition = Math.min((status.currentTime || 0) + seconds, status.duration || 0);
      player.seekTo(newPosition);
    } catch (error) {
      console.error('Error skipping forward:', error);
    }
  }, [player, status]);

  const skipBackward = useCallback(async (seconds: number = 30) => {
    if (!player || !status) return;

    try {
      const newPosition = Math.max((status.currentTime || 0) - seconds, 0);
      player.seekTo(newPosition);
    } catch (error) {
      console.error('Error skipping backward:', error);
    }
  }, [player, status]);

  const playNext = useCallback(async () => {
    const currentPlaylist = playlistRef.current;
    const currentIdx = currentIndexRef.current;
    
    if (currentPlaylist.length === 0 || currentIdx >= currentPlaylist.length - 1) {
      return;
    }
    
    const nextIndex = currentIdx + 1;
    const nextPodcast = currentPlaylist[nextIndex];
    if (nextPodcast && nextPodcast.audioUrl) {
      await playPodcastInternal(nextPodcast, nextIndex);
    }
  }, [playPodcastInternal]);

  const playPrevious = useCallback(async () => {
    const currentPlaylist = playlistRef.current;
    const currentIdx = currentIndexRef.current;
    
    if (currentPlaylist.length === 0 || currentIdx <= 0) return;
    
    const prevIndex = currentIdx - 1;
    const prevPodcast = currentPlaylist[prevIndex];
    if (prevPodcast && prevPodcast.audioUrl) {
      await playPodcastInternal(prevPodcast, prevIndex);
    }
  }, [playPodcastInternal]);

  const setSpeed = useCallback(async (speed: number) => {
    setPlaybackSpeedState(speed);
    
    if (player) {
      try {
        player.setPlaybackRate(speed);
      } catch (error) {
        console.error('Error setting speed:', error);
      }
    }
  }, [player]);

  const stopPlayback = useCallback(async () => {
    if (player) {
      player.pause();
      player.seekTo(0);
      try {
        player.setActiveForLockScreen(false);
      } catch (e) {
        // Ignore if not supported
      }
    }
    currentPodcastIdRef.current = null;
    setCurrentPodcast(null);
    setCurrentIndex(-1);
  }, [player]);

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
