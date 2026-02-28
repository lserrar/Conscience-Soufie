import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '@/contexts/AudioContext';
import theme from '@/constants/theme';

const DEFAULT_COVER = 'https://i1.sndcdn.com/avatars-000342847280-qdvr5o-t500x500.jpg';

interface MiniPlayerProps {
  onPress: () => void;
}

export default function MiniPlayer({ onPress }: MiniPlayerProps) {
  const {
    currentPodcast,
    isPlaying,
    isLoading,
    position,
    duration,
    togglePlayPause,
    playPrevious,
    playNext,
    currentIndex,
    playlist,
  } = useAudio();

  if (!currentPodcast) return null;

  const progress = duration > 0 ? (position / duration) * 100 : 0;
  const canPlayPrevious = currentIndex > 0;
  const canPlayNext = currentIndex < playlist.length - 1;

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      <TouchableOpacity 
        style={styles.content} 
        onPress={onPress}
        activeOpacity={0.9}
      >
        {/* Artwork */}
        <Image
          source={{ uri: currentPodcast.imageUrl || DEFAULT_COVER }}
          style={styles.artwork}
          resizeMode="cover"
        />

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {currentPodcast.title}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={playPrevious}
            style={[styles.controlButton, !canPlayPrevious && styles.controlButtonDisabled]}
            disabled={!canPlayPrevious}
          >
            <Ionicons 
              name="play-skip-back" 
              size={20} 
              color={canPlayPrevious ? theme.colors.primary : '#ccc'} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={togglePlayPause}
            style={styles.playButton}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={24}
                color={theme.colors.primary}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={playNext}
            style={[styles.controlButton, !canPlayNext && styles.controlButtonDisabled]}
            disabled={!canPlayNext}
          >
            <Ionicons 
              name="play-skip-forward" 
              size={20} 
              color={canPlayNext ? theme.colors.primary : '#ccc'} 
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(28, 103, 159, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: 'rgba(28, 103, 159, 0.15)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  artwork: {
    width: 40,
    height: 40,
    borderRadius: 3,
    backgroundColor: '#f0f0f0',
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontFamily: theme.fonts.bodyMedium,
    color: '#313131',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  controlButton: {
    padding: 8,
  },
  controlButtonDisabled: {
    opacity: 0.4,
  },
  playButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
