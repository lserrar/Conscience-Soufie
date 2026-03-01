import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { useAudio } from '@/contexts/AudioContext';
import theme from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DEFAULT_COVER = 'https://i1.sndcdn.com/avatars-000342847280-qdvr5o-t500x500.jpg';

export default function PlayerScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const {
    currentPodcast,
    isPlaying,
    isLoading,
    position,
    duration,
    playbackSpeed,
    togglePlayPause,
    seekTo,
    skipForward,
    skipBackward,
    playNext,
    playPrevious,
    setSpeed,
    currentIndex,
    playlist,
  } = useAudio();

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);

  // Get podcast info from params or current podcast
  const title = currentPodcast?.title || (typeof params.title === 'string' ? params.title : 'Podcast');
  const imageUrl = currentPodcast?.imageUrl || (typeof params.image === 'string' ? params.image : DEFAULT_COVER);
  const pubDate = currentPodcast?.pubDate || (typeof params.pubDate === 'string' ? params.pubDate : '');

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
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

  const handleSliderChange = (value: number) => {
    setSeekPosition(value);
  };

  const handleSliderComplete = async (value: number) => {
    setIsSeeking(false);
    await seekTo(value);
  };

  const handleSliderStart = () => {
    setIsSeeking(true);
    setSeekPosition(position);
  };

  const canPlayPrevious = currentIndex > 0;
  const canPlayNext = currentIndex < playlist.length - 1;

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const handleSpeedChange = async () => {
    const currentSpeedIndex = speedOptions.indexOf(playbackSpeed);
    const nextIndex = (currentSpeedIndex + 1) % speedOptions.length;
    await setSpeed(speedOptions[nextIndex]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="chevron-down" size={28} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerSubtitle}>LECTURE EN COURS</Text>
          <Text style={styles.headerTitle}>Conscience Soufie</Text>
        </View>
        <View style={styles.headerButton} />
      </View>

      {/* Artwork */}
      <View style={styles.artworkContainer}>
        <Image
          source={{ uri: imageUrl || DEFAULT_COVER }}
          style={styles.artwork}
          resizeMode="cover"
        />
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </View>

      {/* Track Info */}
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={2}>{title}</Text>
        <Text style={styles.trackDate}>{formatDate(pubDate)}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration || 1}
          value={isSeeking ? seekPosition : position}
          onValueChange={handleSliderChange}
          onSlidingStart={handleSliderStart}
          onSlidingComplete={handleSliderComplete}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor="rgba(28, 103, 159, 0.2)"
          thumbTintColor={theme.colors.primary}
        />
        <View style={styles.timeContainer}>
          <Text style={styles.time}>{formatTime(isSeeking ? seekPosition : position)}</Text>
          <Text style={styles.time}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Main Controls */}
      <View style={styles.controlsContainer}>
        {/* Skip Backward */}
        <TouchableOpacity 
          onPress={() => skipBackward(30)} 
          style={styles.skipButton}
        >
          <Ionicons name="play-back" size={32} color={theme.colors.textPrimary} />
          <Text style={styles.skipText}>30</Text>
        </TouchableOpacity>

        {/* Previous */}
        <TouchableOpacity 
          onPress={playPrevious} 
          style={[styles.navButton, !canPlayPrevious && styles.navButtonDisabled]}
          disabled={!canPlayPrevious}
        >
          <Ionicons 
            name="play-skip-back" 
            size={32} 
            color={canPlayPrevious ? theme.colors.textPrimary : '#ccc'} 
          />
        </TouchableOpacity>

        {/* Play/Pause */}
        <TouchableOpacity
          onPress={togglePlayPause}
          style={styles.playButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={40}
              color="#fff"
              style={!isPlaying && { marginLeft: 4 }}
            />
          )}
        </TouchableOpacity>

        {/* Next */}
        <TouchableOpacity 
          onPress={playNext} 
          style={[styles.navButton, !canPlayNext && styles.navButtonDisabled]}
          disabled={!canPlayNext}
        >
          <Ionicons 
            name="play-skip-forward" 
            size={32} 
            color={canPlayNext ? theme.colors.textPrimary : '#ccc'} 
          />
        </TouchableOpacity>

        {/* Skip Forward */}
        <TouchableOpacity 
          onPress={() => skipForward(30)} 
          style={styles.skipButton}
        >
          <Ionicons name="play-forward" size={32} color={theme.colors.textPrimary} />
          <Text style={styles.skipText}>30</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Speed */}
        <TouchableOpacity onPress={handleSpeedChange} style={styles.speedButton}>
          <Text style={styles.speedText}>{playbackSpeed}x</Text>
        </TouchableOpacity>

        {/* Playlist indicator */}
        <View style={styles.playlistIndicator}>
          <Ionicons name="list" size={18} color={theme.colors.textSecondary} />
          <Text style={styles.playlistText}>
            {currentIndex + 1} / {playlist.length}
          </Text>
        </View>
      </View>

      <View style={{ height: insets.bottom + 20 }} />
    </View>
  );
}

const ARTWORK_SIZE = SCREEN_WIDTH - 64;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 10,
    fontFamily: theme.fonts.bodyMedium,
    color: theme.colors.textSecondary,
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  artworkContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 16,
    position: 'relative',
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    left: 32,
    right: 32,
    top: 16,
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: {
    paddingHorizontal: 32,
    paddingTop: 24,
    alignItems: 'center',
  },
  trackTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
  },
  trackDate: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: -8,
  },
  time: {
    fontSize: 12,
    fontFamily: theme.fonts.bodyMedium,
    color: theme.colors.textSecondary,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  skipButton: {
    alignItems: 'center',
    padding: 8,
    width: 56,
  },
  skipText: {
    fontSize: 10,
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  navButton: {
    padding: 12,
    marginHorizontal: 8,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: 32,
  },
  speedButton: {
    backgroundColor: 'rgba(28, 103, 159, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(28, 103, 159, 0.2)',
  },
  speedText: {
    fontSize: 14,
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.primary,
  },
  playlistIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playlistText: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
  },
});
