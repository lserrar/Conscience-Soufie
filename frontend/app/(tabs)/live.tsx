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
  const [currentWebinar, setCurrentWebinar] = useState<Webinar | null>(null);
  const [isLive, setIsLive] = useState(false);
  
  const liveDotAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isLive) {
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
    }
  }, [isLive, liveDotAnim]);

  const fetchWebinars = async () => {
    try {
      setError(null);
      const response = await axios.get(`${BACKEND_URL}/api/zoom/webinars`);
      const webinarList = response.data.webinars || [];
      setWebinars(webinarList);
      
      if (webinarList.length > 0) {
        const next = webinarList[0];
        setCurrentWebinar(next);
        
        // Check if live
        const now = new Date();
        const startTime = new Date(next.start_time);
        const timeDiff = (startTime.getTime() - now.getTime()) / (1000 * 60);
        const endTime = new Date(startTime.getTime() + next.duration * 60000);
        setIsLive(timeDiff <= 30 && now <= endTime);
      }
    } catch (err) {
      console.error('Error fetching webinars:', err);
      setError('Impossible de charger les conférences.');
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

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const dateFormatted = date.toLocaleDateString('fr-FR', { 
        weekday: 'long',
        day: 'numeric', 
        month: 'long' 
      });
      const timeFormatted = date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      return `${dateFormatted} à ${timeFormatted}`;
    } catch {
      return '';
    }
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
        <Text style={styles.loadingText}>Chargement...</Text>
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

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
      }
    >
      {/* En Direct Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          {isLive ? (
            <Animated.View style={[styles.liveDot, { opacity: liveDotAnim }]} />
          ) : (
            <View style={styles.offlineDot} />
          )}
          <Text style={styles.sectionTitle}>En direct</Text>
        </View>

        {currentWebinar ? (
          <TouchableOpacity 
            style={styles.liveCard}
            onPress={() => joinZoom(currentWebinar.join_url)}
            activeOpacity={0.9}
          >
            {isLive && (
              <View style={styles.liveBadge}>
                <View style={styles.liveBadgeDot} />
                <Text style={styles.liveBadgeText}>EN DIRECT</Text>
              </View>
            )}
            <Text style={styles.liveTitle}>{currentWebinar.topic}</Text>
            <Text style={styles.liveMeta}>{formatDateTime(currentWebinar.start_time)}</Text>
            <View style={styles.joinRow}>
              <Text style={styles.joinText}>Rejoindre sur Zoom</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.primary} />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="videocam-off-outline" size={40} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>Aucune conférence programmée</Text>
          </View>
        )}
      </View>

      {/* Prochaines Conférences */}
      {webinars.length > 1 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Prochaines conférences</Text>
          </View>

          <View style={styles.webinarGrid}>
            {webinars.slice(1).map((webinar) => (
              <TouchableOpacity
                key={webinar.id}
                style={styles.webinarCard}
                onPress={() => joinZoom(webinar.join_url)}
                activeOpacity={0.9}
              >
                {/* Placeholder poster with topic */}
                <View style={styles.webinarPoster}>
                  <Text style={styles.posterTitle} numberOfLines={3}>{webinar.topic}</Text>
                  <View style={styles.posterDate}>
                    <Ionicons name="calendar-outline" size={14} color="#fff" />
                    <Text style={styles.posterDateText}>
                      {new Date(webinar.start_time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

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

  // Sections
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
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
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.success,
  },
  offlineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
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
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  liveBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: theme.fonts.bodySemiBold,
    letterSpacing: 1,
  },
  liveTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    marginBottom: 8,
    lineHeight: 24,
  },
  liveMeta: {
    fontSize: 13,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  joinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  joinText: {
    fontSize: 15,
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.primary,
  },

  // Empty Card
  emptyCard: {
    backgroundColor: 'rgba(28,103,159,0.04)',
    borderRadius: theme.borderRadius.medium,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginTop: 12,
  },

  // Webinar Grid
  webinarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  webinarCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
  },
  webinarPoster: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: theme.colors.primary,
    padding: 16,
    justifyContent: 'space-between',
  },
  posterTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: theme.fonts.titleBold,
    lineHeight: 22,
  },
  posterDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  posterDateText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: theme.fonts.bodySemiBold,
  },

  bottomSpacer: {
    height: 40,
  },
});
