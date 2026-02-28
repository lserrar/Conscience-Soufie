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

const PRIMARY_COLOR = '#1c679f';
const GREEN_COLOR = '#28a745';
const ORANGE_COLOR = '#f0ad4e';

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
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isLive, pulseAnim]);

  const findRegistrationLink = (content: string): string | null => {
    // Look for registration links
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
      
      // Fetch webinars from backend
      const webinarResponse = await axios.get(`${BACKEND_URL}/api/zoom/webinars`);
      const webinars = webinarResponse.data.webinars || [];
      
      if (webinars.length === 0) {
        setWebinar(null);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Get the first upcoming webinar
      const nextWebinar = webinars[0];
      setWebinar(nextWebinar);

      // Check if live or starting soon
      const now = new Date();
      const startTime = new Date(nextWebinar.start_time);
      const timeDiff = (startTime.getTime() - now.getTime()) / (1000 * 60); // in minutes
      const endTime = new Date(startTime.getTime() + nextWebinar.duration * 60000);
      
      setIsLive(timeDiff <= 30 && now <= endTime);

      // Fetch WordPress events to cross-reference
      const wpResponse = await axios.get(
        'https://consciencesoufie.com/wp-json/wp/v2/mec-events?per_page=10&_embed'
      );
      const wpEvents: WordPressEvent[] = wpResponse.data;

      // Try to match webinar with WordPress event
      const webinarTitle = nextWebinar.topic.toLowerCase();
      const webinarDate = new Date(nextWebinar.start_time).toDateString();

      for (const event of wpEvents) {
        const eventTitle = event.title.rendered.toLowerCase();
        const eventDate = new Date(event.date).toDateString();

        // Match by title similarity or date
        if (
          eventTitle.includes(webinarTitle.substring(0, 20)) ||
          webinarTitle.includes(eventTitle.substring(0, 20)) ||
          eventDate === webinarDate
        ) {
          setMatchedEvent(event);
          
          // Look for registration link in content
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
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY_COLOR]} />
        }
      >
        <View style={styles.noSessionContainer}>
          <Ionicons name="videocam-off" size={64} color="#ccc" />
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
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY_COLOR]} />
      }
    >
      <Text style={styles.sectionTitle}>Conférence en direct</Text>
      
      <View style={styles.webinarCard}>
        {/* Badge */}
        <View style={[styles.badge, isPaid ? styles.paidBadge : styles.freeBadge]}>
          <Text style={styles.badgeText}>
            {isPaid ? 'Événement payant' : 'Accès libre'}
          </Text>
        </View>

        {/* Live indicator */}
        {isLive && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>EN DIRECT</Text>
          </View>
        )}

        <Text style={styles.webinarTitle}>{webinar.topic}</Text>
        
        <View style={styles.webinarMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar" size={18} color={PRIMARY_COLOR} />
            <Text style={styles.metaText}>{formatDate(webinar.start_time)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time" size={18} color={PRIMARY_COLOR} />
            <Text style={styles.metaText}>{formatTime(webinar.start_time)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="hourglass" size={18} color={PRIMARY_COLOR} />
            <Text style={styles.metaText}>{webinar.duration} min</Text>
          </View>
        </View>

        {isPaid ? (
          <>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => registrationLink && openLink(registrationLink)}
            >
              <Ionicons name="ticket" size={20} color="#fff" style={styles.buttonIcon} />
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
              <Ionicons name="videocam" size={20} color="#fff" style={styles.buttonIcon} />
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
    backgroundColor: '#f5f5f5',
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
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  noSessionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noSessionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  noSessionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  webinarCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  paidBadge: {
    backgroundColor: ORANGE_COLOR,
  },
  freeBadge: {
    backgroundColor: GREEN_COLOR,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
    backgroundColor: '#ff0000',
    marginRight: 8,
  },
  liveText: {
    color: '#ff0000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  webinarTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  webinarMeta: {
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 10,
  },
  registerButton: {
    backgroundColor: PRIMARY_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
  },
  joinButtonLive: {
    backgroundColor: GREEN_COLOR,
  },
  joinButtonNormal: {
    backgroundColor: PRIMARY_COLOR,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
