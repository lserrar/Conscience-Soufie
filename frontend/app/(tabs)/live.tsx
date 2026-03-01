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
  Linking,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';
import theme from '@/constants/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;
const CARD_HEIGHT = CARD_WIDTH * 1.2;

interface HelloAssoEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  banner: string | null;
  logo: string | null;
  url: string;
  place?: {
    name?: string;
    city?: string;
  };
}

export default function ZoomScreen() {
  const [events, setEvents] = useState<HelloAssoEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const liveDotAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const dotPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(liveDotAnim, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(liveDotAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    dotPulse.start();
    return () => dotPulse.stop();
  }, [liveDotAnim]);

  const fetchEvents = async () => {
    try {
      setError(null);
      const response = await axios.get(`${BACKEND_URL}/api/helloasso/events`);
      const eventList = response.data.events || [];
      setEvents(eventList);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Impossible de charger les événements.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long' 
      });
    } catch {
      return '';
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const isLive = (event: HelloAssoEvent) => {
    const now = new Date();
    const startTime = new Date(event.startDate);
    const endTime = new Date(event.endDate);
    return now >= startTime && now <= endTime;
  };

  const isSoon = (event: HelloAssoEvent) => {
    const now = new Date();
    const startTime = new Date(event.startDate);
    const timeDiff = (startTime.getTime() - now.getTime()) / (1000 * 60);
    return timeDiff <= 30 && timeDiff > 0;
  };

  const joinEvent = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const getEventImage = (event: HelloAssoEvent) => {
    return event.banner || event.logo || null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="cloud-offline-outline" size={48} color={theme.colors.textSecondary} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchEvents}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.emptyContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="videocam-outline" size={48} color={theme.colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Aucun événement programmé</Text>
          <Text style={styles.emptySubtitle}>
            Les prochains événements Zoom apparaîtront ici.
            Revenez bientôt !
          </Text>
        </View>
      </ScrollView>
    );
  }

  const nextEvent = events[0];
  const upcomingEvents = events.slice(1);
  const nextEventImage = getEventImage(nextEvent);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
      }
    >
      {/* Hero - Prochain événement */}
      <View style={styles.heroSection}>
        <Text style={styles.sectionTitle}>Prochain événement</Text>
        
        <TouchableOpacity 
          style={styles.heroCard}
          onPress={() => joinEvent(nextEvent.url)}
          activeOpacity={0.95}
        >
          {nextEventImage ? (
            <ImageBackground
              source={{ uri: nextEventImage }}
              style={styles.heroImage}
              imageStyle={styles.heroImageStyle}
            >
              <View style={styles.heroOverlay}>
                {(isLive(nextEvent) || isSoon(nextEvent)) && (
                  <View style={[styles.liveBadge, isSoon(nextEvent) && !isLive(nextEvent) && styles.soonBadge]}>
                    <Animated.View style={[styles.liveDot, { opacity: liveDotAnim }]} />
                    <Text style={styles.liveBadgeText}>
                      {isLive(nextEvent) ? 'EN DIRECT' : 'BIENTÔT'}
                    </Text>
                  </View>
                )}
                
                <View style={styles.heroContent}>
                  <View style={styles.heroDateBadge}>
                    <Ionicons name="calendar-outline" size={14} color="#fff" />
                    <Text style={styles.heroDateText}>
                      {formatDate(nextEvent.startDate)} à {formatTime(nextEvent.startDate)}
                    </Text>
                  </View>
                  
                  <Text style={styles.heroTitle} numberOfLines={3}>
                    {nextEvent.title}
                  </Text>
                  
                  <TouchableOpacity 
                    style={styles.joinButton}
                    onPress={() => joinEvent(nextEvent.url)}
                  >
                    <Ionicons name="videocam" size={18} color="#fff" />
                    <Text style={styles.joinButtonText}>Rejoindre Zoom</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ImageBackground>
          ) : (
            <View style={[styles.heroImage, styles.heroNoImage]}>
              <View style={styles.heroOverlay}>
                {(isLive(nextEvent) || isSoon(nextEvent)) && (
                  <View style={[styles.liveBadge, isSoon(nextEvent) && !isLive(nextEvent) && styles.soonBadge]}>
                    <Animated.View style={[styles.liveDot, { opacity: liveDotAnim }]} />
                    <Text style={styles.liveBadgeText}>
                      {isLive(nextEvent) ? 'EN DIRECT' : 'BIENTÔT'}
                    </Text>
                  </View>
                )}
                
                <View style={styles.heroContentNoImage}>
                  <Ionicons name="videocam" size={48} color="rgba(255,255,255,0.3)" />
                  
                  <View style={styles.heroDateBadge}>
                    <Ionicons name="calendar-outline" size={14} color="#fff" />
                    <Text style={styles.heroDateText}>
                      {formatDate(nextEvent.startDate)} à {formatTime(nextEvent.startDate)}
                    </Text>
                  </View>
                  
                  <Text style={styles.heroTitle} numberOfLines={3}>
                    {nextEvent.title}
                  </Text>
                  
                  <TouchableOpacity 
                    style={styles.joinButton}
                    onPress={() => joinEvent(nextEvent.url)}
                  >
                    <Ionicons name="videocam" size={18} color="#fff" />
                    <Text style={styles.joinButtonText}>Rejoindre Zoom</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Carousel - Prochains événements */}
      {upcomingEvents.length > 0 && (
        <View style={styles.upcomingSection}>
          <Text style={styles.sectionTitle}>À venir</Text>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + 12}
          >
            {upcomingEvents.map((event, index) => {
              const eventImage = getEventImage(event);
              return (
                <TouchableOpacity
                  key={event.id}
                  style={[styles.eventCard, index === upcomingEvents.length - 1 && styles.lastCard]}
                  onPress={() => joinEvent(event.url)}
                  activeOpacity={0.95}
                >
                  {eventImage ? (
                    <ImageBackground
                      source={{ uri: eventImage }}
                      style={styles.cardImage}
                      imageStyle={styles.cardImageStyle}
                    >
                      <View style={styles.cardOverlay}>
                        <View style={styles.cardDateBadge}>
                          <Text style={styles.cardDateText}>{formatDate(event.startDate)}</Text>
                        </View>
                        
                        <View style={styles.cardContent}>
                          <Text style={styles.cardTitle} numberOfLines={3}>
                            {event.title}
                          </Text>
                          
                          <View style={styles.cardTime}>
                            <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.9)" />
                            <Text style={styles.cardTimeText}>{formatTime(event.startDate)}</Text>
                          </View>
                          
                          <View style={styles.cardJoinRow}>
                            <Ionicons name="videocam" size={16} color="#fff" />
                            <Text style={styles.cardJoinText}>Rejoindre Zoom</Text>
                          </View>
                        </View>
                      </View>
                    </ImageBackground>
                  ) : (
                    <View style={[styles.cardImage, styles.cardNoImage]}>
                      <View style={styles.cardOverlay}>
                        <View style={styles.cardDateBadge}>
                          <Text style={styles.cardDateText}>{formatDate(event.startDate)}</Text>
                        </View>
                        
                        <Ionicons name="videocam" size={32} color="rgba(255,255,255,0.2)" style={styles.cardPlaceholderIcon} />
                        
                        <View style={styles.cardContent}>
                          <Text style={styles.cardTitle} numberOfLines={3}>
                            {event.title}
                          </Text>
                          
                          <View style={styles.cardTime}>
                            <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.9)" />
                            <Text style={styles.cardTimeText}>{formatTime(event.startDate)}</Text>
                          </View>
                          
                          <View style={styles.cardJoinRow}>
                            <Ionicons name="videocam" size={16} color="#fff" />
                            <Text style={styles.cardJoinText}>Rejoindre Zoom</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Info section */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color={theme.colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Comment rejoindre ?</Text>
            <Text style={styles.infoText}>
              Cliquez sur "Rejoindre Zoom" pour vous inscrire à l'événement et recevoir le lien de connexion.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(28,103,159,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Hero Section
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  heroCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: SCREEN_WIDTH * 0.85,
  },
  heroNoImage: {
    backgroundColor: theme.colors.primary,
  },
  heroImageStyle: {
    borderRadius: 16,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
    justifyContent: 'space-between',
  },
  heroContentNoImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#e53935',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  soonBadge: {
    backgroundColor: '#ff9800',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  liveBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: theme.fonts.bodySemiBold,
    letterSpacing: 1,
  },
  heroContent: {
    gap: 12,
  },
  heroDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  heroDateText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: theme.fonts.bodySemiBold,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontFamily: theme.fonts.titleBold,
    lineHeight: 28,
    textAlign: 'center',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: theme.fonts.bodySemiBold,
  },

  // Upcoming Section
  upcomingSection: {
    paddingTop: 32,
    paddingLeft: 16,
  },
  carouselContainer: {
    paddingRight: 16,
  },
  eventCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  lastCard: {
    marginRight: 0,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardNoImage: {
    backgroundColor: theme.colors.primary,
  },
  cardImageStyle: {
    borderRadius: 12,
  },
  cardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 16,
    justifyContent: 'space-between',
  },
  cardPlaceholderIcon: {
    alignSelf: 'center',
  },
  cardDateBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  cardDateText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: theme.fonts.bodySemiBold,
  },
  cardContent: {
    gap: 8,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 17,
    fontFamily: theme.fonts.titleBold,
    lineHeight: 22,
  },
  cardTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardTimeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontFamily: theme.fonts.body,
  },
  cardJoinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  cardJoinText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: theme.fonts.bodySemiBold,
  },

  // Info Section
  infoSection: {
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(28,103,159,0.05)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },

  bottomSpacer: {
    height: 40,
  },
});
