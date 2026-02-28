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
  Platform,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import theme from '@/constants/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const REMINDERS_STORAGE_KEY = '@conscience_soufie_reminders';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface Webinar {
  id: string;
  topic: string;
  start_time: string;
  duration: number;
  join_url: string;
  status: string;
}

interface HelloAssoEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  banner: string | null;
  logo: string | null;
  url: string;
  widgetUrl: string | null;
  state: string;
  place?: {
    name?: string;
    address?: string;
    city?: string;
  };
}

interface ReminderState {
  [eventId: string]: {
    notificationIds: string[];
    eventTitle: string;
  };
}

export default function EvenementsScreen() {
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [events, setEvents] = useState<HelloAssoEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [reminders, setReminders] = useState<ReminderState>({});
  
  const router = useRouter();
  const liveDotAnim = useRef(new Animated.Value(1)).current;
  const scaleAnims = useRef<{ [key: string]: Animated.Value }>({}).current;

  useEffect(() => {
    loadReminders();
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    if (isLive) {
      const dotPulse = Animated.loop(
        Animated.sequence([
          Animated.timing(liveDotAnim, {
            toValue: 0.4,
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
    }
  }, [isLive, liveDotAnim]);

  const requestNotificationPermissions = async () => {
    if (Platform.OS === 'web') return;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus !== 'granted') {
      await Notifications.requestPermissionsAsync();
    }
  };

  const loadReminders = async () => {
    try {
      const stored = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
      if (stored) setReminders(JSON.parse(stored));
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const saveReminders = async (newReminders: ReminderState) => {
    try {
      await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(newReminders));
      setReminders(newReminders);
    } catch (error) {
      console.error('Error saving reminders:', error);
    }
  };

  const getScaleAnim = (eventId: string) => {
    if (!scaleAnims[eventId]) {
      scaleAnims[eventId] = new Animated.Value(1);
    }
    return scaleAnims[eventId];
  };

  const handlePressIn = (eventId: string) => {
    Animated.spring(getScaleAnim(eventId), {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (eventId: string) => {
    Animated.spring(getScaleAnim(eventId), {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const fetchData = async () => {
    try {
      setError(null);
      const [webinarResponse, eventsResponse] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/zoom/webinars`).catch(() => ({ data: { webinars: [] } })),
        axios.get(`${BACKEND_URL}/api/helloasso/events`).catch(() => ({ data: { events: [] } })),
      ]);
      
      const webinars = webinarResponse.data.webinars || [];
      if (webinars.length > 0) {
        const nextWebinar = webinars[0];
        setWebinar(nextWebinar);
        const now = new Date();
        const startTime = new Date(nextWebinar.start_time);
        const timeDiff = (startTime.getTime() - now.getTime()) / (1000 * 60);
        const endTime = new Date(startTime.getTime() + nextWebinar.duration * 60000);
        setIsLive(timeDiff <= 30 && now <= endTime);
      } else {
        setWebinar(null);
        setIsLive(false);
      }
      
      if (eventsResponse.data.events) {
        setEvents(eventsResponse.data.events);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Impossible de charger le contenu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const formatFullDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const joinZoomMeeting = async (joinUrl: string) => {
    const meetingMatch = joinUrl.match(/\/j\/(\d+)/);
    const meetingNumber = meetingMatch ? meetingMatch[1] : null;
    
    if (meetingNumber) {
      const zoomDeepLink = `zoomus://zoom.us/join?confno=${meetingNumber}`;
      try {
        const canOpen = await Linking.canOpenURL(zoomDeepLink);
        if (canOpen) {
          await Linking.openURL(zoomDeepLink);
          return;
        }
      } catch (e) {
        console.log('Cannot open Zoom app');
      }
    }
    await WebBrowser.openBrowserAsync(joinUrl);
  };

  const scheduleReminder = async (event: HelloAssoEvent | Webinar, isWebinar: boolean = false) => {
    if (Platform.OS === 'web') {
      Alert.alert('Rappels', 'Les notifications ne sont disponibles que sur mobile.');
      return;
    }

    const eventId = isWebinar ? `webinar_${(event as Webinar).id}` : `event_${(event as HelloAssoEvent).id}`;
    const eventTitle = isWebinar ? (event as Webinar).topic : (event as HelloAssoEvent).title;
    const startDateStr = isWebinar ? (event as Webinar).start_time : (event as HelloAssoEvent).startDate;
    const startDate = new Date(startDateStr);
    const now = new Date();

    if (reminders[eventId]) {
      for (const notifId of reminders[eventId].notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(notifId);
      }
      const newReminders = { ...reminders };
      delete newReminders[eventId];
      await saveReminders(newReminders);
      Alert.alert('Rappel annulé', `Rappel pour "${eventTitle}" annulé.`);
      return;
    }

    const reminderTimes = [
      { label: '24 heures', ms: 24 * 60 * 60 * 1000 },
      { label: '2 heures', ms: 2 * 60 * 60 * 1000 },
      { label: '10 minutes', ms: 10 * 60 * 1000 },
    ];

    const notificationIds: string[] = [];
    for (const reminder of reminderTimes) {
      const triggerDate = new Date(startDate.getTime() - reminder.ms);
      if (triggerDate > now) {
        try {
          const notifId = await Notifications.scheduleNotificationAsync({
            content: {
              title: `Événement dans ${reminder.label}`,
              body: eventTitle,
              sound: true,
            },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
          });
          notificationIds.push(notifId);
        } catch (error) {
          console.error('Error scheduling notification:', error);
        }
      }
    }

    if (notificationIds.length > 0) {
      await saveReminders({ ...reminders, [eventId]: { notificationIds, eventTitle } });
      Alert.alert('Rappel activé', `Vous serez notifié avant "${eventTitle}".`);
    }
  };

  const openEventDetail = (event: HelloAssoEvent) => {
    router.push({
      pathname: '/event-detail/[id]',
      params: { 
        id: event.id,
        title: event.title,
        description: event.description || '',
        startDate: event.startDate,
        endDate: event.endDate || '',
        url: event.url,
        place: event.place ? JSON.stringify(event.place) : '',
      }
    });
  };

  const isReminderSet = (eventId: string, isWebinar: boolean = false) => {
    const key = isWebinar ? `webinar_${eventId}` : `event_${eventId}`;
    return !!reminders[key];
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
      }
    >
      {/* Section En Direct */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          {isLive ? (
            <Animated.View style={[styles.liveDot, { opacity: liveDotAnim }]} />
          ) : (
            <View style={styles.offlineDot} />
          )}
          <Text style={styles.sectionTitle}>En direct</Text>
        </View>

        {webinar ? (
          <View style={styles.liveCard}>
            <Text style={styles.liveTitle} numberOfLines={2}>{webinar.topic}</Text>
            <Text style={styles.liveMeta}>
              {formatFullDate(webinar.start_time)} • {formatTime(webinar.start_time)}
            </Text>
            
            <View style={styles.liveActions}>
              <TouchableOpacity onPress={() => joinZoomMeeting(webinar.join_url)}>
                <Text style={styles.linkText}>Ouvrir Zoom →</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.reminderIcon, isReminderSet(webinar.id, true) && styles.reminderIconActive]}
                onPress={() => scheduleReminder(webinar, true)}
              >
                <Ionicons 
                  name={isReminderSet(webinar.id, true) ? "notifications" : "notifications-outline"} 
                  size={20} 
                  color={isReminderSet(webinar.id, true) ? "#fff" : theme.colors.primary} 
                />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.noLiveCard}>
            <Text style={styles.noLiveText}>Aucune conférence programmée</Text>
          </View>
        )}
      </View>

      {/* Section Prochains Événements - Style Netflix/Airbnb */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar" size={20} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Prochains événements</Text>
        </View>

        {events.length === 0 ? (
          <View style={styles.noLiveCard}>
            <Text style={styles.noLiveText}>Aucun événement à venir</Text>
          </View>
        ) : (
          <View style={styles.eventsGrid}>
            {events.map((event) => (
              <Animated.View
                key={event.id}
                style={[
                  styles.posterCard,
                  { transform: [{ scale: getScaleAnim(event.id) }] }
                ]}
              >
                <TouchableOpacity
                  activeOpacity={1}
                  onPressIn={() => handlePressIn(event.id)}
                  onPressOut={() => handlePressOut(event.id)}
                  onPress={() => openEventDetail(event)}
                  style={styles.posterTouchable}
                >
                  {(event.logo || event.banner) ? (
                    <Image
                      source={{ uri: event.logo || event.banner }}
                      style={styles.posterImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.posterImage, styles.posterPlaceholder]}>
                      <Ionicons name="image-outline" size={48} color={theme.colors.primary} />
                      <Text style={styles.placeholderText}>{event.title}</Text>
                    </View>
                  )}
                  
                  {/* Overlay gradient for Netflix effect */}
                  <View style={styles.posterOverlay} />
                  
                  {/* Reminder button */}
                  <TouchableOpacity
                    style={[
                      styles.posterReminder,
                      isReminderSet(event.id) && styles.posterReminderActive
                    ]}
                    onPress={(e) => {
                      e.stopPropagation();
                      scheduleReminder(event);
                    }}
                  >
                    <Ionicons 
                      name={isReminderSet(event.id) ? "notifications" : "notifications-outline"} 
                      size={18} 
                      color={isReminderSet(event.id) ? "#fff" : theme.colors.primary} 
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    paddingBottom: 40,
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
    fontFamily: theme.fonts.title,
  },

  // Sections
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
  },

  // Live Dot
  liveDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.success,
  },
  offlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.textSecondary,
  },

  // Live Card
  liveCard: {
    backgroundColor: '#ffffff',
    borderRadius: theme.borderRadius.medium,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(28,103,159,0.12)',
  },
  liveTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.title,
    color: theme.colors.textPrimary,
    marginBottom: 8,
    lineHeight: 24,
  },
  liveMeta: {
    fontSize: 13,
    fontFamily: theme.fonts.title,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  liveActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkText: {
    fontSize: 14,
    fontFamily: theme.fonts.title,
    color: theme.colors.primary,
  },
  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  reminderIconActive: {
    backgroundColor: theme.colors.gold,
    borderColor: theme.colors.gold,
  },

  // No Live
  noLiveCard: {
    backgroundColor: 'rgba(28,103,159,0.04)',
    borderRadius: theme.borderRadius.medium,
    padding: 24,
    alignItems: 'center',
  },
  noLiveText: {
    fontSize: 14,
    fontFamily: theme.fonts.title,
    color: theme.colors.textSecondary,
  },

  // Events Grid - Netflix/Airbnb Style
  eventsGrid: {
    gap: 20,
  },
  posterCard: {
    width: CARD_WIDTH,
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
    backgroundColor: '#fff',
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  posterTouchable: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  posterPlaceholder: {
    backgroundColor: 'rgba(28,103,159,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: theme.fonts.title,
    color: theme.colors.primary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  posterOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
  },
  posterReminder: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  posterReminderActive: {
    backgroundColor: theme.colors.gold,
  },
});
