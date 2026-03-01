import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
  Linking,
  ImageBackground,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import theme from '@/constants/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.7;

interface Webinar {
  id: string;
  topic: string;
  start_time: string;
  duration: number;
  join_url: string;
  status: string;
  agenda?: string;
  imageUrl?: string | null;
}

interface HelloAssoEvent {
  id: string;
  title: string;
  startDate: string;
  banner: string | null;
  logo: string | null;
}

export default function ZoomScreen() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const liveDotAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Live dot pulse
    Animated.loop(
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
    ).start();

    // Button pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Match Zoom webinars with HelloAsso events by date
  const matchWebinarsWithImages = (zoomWebinars: Webinar[], helloAssoEvents: HelloAssoEvent[]): Webinar[] => {
    return zoomWebinars.map(webinar => {
      const webinarDate = new Date(webinar.start_time);
      
      // Find matching HelloAsso event by date (same day)
      const matchingEvent = helloAssoEvents.find(event => {
        const eventDate = new Date(event.startDate);
        return (
          webinarDate.getFullYear() === eventDate.getFullYear() &&
          webinarDate.getMonth() === eventDate.getMonth() &&
          webinarDate.getDate() === eventDate.getDate()
        );
      });
      
      return {
        ...webinar,
        imageUrl: matchingEvent?.banner || matchingEvent?.logo || null,
      };
    });
  };

  const fetchWebinars = async () => {
    try {
      setError(null);
      
      // Fetch both Zoom webinars and HelloAsso events
      const [zoomResponse, helloAssoResponse] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/zoom/webinars`),
        axios.get(`${BACKEND_URL}/api/helloasso/events`),
      ]);
      
      const zoomWebinars = zoomResponse.data.webinars || [];
      const helloAssoEvents = helloAssoResponse.data.events || [];
      
      // Match webinars with images
      const webinarsWithImages = matchWebinarsWithImages(zoomWebinars, helloAssoEvents);
      setWebinars(webinarsWithImages);
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

  const formatShortDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
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
      {/* Hero - Prochain Direct */}
      {nextWebinar ? (
        <View style={styles.heroContainer}>
          {nextWebinar.imageUrl ? (
            <View style={styles.heroWithImage}>
              <Image 
                source={{ uri: nextWebinar.imageUrl }} 
                style={styles.heroBackgroundImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.5)', 'rgba(28,103,159,0.85)']}
                style={styles.heroOverlayWrapper}
              >
                {/* Top: Date badge + Live badge */}
                <View style={styles.heroTop}>
                  <View style={styles.heroDateBadge}>
                    <Ionicons name="calendar" size={14} color="#fff" />
                    <Text style={styles.heroDateText}>
                      {formatShortDate(nextWebinar.start_time)} à {formatTime(nextWebinar.start_time)}
                    </Text>
                  </View>
                  
                  {(isLive(nextWebinar) || isSoon(nextWebinar)) && (
                    <View style={[styles.liveBadge, isSoon(nextWebinar) && !isLive(nextWebinar) && styles.soonBadge]}>
                      <Animated.View style={[styles.liveDot, { opacity: liveDotAnim }]} />
                      <Text style={styles.liveBadgeText}>
                        {isLive(nextWebinar) ? 'EN DIRECT' : 'BIENTÔT'}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Bottom: Title + Button */}
                <View style={styles.heroBottom}>
                  <Text style={styles.heroTitle}>{nextWebinar.topic}</Text>
                  
                  <TouchableOpacity 
                    style={styles.heroButton}
                    onPress={() => joinZoom(nextWebinar.join_url)}
                    activeOpacity={0.9}
                  >
                    <Ionicons name="videocam" size={20} color="#fff" />
                    <Text style={styles.heroButtonText}>Rejoindre Zoom</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          ) : (
            <View style={styles.heroGradientOnly}>
              <View style={styles.heroTop}>
                <View style={styles.heroDateBadge}>
                  <Ionicons name="calendar" size={14} color="#fff" />
                  <Text style={styles.heroDateText}>
                    {formatShortDate(nextWebinar.start_time)} à {formatTime(nextWebinar.start_time)}
                  </Text>
                </View>
              </View>

              <View style={styles.heroBottom}>
                <Text style={styles.heroTitle}>{nextWebinar.topic}</Text>
                
                <TouchableOpacity 
                  style={styles.heroButton}
                  onPress={() => joinZoom(nextWebinar.join_url)}
                  activeOpacity={0.9}
                >
                  <Ionicons name="videocam" size={20} color="#fff" />
                  <Text style={styles.heroButtonText}>Rejoindre Zoom</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.emptyHero}>
          <Ionicons name="videocam-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={styles.emptyTitle}>Aucune conférence programmée</Text>
          <Text style={styles.emptySubtitle}>Les prochains événements apparaîtront ici</Text>
        </View>
      )}

      {/* Carousel - Prochains événements */}
      {upcomingWebinars.length > 0 && (
        <View style={styles.carouselSection}>
          <Text style={styles.sectionTitle}>À venir</Text>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + 12}
          >
            {upcomingWebinars.map((webinar, index) => (
              <TouchableOpacity
                key={webinar.id}
                style={[styles.card, index === upcomingWebinars.length - 1 && styles.lastCard]}
                onPress={() => joinZoom(webinar.join_url)}
                activeOpacity={0.95}
              >
                {webinar.imageUrl ? (
                  <View style={styles.cardWithImage}>
                    <Image
                      source={{ uri: webinar.imageUrl }}
                      style={styles.cardBackgroundImage}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
                      style={styles.cardOverlay}
                    >
                      <View style={styles.cardDateBadge}>
                        <Text style={styles.cardDateText}>{formatShortDate(webinar.start_time)}</Text>
                      </View>
                      
                      <View style={styles.cardBottom}>
                        <Text style={styles.cardTitle} numberOfLines={2}>{webinar.topic}</Text>
                        
                        <View style={styles.cardMeta}>
                          <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                          <Text style={styles.cardMetaText}>{formatTime(webinar.start_time)}</Text>
                        </View>
                        
                        <View style={styles.cardAction}>
                          <Ionicons name="play-circle" size={16} color="#fff" />
                          <Text style={styles.cardActionText}>Rejoindre</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </View>
                ) : (
                  <LinearGradient
                    colors={['#1a5276', '#2471a3']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardGradient}
                  >
                    <View style={styles.cardDateBadge}>
                      <Text style={styles.cardDateText}>{formatShortDate(webinar.start_time)}</Text>
                    </View>
                    
                    <View style={styles.cardIcon}>
                      <Ionicons name="videocam" size={24} color="rgba(255,255,255,0.3)" />
                    </View>
                    
                    <View style={styles.cardBottom}>
                      <Text style={styles.cardTitle} numberOfLines={2}>{webinar.topic}</Text>
                      
                      <View style={styles.cardMeta}>
                        <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.cardMetaText}>{formatTime(webinar.start_time)}</Text>
                      </View>
                      
                      <View style={styles.cardAction}>
                        <Ionicons name="play-circle" size={16} color="#fff" />
                        <Text style={styles.cardActionText}>Rejoindre</Text>
                      </View>
                    </View>
                  </LinearGradient>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Section Comment participer - Style À propos */}
      <View style={styles.helpSection}>
        {/* Elegant Header */}
        <View style={styles.helpHeader}>
          <View style={styles.helpHeaderLine} />
          <Text style={styles.helpHeaderTitle}>Comment participer</Text>
          <View style={styles.helpHeaderLine} />
        </View>

        {/* Introduction */}
        <View style={styles.dropCapContainer}>
          <Text style={styles.dropCap}>R</Text>
          <Text style={styles.dropCapText}>
            ejoignez nos conférences en direct depuis chez vous !
          </Text>
        </View>

        <Text style={styles.helpParagraph}>
          Un lien personnalisé vous permettra, à l'heure prévue, de vous connecter à la réunion via Zoom. Même en cas de retard, vous pouvez accéder à la conférence en cours.
        </Text>

        {/* Section Divider */}
        <View style={styles.sectionDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerSymbol}>✦</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Se connecter */}
        <Text style={styles.helpSectionTitle}>Se connecter</Text>
        
        <View style={styles.stepBlock}>
          <Text style={styles.stepNumber}>I</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Choisissez votre appareil</Text>
            <Text style={styles.stepText}>
              Participez depuis l'application Zoom, une tablette ou votre téléphone, connecté à internet.
            </Text>
          </View>
        </View>

        <View style={styles.stepBlock}>
          <Text style={styles.stepNumber}>II</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Identifiez-vous</Text>
            <Text style={styles.stepText}>
              Entrez les informations demandées (prénom, ville) puis cliquez sur « Connexion ».
            </Text>
          </View>
        </View>

        <View style={styles.stepBlock}>
          <Text style={styles.stepNumber}>III</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Profitez du direct</Text>
            <Text style={styles.stepText}>
              Visualisez en temps réel la retransmission vidéo de la conférence.
            </Text>
          </View>
        </View>

        {/* Section Divider */}
        <View style={styles.sectionDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerSymbol}>✦</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Poser des questions */}
        <Text style={styles.helpSectionTitle}>Poser vos questions</Text>
        
        <Text style={styles.helpParagraph}>
          En bas à droite de votre écran, cliquez sur <Text style={styles.bold}>« Q&R »</Text> ou <Text style={styles.bold}>« Q&A »</Text>, puis tapez votre message dans la boîte de dialogue.
        </Text>
        
        <Text style={styles.helpParagraph}>
          Les questions sont vues en temps réel par le modérateur et traitées lors de la session de questions/réponses à la fin de l'intervention.
        </Text>

        <View style={styles.noteBox}>
          <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
          <Text style={styles.noteText}>
            Note : Les participants ne peuvent pas intervenir oralement durant la conférence.
          </Text>
        </View>

        {/* Section Divider */}
        <View style={styles.sectionDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerSymbol}>✦</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Conseils pratiques */}
        <Text style={styles.helpSectionTitle}>Conseils pratiques</Text>

        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Connectez-vous quelques minutes avant le début</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Téléchargez l'application gratuite « ZOOM Cloud Meetings »</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Utilisez un casque pour une meilleure qualité sonore</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Fermez les applications gourmandes en bande passante</Text>
          </View>
        </View>

        {/* Closing */}
        <View style={styles.closingSection}>
          <View style={styles.closingDivider} />
          <Text style={styles.welcomeText}>Au plaisir de vous retrouver en direct !</Text>
          <Text style={styles.signature}>Conscience Soufie</Text>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  errorText: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: theme.fonts.bodySemiBold,
  },

  // Hero Section - Netflix style with image
  heroContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroWithImage: {
    width: '100%',
    aspectRatio: 0.7,
    position: 'relative',
  },
  heroBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroImageStyle: {
    borderRadius: 16,
  },
  heroOverlayWrapper: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    justifyContent: 'space-between',
  },
  heroGradientOnly: {
    backgroundColor: theme.colors.primary,
    padding: 20,
    aspectRatio: 0.8,
    justifyContent: 'space-between',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
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
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28,103,159,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  heroDateText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: theme.fonts.bodySemiBold,
  },
  heroBottom: {
    gap: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.titleBold,
    color: '#fff',
    lineHeight: 26,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  heroButtonText: {
    fontSize: 16,
    fontFamily: theme.fonts.bodySemiBold,
    color: '#fff',
  },

  // Empty state
  emptyHero: {
    alignItems: 'center',
    padding: 40,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },

  // Carousel Section
  carouselSection: {
    marginTop: 32,
    paddingLeft: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  carouselContainer: {
    paddingRight: 16,
  },
  card: {
    width: CARD_WIDTH,
    aspectRatio: 0.75,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  lastCard: {
    marginRight: 0,
  },
  cardWithImage: {
    flex: 1,
    position: 'relative',
  },
  cardBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  cardImageStyle: {
    resizeMode: 'cover',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardDateBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  cardDateText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: theme.fonts.bodySemiBold,
    textTransform: 'capitalize',
  },
  cardIcon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBottom: {
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: theme.fonts.titleBold,
    color: '#fff',
    lineHeight: 20,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardMetaText: {
    fontSize: 13,
    fontFamily: theme.fonts.body,
    color: 'rgba(255,255,255,0.8)',
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardActionText: {
    fontSize: 14,
    fontFamily: theme.fonts.bodySemiBold,
    color: '#fff',
  },

  // Help Section - Style À propos
  helpSection: {
    paddingHorizontal: 28,
    paddingTop: 48,
    backgroundColor: '#FAFAFA',
    marginTop: 32,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  helpHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.primary,
  },
  helpHeaderTitle: {
    fontSize: 14,
    fontFamily: theme.fonts.bodyMedium,
    color: theme.colors.primary,
    letterSpacing: 3,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
  },

  // Drop Cap
  dropCapContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dropCap: {
    fontSize: 56,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.primary,
    lineHeight: 56,
    marginRight: 8,
    marginTop: -8,
  },
  dropCapText: {
    flex: 1,
    fontSize: 17,
    fontFamily: theme.fonts.title,
    color: theme.colors.textPrimary,
    lineHeight: 26,
    paddingTop: 8,
  },

  helpParagraph: {
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
    lineHeight: 26,
    marginBottom: 16,
  },
  bold: {
    fontFamily: theme.fonts.bodySemiBold,
  },

  // Section Divider
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(28,103,159,0.2)',
  },
  dividerSymbol: {
    fontSize: 14,
    color: theme.colors.primary,
    paddingHorizontal: 16,
  },

  helpSectionTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.primary,
    marginBottom: 20,
  },

  // Step blocks
  stepBlock: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepNumber: {
    fontSize: 24,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.primary,
    width: 40,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  stepText: {
    fontSize: 15,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },

  // Note box
  noteBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(28,103,159,0.08)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 22,
  },

  // Tips
  tipsList: {
    marginTop: 4,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginTop: 8,
    marginRight: 14,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },

  // Closing
  closingSection: {
    alignItems: 'center',
    marginTop: 32,
    paddingBottom: 20,
  },
  closingDivider: {
    width: 60,
    height: 2,
    backgroundColor: theme.colors.primary,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 18,
    fontFamily: theme.fonts.title,
    fontStyle: 'italic',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  signature: {
    fontSize: 16,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
  },

  bottomSpacer: {
    height: 40,
  },
});
