import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useAudio } from '@/contexts/AudioContext';
import theme from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_COVER = 'https://i1.sndcdn.com/avatars-000342847280-qdvr5o-t500x500.jpg';

interface FullPlayerProps {
  visible: boolean;
  onClose: () => void;
}

export default function FullPlayer({ visible, onClose }: FullPlayerProps) {
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
    setSpeed,
  } = useAudio();

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);

  if (!currentPodcast) return null;

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

  const speedOptions = [1, 1.5, 2];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="chevron-down" size={28} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>En lecture</Text>
          <View style={styles.closeButton} />
        </View>

        {/* Artwork */}
        <View style={styles.artworkContainer}>
          <Image
            source={{ uri: currentPodcast.imageUrl || DEFAULT_COVER }}
            style={styles.artwork}
            resizeMode="cover"
          />
        </View>

        {/* Title & Date */}
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={3}>{currentPodcast.title}</Text>
          <Text style={styles.date}>{formatDate(currentPodcast.pubDate)}</Text>
        </View>

        {/* Progress */}
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

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity onPress={() => skipBackward(30)} style={styles.skipButton}>
            <Ionicons name="play-back" size={28} color={theme.colors.primary} />
            <Text style={styles.skipText}>30</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={togglePlayPause}
            style={styles.playButton}
          >
            {isLoading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={36}
                color="#fff"
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => skipForward(30)} style={styles.skipButton}>
            <Ionicons name="play-forward" size={28} color={theme.colors.primary} />
            <Text style={styles.skipText}>30</Text>
          </TouchableOpacity>
        </View>

        {/* Speed Selector */}
        <View style={styles.speedContainer}>
          <Text style={styles.speedLabel}>Vitesse</Text>
          <View style={styles.speedOptions}>
            {speedOptions.map((speed) => (
              <TouchableOpacity
                key={speed}
                onPress={() => setSpeed(speed)}
                style={[
                  styles.speedButton,
                  playbackSpeed === speed && styles.speedButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.speedButtonText,
                    playbackSpeed === speed && styles.speedButtonTextActive,
                  ]}
                >
                  {speed}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.bodyMedium,
    color: theme.colors.textSecondary,
  },
  artworkContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 24,
  },
  artwork: {
    width: SCREEN_WIDTH - 64,
    height: SCREEN_WIDTH - 64,
    borderRadius: 3,
    backgroundColor: '#f0f0f0',
  },
  infoContainer: {
    paddingHorizontal: 32,
    paddingTop: 28,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: theme.fonts.titleBold,
    color: '#313131',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
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
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
    gap: 32,
  },
  skipButton: {
    alignItems: 'center',
    padding: 8,
  },
  skipText: {
    fontSize: 11,
    fontFamily: theme.fonts.bodyMedium,
    color: theme.colors.primary,
    marginTop: 2,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  speedLabel: {
    fontSize: 13,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  speedOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  speedButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(28, 103, 159, 0.3)',
  },
  speedButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  speedButtonText: {
    fontSize: 14,
    fontFamily: theme.fonts.bodyMedium,
    color: theme.colors.primary,
  },
  speedButtonTextActive: {
    color: '#ffffff',
  },
});
