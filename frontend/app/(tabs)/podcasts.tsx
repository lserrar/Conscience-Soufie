import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAudio } from '@/contexts/AudioContext';
import MiniPlayer from '@/components/MiniPlayer';
import FullPlayer from '@/components/FullPlayer';
import theme from '@/constants/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Default podcast cover from SoundCloud
const DEFAULT_COVER = 'https://i1.sndcdn.com/avatars-000342847280-qdvr5o-t500x500.jpg';

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

export default function PodcastsScreen() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heroPodcast, setHeroPodcast] = useState<Podcast | null>(null);
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  
  const { currentPodcast, playPodcast, isPlaying } = useAudio();
  const heroScale = useRef(new Animated.Value(1)).current;

  const fetchPodcasts = async () => {
    try {
      setError(null);
      const response = await axios.get(`${BACKEND_URL}/api/podcasts`);
      const podcastList = response.data.podcasts || [];
      setPodcasts(podcastList);
      
      if (podcastList.length > 0) {
        setHeroPodcast(podcastList[0]);
      }
    } catch (err) {
      console.error('Error fetching podcasts:', err);
      setError('Impossible de charger les podcasts.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPodcasts();
  }, []);

  const formatDate = (dateStr: string) => {
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

  const formatDuration = (duration: string | null) => {
    if (!duration) return '';
    // Duration can be "HH:MM:SS" or seconds
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
    // If it's just seconds
    const secs = parseInt(duration);
    const mins = Math.floor(secs / 60);
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainMins = mins % 60;
      return `${hours}h ${remainMins}min`;
    }
    return `${mins} min`;
  };

  const cleanDescription = (html: string) => {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim()
      .substring(0, 200);
  };

  const handlePlayPodcast = async (podcast: Podcast, index: number) => {
    if (!podcast.audioUrl) {
      console.error('No audio URL for podcast');
      return;
    }
    await playPodcast(podcast, podcasts, index);
    // Ouvrir directement le lecteur plein écran
    setShowFullPlayer(true);
  };

  const handleHeroPressIn = () => {
    Animated.spring(heroScale, { toValue: 0.98, useNativeDriver: true }).start();
  };

  const handleHeroPressOut = () => {
    Animated.spring(heroScale, { toValue: 1, useNativeDriver: true }).start();
  };

  const isCurrentlyPlaying = (podcast: Podcast) => {
    return currentPodcast?.id === podcast.id;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Chargement des podcasts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="cloud-offline-outline" size={48} color={theme.colors.textSecondary} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPodcasts}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
        contentContainerStyle={[
          styles.scrollContent,
          currentPodcast && { paddingBottom: 80 }
        ]}
      >
        {/* Hero - Dernier Podcast */}
        {heroPodcast && (
          <View style={styles.heroSection}>
            <View style={styles.heroHeader}>
              <Text style={styles.heroHeaderTitle}>Dernier épisode</Text>
              <View style={styles.heroHeaderUnderline} />
            </View>
            
            <Animated.View style={{ transform: [{ scale: heroScale }] }}>
              <TouchableOpacity
                activeOpacity={1}
                onPressIn={handleHeroPressIn}
                onPressOut={handleHeroPressOut}
                onPress={() => handlePlayPodcast(heroPodcast, 0)}
                style={styles.heroCard}
              >
                <Image
                  source={{ uri: heroPodcast.imageUrl || DEFAULT_COVER }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
                <View style={styles.heroOverlay} />
                <View style={styles.heroContent}>
                  <View style={styles.heroBadge}>
                    <Ionicons name="headset" size={14} color="#fff" />
                    <Text style={styles.heroBadgeText}>NOUVEAU</Text>
                  </View>
                  <Text style={styles.heroTitle} numberOfLines={3}>{heroPodcast.title}</Text>
                  <View style={styles.heroMeta}>
                    <Text style={styles.heroDate}>{formatDate(heroPodcast.pubDate)}</Text>
                    {heroPodcast.duration && (
                      <>
                        <View style={styles.heroDot} />
                        <Text style={styles.heroDuration}>{formatDuration(heroPodcast.duration)}</Text>
                      </>
                    )}
                  </View>
                  <View style={styles.heroPlayButton}>
                    <Ionicons 
                      name={isCurrentlyPlaying(heroPodcast) && isPlaying ? "pause" : "play"} 
                      size={20} 
                      color={theme.colors.primary} 
                    />
                    <Text style={styles.heroPlayText}>
                      {isCurrentlyPlaying(heroPodcast) && isPlaying ? "En lecture" : "Écouter"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}

        {/* Liste des podcasts */}
        {podcasts.length > 1 && (
          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <Ionicons name="list" size={20} color={theme.colors.primary} />
              <Text style={styles.listTitle}>Tous les épisodes</Text>
            </View>

            {podcasts.slice(1).map((podcast, index) => (
              <TouchableOpacity
                key={podcast.id || index}
                style={[
                  styles.podcastCard,
                  isCurrentlyPlaying(podcast) && styles.podcastCardActive
                ]}
                onPress={() => handlePlayPodcast(podcast, index + 1)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: podcast.imageUrl || DEFAULT_COVER }}
                  style={styles.podcastImage}
                  resizeMode="cover"
                />
                <View style={styles.podcastContent}>
                  <Text style={styles.podcastTitle} numberOfLines={2}>{podcast.title}</Text>
                  <Text style={styles.podcastDescription} numberOfLines={2}>
                    {cleanDescription(podcast.description)}
                  </Text>
                  <View style={styles.podcastMeta}>
                    <Text style={styles.podcastDate}>{formatDate(podcast.pubDate)}</Text>
                    {podcast.duration && (
                      <>
                        <View style={styles.podcastDot} />
                        <Text style={styles.podcastDuration}>{formatDuration(podcast.duration)}</Text>
                      </>
                    )}
                  </View>
                </View>
                <View style={styles.podcastPlayIcon}>
                  {isCurrentlyPlaying(podcast) && isPlaying ? (
                    <View style={styles.nowPlayingIndicator}>
                      <Ionicons name="pause-circle" size={36} color={theme.colors.primary} />
                    </View>
                  ) : (
                    <Ionicons name="play-circle" size={36} color={theme.colors.primary} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {podcasts.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="headset-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>Aucun podcast disponible</Text>
          </View>
        )}
      </ScrollView>

      {/* Mini Player */}
      {currentPodcast && (
        <MiniPlayer onPress={() => setShowFullPlayer(true)} />
      )}

      {/* Full Player Modal */}
      <FullPlayer 
        visible={showFullPlayer} 
        onClose={() => setShowFullPlayer(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: theme.fonts.title,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
  },
  errorText: {
    fontSize: 14,
    fontFamily: theme.fonts.title,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.button,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: theme.fonts.bodySemiBold,
  },

  // Hero Section
  heroSection: {
    paddingTop: 20,
    paddingBottom: 24,
  },
  heroHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  heroHeaderTitle: {
    fontSize: 24,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
  },
  heroHeaderUnderline: {
    width: 60,
    height: 3,
    backgroundColor: theme.colors.gold,
    marginTop: 8,
    borderRadius: 2,
  },
  heroCard: {
    marginHorizontal: 16,
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  heroImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    gap: 6,
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: theme.fonts.bodySemiBold,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.titleBold,
    color: '#fff',
    marginBottom: 8,
    lineHeight: 26,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroDate: {
    fontSize: 13,
    fontFamily: theme.fonts.body,
    color: 'rgba(255,255,255,0.8)',
  },
  heroDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 8,
  },
  heroDuration: {
    fontSize: 13,
    fontFamily: theme.fonts.body,
    color: 'rgba(255,255,255,0.8)',
  },
  heroPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  heroPlayText: {
    fontSize: 14,
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.primary,
  },

  // List Section
  listSection: {
    paddingHorizontal: 16,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  listTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
  },

  // Podcast Card
  podcastCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.medium,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(28,103,159,0.1)',
    alignItems: 'center',
  },
  podcastCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(28,103,159,0.05)',
  },
  podcastImage: {
    width: 80,
    height: 80,
    borderRadius: 3,
    backgroundColor: '#f0f0f0',
  },
  podcastContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  podcastTitle: {
    fontSize: 15,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
    lineHeight: 20,
  },
  podcastDescription: {
    fontSize: 13,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  podcastMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  podcastDate: {
    fontSize: 12,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
  },
  podcastDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.textSecondary,
    marginHorizontal: 6,
  },
  podcastDuration: {
    fontSize: 12,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
  },
  podcastPlayIcon: {
    padding: 4,
  },
  nowPlayingIndicator: {
    position: 'relative',
  },

  // Empty
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
});
