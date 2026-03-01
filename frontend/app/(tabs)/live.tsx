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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';
import theme from '@/constants/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Webinar {
  id: string;
  topic: string;
  start_time: string;
  duration: number;
  join_url: string;
  status: string;
  agenda?: string;
}

export default function ZoomScreen() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
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

  const fetchWebinars = async () => {
    try {
      setError(null);
      const response = await axios.get(`${BACKEND_URL}/api/zoom/webinars`);
      const webinarList = response.data.webinars || [];
      setWebinars(webinarList);
    } catch (err) {
      console.error('Error fetching webinars:', err);
      setError('Impossible de charger les conférences Zoom.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWebinars();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWebinars();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', { 
        weekday: 'long',
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

  const isLive = (webinar: Webinar) => {
    const now = new Date();
    const startTime = new Date(webinar.start_time);
    const endTime = new Date(startTime.getTime() + webinar.duration * 60000);
    return now >= startTime && now <= endTime;
  };

  const isSoon = (webinar: Webinar) => {
    const now = new Date();
    const startTime = new Date(webinar.start_time);
    const timeDiff = (startTime.getTime() - now.getTime()) / (1000 * 60);
    return timeDiff <= 30 && timeDiff > 0;
  };

  const joinZoom = async (joinUrl: string) => {
    // Try to open in Zoom app first
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
        console.log('Cannot open Zoom app, falling back to browser');
      }
    }
    
    // Fallback to browser
    await WebBrowser.openBrowserAsync(joinUrl);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Chargement des conférences...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="cloud-offline-outline" size={48} color={theme.colors.textSecondary} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchWebinars}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (webinars.length === 0) {
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
          <Text style={styles.emptyTitle}>Aucune conférence programmée</Text>
          <Text style={styles.emptySubtitle}>
            Les prochains événements Zoom apparaîtront ici.
            Revenez bientôt !
          </Text>
        </View>
        
        {/* Help section even when empty */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Comment ça marche ?</Text>
          <HelpContent />
        </View>
      </ScrollView>
    );
  }

  const nextWebinar = webinars[0];
  const upcomingWebinars = webinars.slice(1);

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
        <Text style={styles.sectionTitle}>Prochain événement Zoom</Text>
        
        <View style={styles.heroCard}>
          {/* Live/Soon Badge */}
          {(isLive(nextWebinar) || isSoon(nextWebinar)) && (
            <View style={[styles.liveBadge, isSoon(nextWebinar) && !isLive(nextWebinar) && styles.soonBadge]}>
              <Animated.View style={[styles.liveDot, { opacity: liveDotAnim }]} />
              <Text style={styles.liveBadgeText}>
                {isLive(nextWebinar) ? 'EN DIRECT' : 'DANS MOINS DE 30 MIN'}
              </Text>
            </View>
          )}
          
          <View style={styles.heroIcon}>
            <Ionicons name="videocam" size={40} color={theme.colors.primary} />
          </View>
          
          <Text style={styles.heroTitle}>{nextWebinar.topic}</Text>
          
          <View style={styles.heroMeta}>
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} />
              <Text style={styles.heroMetaText}>{formatDate(nextWebinar.start_time)}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={18} color={theme.colors.textSecondary} />
              <Text style={styles.heroMetaText}>{formatTime(nextWebinar.start_time)}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="hourglass-outline" size={18} color={theme.colors.textSecondary} />
              <Text style={styles.heroMetaText}>{nextWebinar.duration} minutes</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={() => joinZoom(nextWebinar.join_url)}
          >
            <Ionicons name="videocam" size={20} color="#fff" />
            <Text style={styles.joinButtonText}>Rejoindre la conférence Zoom</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Liste - Événements à venir */}
      {upcomingWebinars.length > 0 && (
        <View style={styles.upcomingSection}>
          <Text style={styles.sectionTitle}>À venir</Text>
          
          {upcomingWebinars.map((webinar) => (
            <TouchableOpacity
              key={webinar.id}
              style={styles.eventCard}
              onPress={() => joinZoom(webinar.join_url)}
              activeOpacity={0.9}
            >
              <View style={styles.eventIcon}>
                <Ionicons name="videocam-outline" size={24} color={theme.colors.primary} />
              </View>
              
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle} numberOfLines={2}>
                  {webinar.topic}
                </Text>
                
                <View style={styles.eventMeta}>
                  <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.eventMetaText}>
                    {formatDate(webinar.start_time)} à {formatTime(webinar.start_time)}
                  </Text>
                </View>
                
                <View style={styles.zoomLink}>
                  <Ionicons name="log-in-outline" size={14} color={theme.colors.primary} />
                  <Text style={styles.zoomLinkText}>Rejoindre Zoom</Text>
                </View>
              </View>
              
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Section Comment ça marche */}
      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>Comment ça marche ?</Text>
        <HelpContent />
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// Help content component
function HelpContent() {
  return (
    <>
      <Text style={styles.helpIntro}>
        Un lien personnalisé vous permettra, à l'heure prévue, de vous connecter au site sur lequel est retransmise la réunion (Zoom). En cas de retard, vous pouvez tout de même accéder à la conférence en cours.
      </Text>

      <View style={styles.helpBlock}>
        <Text style={styles.helpSubtitle}>Se connecter</Text>
        <View style={styles.helpItem}>
          <View style={styles.helpBullet} />
          <Text style={styles.helpText}>
            Vous pouvez participer à la réunion depuis l'appli Zoom, une tablette ou votre téléphone, connecté à internet.
          </Text>
        </View>
        <View style={styles.helpItem}>
          <View style={styles.helpBullet} />
          <Text style={styles.helpText}>
            Entrez les informations demandées (prénom, ville) puis cliquez sur « Connexion ».
          </Text>
        </View>
        <View style={styles.helpItem}>
          <View style={styles.helpBullet} />
          <Text style={styles.helpText}>
            Vous visualisez en direct la retransmission de la conférence en vidéo en temps réel.
          </Text>
        </View>
      </View>

      <View style={styles.helpBlock}>
        <Text style={styles.helpSubtitle}>Poser vos questions</Text>
        <View style={styles.helpItem}>
          <View style={styles.helpBullet} />
          <Text style={styles.helpText}>
            En bas à droite de votre écran, cliquez sur « Q&R » ou « Q&A ».
          </Text>
        </View>
        <View style={styles.helpItem}>
          <View style={styles.helpBullet} />
          <Text style={styles.helpText}>
            Tapez un message dans la boîte de dialogue « Question ».
          </Text>
        </View>
        <View style={styles.helpItem}>
          <View style={styles.helpBullet} />
          <Text style={styles.helpText}>
            Les questions seront vues en temps réel par le modérateur et pourront être traitées pendant la session de questions/réponses à la fin de l'intervention.
          </Text>
        </View>
        <View style={styles.helpItem}>
          <View style={styles.helpBullet} />
          <Text style={styles.helpText}>
            Vous ne pouvez pas intervenir oralement.
          </Text>
        </View>
      </View>

      <View style={styles.helpBlock}>
        <Text style={styles.helpSubtitle}>Quelques conseils</Text>
        <View style={styles.helpItem}>
          <View style={styles.helpBullet} />
          <Text style={styles.helpText}>
            N'hésitez pas à vous connecter quelques minutes avant le début de la réunion.
          </Text>
        </View>
        <View style={styles.helpItem}>
          <View style={styles.helpBullet} />
          <Text style={styles.helpText}>
            Pour les utilisateurs de tablettes/smartphones, une application gratuite « ZOOM Cloud Meetings » est disponible.
          </Text>
        </View>
        <View style={styles.helpItem}>
          <View style={styles.helpBullet} />
          <Text style={styles.helpText}>
            Équipez-vous d'un casque pour une meilleure qualité de son.
          </Text>
        </View>
        <View style={styles.helpItem}>
          <View style={styles.helpBullet} />
          <Text style={styles.helpText}>
            Dans la mesure du possible, fermez les applications qui consomment de la bande passante.
          </Text>
        </View>
      </View>
    </>
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
    flexGrow: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    paddingTop: 60,
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

  // Section titles
  sectionTitle: {
    fontSize: 22,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },

  // Hero Section
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(28,103,159,0.15)',
    alignItems: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e53935',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 16,
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
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(28,103,159,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 16,
  },
  heroMeta: {
    gap: 8,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroMetaText: {
    fontSize: 15,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: theme.fonts.bodySemiBold,
  },

  // Upcoming Section
  upcomingSection: {
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(28,103,159,0.1)',
  },
  eventIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(28,103,159,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  eventInfo: {
    flex: 1,
    gap: 4,
  },
  eventTitle: {
    fontSize: 15,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    lineHeight: 20,
    marginBottom: 4,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventMetaText: {
    fontSize: 13,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
  },
  zoomLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  zoomLinkText: {
    fontSize: 14,
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.primary,
  },

  // Help Section
  helpSection: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 20,
  },
  helpTitle: {
    fontSize: 22,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  helpIntro: {
    fontSize: 15,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
    lineHeight: 24,
    marginBottom: 24,
  },
  helpBlock: {
    marginBottom: 24,
  },
  helpSubtitle: {
    fontSize: 17,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.primary,
    marginBottom: 12,
  },
  helpItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  helpBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginTop: 8,
    marginRight: 12,
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },

  bottomSpacer: {
    height: 40,
  },
});
