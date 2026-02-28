import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import theme from '@/constants/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Webinar {
  id: string;
  topic: string;
  start_time: string;
  duration: number;
  join_url: string;
  status: string;
}

interface WordPressEvent {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  link: string;
  date: string;
}

export default function LiveScreen() {
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [matchedEvent, setMatchedEvent] = useState<WordPressEvent | null>(null);
  const [registrationLink, setRegistrationLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (isLive) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isLive, pulseAnim]);

  const findRegistrationLink = (content: string): string | null => {
    const patterns = [
      /href=["']([^"']*helloasso[^"']*)["']/i,
      /href=["']([^"']*eventbrite[^"']*)["']/i,
      /href=["']([^"']*billetweb[^"']*)["']/i,
      /<a[^>]*href=["']([^"']+)["'][^>]*>\s*(?:inscription|s'inscrire|réserver|participer)[^<]*<\/a>/i,
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const fetchLiveData = async () => {
    try {
      setError(null);
      
      const webinarResponse = await axios.get(`${BACKEND_URL}/api/zoom/webinars`);
      const webinars = webinarResponse.data.webinars || [];
      
      if (webinars.length === 0) {
        setWebinar(null);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const nextWebinar = webinars[0];
      setWebinar(nextWebinar);

      const now = new Date();
      const startTime = new Date(nextWebinar.start_time);
      const timeDiff = (startTime.getTime() - now.getTime()) / (1000 * 60);
      const endTime = new Date(startTime.getTime() + nextWebinar.duration * 60000);
      
      setIsLive(timeDiff <= 30 && now <= endTime);

      const wpResponse = await axios.get(
        'https://consciencesoufie.com/wp-json/wp/v2/mec-events?per_page=10&_embed'
      );
      const wpEvents: WordPressEvent[] = wpResponse.data;

      const webinarTitle = nextWebinar.topic.toLowerCase();
      const webinarDate = new Date(nextWebinar.start_time).toDateString();

      for (const event of wpEvents) {
        const eventTitle = event.title.rendered.toLowerCase();
        const eventDate = new Date(event.date).toDateString();

        if (
          eventTitle.includes(webinarTitle.substring(0, 20)) ||
          webinarTitle.includes(eventTitle.substring(0, 20)) ||
          eventDate === webinarDate
        ) {
          setMatchedEvent(event);
          
          const regLink = findRegistrationLink(event.content.rendered);
          if (regLink) {
            setRegistrationLink(regLink);
            setIsPaid(true);
          } else {
            setIsPaid(false);
          }
          break;
        }
      }
    } catch (err) {
      console.error('Error fetching live data:', err);
      setError('Impossible de charger le contenu. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLiveData();
  }, []);

  const openLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchLiveData}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!webinar) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.emptyContentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        <View style={styles.noSessionContainer}>
          <View style={styles.noSessionIcon}>
            <Ionicons name="videocam-off-outline" size={48} color={theme.colors.primary} />
          </View>
          <Text style={styles.noSessionTitle}>Aucune conférence en direct</Text>
          <Text style={styles.noSessionText}>
            Aucune conférence en direct pour le moment.{"\n"}
            Consultez les événements à venir.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
      }
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Conférence en direct</Text>
        <View style={styles.goldAccent} />
      </View>
      
      <View style={styles.webinarCard}>
        {/* Live indicator */}
        {isLive && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>EN DIRECT</Text>
          </View>
        )}

        {/* Badge */}
        <View style={[styles.badge, isPaid ? styles.paidBadge : styles.freeBadge]}>
          <Ionicons 
            name={isPaid ? "ticket-outline" : "checkmark-circle-outline"} 
            size={14} 
            color="#fff" 
            style={styles.badgeIcon}
          />
          <Text style={styles.badgeText}>
            {isPaid ? 'Événement payant' : 'Accès libre'}
          </Text>
        </View>

        <Text style={styles.webinarTitle}>{webinar.topic}</Text>
        
        <View style={styles.webinarMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.metaText}>{formatDate(webinar.start_time)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.metaText}>{formatTime(webinar.start_time)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="hourglass-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.metaText}>{webinar.duration} min</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {isPaid ? (
          <>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => registrationLink && openLink(registrationLink)}
            >
              <Ionicons name="ticket-outline" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.registerButtonText}>S'inscrire pour participer</Text>
            </TouchableOpacity>
            <Text style={styles.infoText}>
              Un lien Zoom vous sera envoyé après votre inscription.
            </Text>
          </>
        ) : (
          <Animated.View style={{ transform: [{ scale: isLive ? pulseAnim : 1 }] }}>
            <TouchableOpacity
              style={[styles.joinButton, isLive ? styles.joinButtonLive : styles.joinButtonNormal]}
              onPress={() => openLink(webinar.join_url)}
            >
              <Ionicons name="videocam-outline" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.joinButtonText}>Rejoindre en direct</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContentContainer: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.button,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: theme.fonts.bodySemiBold,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  goldAccent: {
    width: 60,
    height: 3,
    backgroundColor: theme.colors.gold,
    borderRadius: 2,
  },
  noSessionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noSessionIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...theme.shadows.card,
  },
  noSessionTitle: {
    fontSize: 22,
    fontFamily: theme.fonts.title,
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  noSessionText: {
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  webinarCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    padding: 20,
    ...theme.shadows.card,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff3b30',
    marginRight: 8,
  },
  liveText: {
    color: '#ff3b30',
    fontSize: 13,
    fontFamily: theme.fonts.bodySemiBold,
    letterSpacing: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.button,
    marginBottom: 16,
  },
  paidBadge: {
    backgroundColor: theme.colors.warning,
  },
  freeBadge: {
    backgroundColor: theme.colors.success,
  },
  badgeIcon: {
    marginRight: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: theme.fonts.bodySemiBold,
  },
  webinarTitle: {
    fontSize: 22,
    fontFamily: theme.fonts.title,
    color: theme.colors.textPrimary,
    marginBottom: 16,
    lineHeight: 30,
  },
  webinarMeta: {
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaText: {
    fontSize: 15,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(28,103,159,0.1)',
    marginVertical: 16,
  },
  registerButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: theme.borderRadius.button,
    marginBottom: 12,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: theme.fonts.bodySemiBold,
  },
  buttonIcon: {
    marginRight: 10,
  },
  infoText: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: theme.borderRadius.button,
  },
  joinButtonLive: {
    backgroundColor: theme.colors.success,
  },
  joinButtonNormal: {
    backgroundColor: theme.colors.primary,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: theme.fonts.bodySemiBold,
  },
});
