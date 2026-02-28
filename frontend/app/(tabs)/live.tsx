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
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const liveDotAnim = useRef(new Animated.Value(1)).current;
  const scaleAnims = useRef<{ [key: string]: Animated.Value }>({}).current;

  // Load saved reminders
  useEffect(() => {
    loadReminders();
    requestNotificationPermissions();
  }, []);

  // Pulse animation for live indicator
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
      
      pulse.start();
      dotPulse.start();
      
      return () => {
        pulse.stop();
        dotPulse.stop();
      };
    }
  }, [isLive, pulseAnim, liveDotAnim]);

  const requestNotificationPermissions = async () => {
    if (Platform.OS === 'web') return;
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
    }
  };

  const loadReminders = async () => {
    try {
      const stored = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
      if (stored) {
        setReminders(JSON.parse(stored));
      }
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

  const handleCardPressIn = (eventId: string) => {
    setHoveredCard(eventId);
    Animated.spring(getScaleAnim(eventId), {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handleCardPressOut = (eventId: string) => {
    setHoveredCard(null);
    Animated.spring(getScaleAnim(eventId), {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const fetchData = async () => {
    try {
      setError(null);
      
      // Fetch webinar and events in parallel
      const [webinarResponse, eventsResponse] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/zoom/webinars`).catch(() => ({ data: { webinars: [] } })),
        axios.get(`${BACKEND_URL}/api/helloasso/events`).catch(() => ({ data: { events: [] } })),
      ]);
      
      // Process webinar
      const webinars = webinarResponse.data.webinars || [];
      if (webinars.length > 0) {
        const nextWebinar = webinars[0];
        setWebinar(nextWebinar);
        
        // Check if live
        const now = new Date();
        const startTime = new Date(nextWebinar.start_time);
        const timeDiff = (startTime.getTime() - now.getTime()) / (1000 * 60);
        const endTime = new Date(startTime.getTime() + nextWebinar.duration * 60000);
        
        setIsLive(timeDiff <= 30 && now <= endTime);
      } else {
        setWebinar(null);
        setIsLive(false);
      }
      
      // Process events
      if (eventsResponse.data.events) {
        setEvents(eventsResponse.data.events);
      }
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Impossible de charger le contenu. Vérifiez votre connexion.');
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

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const day = date.getDate();
      const month = date.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase();
      return { day, month };
    } catch {
      return { day: '', month: '' };
    }
  };

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
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const joinZoomMeeting = async (joinUrl: string) => {
    // Extract meeting number from URL
    const meetingMatch = joinUrl.match(/\/j\/(\d+)/);
    const meetingNumber = meetingMatch ? meetingMatch[1] : null;
    
    if (meetingNumber) {
      // Try to open in Zoom app first
      const zoomDeepLink = `zoomus://zoom.us/join?confno=${meetingNumber}`;
      
      try {
        const canOpen = await Linking.canOpenURL(zoomDeepLink);
        if (canOpen) {
          await Linking.openURL(zoomDeepLink);
          return;
        }
      } catch (e) {
        console.log('Cannot open Zoom app, falling back to browser');
      }
    }
    
    // Fallback to web browser
    await WebBrowser.openBrowserAsync(joinUrl);
  };

  const scheduleReminder = async (event: HelloAssoEvent | Webinar, isWebinar: boolean = false) => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Rappels non disponibles',
        'Les notifications ne sont pas disponibles sur le web. Utilisez l\'application mobile pour activer les rappels.'
      );
      return;
    }

    const eventId = isWebinar ? `webinar_${(event as Webinar).id}` : `event_${(event as HelloAssoEvent).id}`;
    const eventTitle = isWebinar ? (event as Webinar).topic : (event as HelloAssoEvent).title;
    const startDateStr = isWebinar ? (event as Webinar).start_time : (event as HelloAssoEvent).startDate;
    const startDate = new Date(startDateStr);
    const now = new Date();

    // Check if reminder already set
    if (reminders[eventId]) {
      // Cancel existing reminders
      for (const notifId of reminders[eventId].notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(notifId);
      }
      
      const newReminders = { ...reminders };
      delete newReminders[eventId];
      await saveReminders(newReminders);
      
      Alert.alert('Rappel annulé', `Le rappel pour "${eventTitle}" a été annulé.`);
      return;
    }

    // Schedule reminders at 24h, 2h, and 10min before
    const reminderTimes = [
      { label: '24 heures', ms: 24 * 60 * 60 * 1000 },
      { label: '2 heures', ms: 2 * 60 * 60 * 1000 },
      { label: '10 minutes', ms: 10 * 60 * 1000 },
    ];

    const notificationIds: string[] = [];

    for (const reminder of reminderTimes) {
      const triggerDate = new Date(startDate.getTime() - reminder.ms);
      
      // Only schedule if trigger date is in the future
      if (triggerDate > now) {
        try {
          const notifId = await Notifications.scheduleNotificationAsync({
            content: {
              title: `${isWebinar ? 'Conférence' : 'Événement'} dans ${reminder.label}`,
              body: eventTitle,
              sound: true,
              data: { eventId, isWebinar },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: triggerDate,
            },
          });
          notificationIds.push(notifId);
        } catch (error) {
          console.error('Error scheduling notification:', error);
        }
      }
    }

    if (notificationIds.length > 0) {
      const newReminders = {
        ...reminders,
        [eventId]: { notificationIds, eventTitle },
      };
      await saveReminders(newReminders);
      
      Alert.alert(
        'Rappel activé',
        `Vous serez notifié 24h, 2h et 10min avant "${eventTitle}".`
      );
    } else {
      Alert.alert(
        'Impossible de programmer le rappel',
        'L\'événement est trop proche ou déjà passé.'
      );
    }
  };

  const openEventDetail = (event: HelloAssoEvent) => {
    // Navigate to event detail page
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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
      }
    >
      {/* Hero Section - En Direct */}
      <View style={styles.heroSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            {isLive ? (
              <Animated.View style={[styles.liveDotContainer, { opacity: liveDotAnim }]}>
                <View style={styles.liveDotOuter}>
                  <View style={styles.liveDotInner} />
                </View>
              </Animated.View>
            ) : (
              <View style={styles.offlineDot} />
            )}
            <Text style={styles.sectionTitle}>En direct</Text>
          </View>
          <View style={styles.goldAccent} />
        </View>

        {webinar ? (
          <Animated.View style={[styles.liveCard, isLive && { transform: [{ scale: pulseAnim }] }]}>
            {/* Live Badge */}
            {isLive && (
              <View style={styles.liveBadge}>
                <View style={styles.liveBadgeDot} />
                <Text style={styles.liveBadgeText}>EN DIRECT</Text>
              </View>
            )}

            <Text style={styles.webinarTitle}>{webinar.topic}</Text>
            
            <View style={styles.webinarMeta}>
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.metaText}>{formatFullDate(webinar.start_time)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.metaText}>{formatTime(webinar.start_time)} • {webinar.duration} min</Text>
              </View>
            </View>

            <View style={styles.liveActions}>
              <TouchableOpacity
                style={[styles.joinButton, isLive && styles.joinButtonLive]}
                onPress={() => joinZoomMeeting(webinar.join_url)}
              >
                <Ionicons name="logo-youtube" size={20} color="#fff" />
                <Text style={styles.joinButtonText}>Ouvrir Zoom</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.reminderButton,
                  isReminderSet(webinar.id, true) && styles.reminderButtonActive
                ]}
                onPress={() => scheduleReminder(webinar, true)}
              >
                <Ionicons 
                  name={isReminderSet(webinar.id, true) ? "notifications" : "notifications-outline"} 
                  size={20} 
                  color={isReminderSet(webinar.id, true) ? "#fff" : theme.colors.primary} 
                />
              </TouchableOpacity>
            </View>
          </Animated.View>
        ) : (
          <View style={styles.noLiveCard}>
            <View style={styles.offlineDotLarge} />
            <Text style={styles.noLiveText}>Aucune conférence programmée</Text>
            <Text style={styles.noLiveSubtext}>Les prochaines conférences apparaîtront ici</Text>
          </View>
        )}
      </View>

      {/* Prochains Événements Section */}
      <View style={styles.eventsSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="calendar" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Prochains événements</Text>
          </View>
          <View style={styles.goldAccent} />
        </View>

        {events.length === 0 ? (
          <View style={styles.emptyEventsCard}>
            <Ionicons name="calendar-outline" size={40} color={theme.colors.textSecondary} />
            <Text style={styles.emptyEventsText}>Aucun événement à venir</Text>
          </View>
        ) : (
          events.map((event) => {
            const dateInfo = formatDate(event.startDate);
            const eventId = event.id;
            const isHovered = hoveredCard === eventId;
            
            return (
              <Animated.View
                key={eventId}
                style={[
                  styles.eventCard,
                  { transform: [{ scale: getScaleAnim(eventId) }] },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={1}
                  onPressIn={() => handleCardPressIn(eventId)}
                  onPressOut={() => handleCardPressOut(eventId)}
                  onPress={() => openEventDetail(event)}
                  style={styles.eventCardInner}
                >
                  {/* Event Image - Using logo (more complete poster) instead of banner */}
                  <View style={styles.eventImageContainer}>
                    {(event.logo || event.banner) ? (
                      <Image
                        source={{ uri: event.logo || event.banner }}
                        style={styles.eventImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.eventImage, styles.placeholderImage]}>
                        <Ionicons name="image-outline" size={28} color={theme.colors.primary} />
                      </View>
                    )}
                    
                    {/* Date Badge */}
                    <View style={styles.dateBadge}>
                      <Text style={styles.dateDay}>{dateInfo.day}</Text>
                      <Text style={styles.dateMonth}>{dateInfo.month}</Text>
                    </View>
                  </View>

                  {/* Event Content */}
                  <View style={styles.eventContent}>
                    <Text 
                      style={[
                        styles.eventTitle,
                        isHovered && styles.eventTitleHovered
                      ]} 
                      numberOfLines={2}
                    >
                      {event.title}
                    </Text>

                    <View style={styles.eventMeta}>
                      <View style={styles.metaRow}>
                        <Ionicons name="time-outline" size={13} color={theme.colors.textSecondary} />
                        <Text style={styles.eventMetaText} numberOfLines={1}>
                          {formatFullDate(event.startDate)}
                        </Text>
                      </View>
                      
                      {event.place?.city && (
                        <View style={styles.metaRow}>
                          <Ionicons name="location-outline" size={13} color={theme.colors.textSecondary} />
                          <Text style={styles.eventMetaText} numberOfLines={1}>{event.place.city}</Text>
                        </View>
                      )}
                    </View>

                    {/* Actions */}
                    <View style={styles.eventActions}>
                      <TouchableOpacity
                        style={styles.eventDetailButton}
                        onPress={() => openEventDetail(event)}
                      >
                        <Text style={styles.eventDetailText}>Voir l'événement</Text>
                        <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.eventReminderButton,
                          isReminderSet(event.id) && styles.eventReminderButtonActive
                        ]}
                        onPress={() => scheduleReminder(event)}
                      >
                        <Ionicons 
                          name={isReminderSet(event.id) ? "notifications" : "notifications-outline"} 
                          size={18} 
                          color={isReminderSet(event.id) ? "#fff" : theme.colors.primary} 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })
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
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
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
    backgroundColor: '#ffffff',
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

  // Hero Section
  heroSection: {
    padding: 16,
    paddingTop: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
  },
  goldAccent: {
    width: 50,
    height: 3,
    backgroundColor: theme.colors.gold,
    borderRadius: 2,
    marginLeft: 34,
  },

  // Live Dot
  liveDotContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveDotOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(40, 167, 69, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveDotInner: {
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
    marginRight: 6,
  },
  offlineDotLarge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(122, 146, 168, 0.3)',
    marginBottom: 12,
  },

  // Live Card
  liveCard: {
    backgroundColor: '#ffffff',
    borderRadius: theme.borderRadius.medium,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(28,103,159,0.15)',
    ...theme.shadows.card,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  liveBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  liveBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: theme.fonts.bodySemiBold,
    letterSpacing: 1,
  },
  webinarTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.title,
    color: theme.colors.textPrimary,
    marginBottom: 12,
    lineHeight: 26,
  },
  webinarMeta: {
    marginBottom: 16,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
  },
  liveActions: {
    flexDirection: 'row',
    gap: 12,
  },
  joinButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.button,
    gap: 8,
  },
  joinButtonLive: {
    backgroundColor: theme.colors.success,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: theme.fonts.bodySemiBold,
  },
  reminderButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  reminderButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },

  // No Live Card
  noLiveCard: {
    backgroundColor: 'rgba(28,103,159,0.03)',
    borderRadius: theme.borderRadius.medium,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(28,103,159,0.1)',
  },
  noLiveText: {
    fontSize: 16,
    fontFamily: theme.fonts.bodyMedium,
    color: theme.colors.textSecondary,
  },
  noLiveSubtext: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },

  // Events Section
  eventsSection: {
    padding: 16,
    paddingTop: 8,
  },
  emptyEventsCard: {
    backgroundColor: 'rgba(28,103,159,0.03)',
    borderRadius: theme.borderRadius.medium,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(28,103,159,0.1)',
  },
  emptyEventsText: {
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginTop: 12,
  },

  // Event Card
  eventCard: {
    marginBottom: 16,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: '#ffffff',
    ...theme.shadows.card,
    overflow: 'hidden',
  },
  eventCardInner: {
    flexDirection: 'row',
  },
  eventImageContainer: {
    width: 110,
    height: 130,
    position: 'relative',
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: 'rgba(28,103,159,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    minWidth: 40,
  },
  dateDay: {
    fontSize: 16,
    fontFamily: theme.fonts.titleBold,
    color: '#fff',
    lineHeight: 18,
  },
  dateMonth: {
    fontSize: 9,
    fontFamily: theme.fonts.bodySemiBold,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
  },

  // Event Content
  eventContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  eventTitle: {
    fontSize: 15,
    fontFamily: theme.fonts.title,
    color: theme.colors.textPrimary,
    lineHeight: 20,
    marginBottom: 4,
  },
  eventTitleHovered: {
    color: theme.colors.primary,
  },
  eventMeta: {
    gap: 2,
    marginBottom: 8,
  },
  eventMetaText: {
    fontSize: 11,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    flex: 1,
  },

  // Event Actions
  eventActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventDetailText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontFamily: theme.fonts.bodySemiBold,
  },
  eventReminderButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  eventReminderButtonActive: {
    backgroundColor: theme.colors.gold,
    borderColor: theme.colors.gold,
  },
});
