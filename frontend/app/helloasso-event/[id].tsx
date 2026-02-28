import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '@/constants/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface EventItem {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
}

interface HelloAssoEventDetails {
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
  place: any;
  items: EventItem[];
}

export default function HelloAssoEventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [event, setEvent] = useState<HelloAssoEventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setError(null);
      const response = await axios.get(`${BACKEND_URL}/api/helloasso/event/${id}`);
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setEvent(response.data);
      }
    } catch (err) {
      console.error('Error fetching event:', err);
      setError('Impossible de charger l\'événement.');
    } finally {
      setLoading(false);
    }
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

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.toDateString() === end.toDateString()) {
      return {
        date: formatDate(startDate),
        time: `${formatTime(startDate)} - ${formatTime(endDate)}`
      };
    }
    
    return {
      date: `Du ${start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} au ${end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      time: null
    };
  };

  const openRegistration = async () => {
    if (event?.url) {
      await WebBrowser.openBrowserAsync(event.url);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Ionicons name="alert-circle-outline" size={48} color={theme.colors.textSecondary} />
        <Text style={styles.errorText}>{error || 'Événement non trouvé'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchEvent}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const dateInfo = formatDateRange(event.startDate, event.endDate);
  const hasPrice = event.items && event.items.length > 0 && event.items.some(item => item.price > 0);
  const minPrice = event.items && event.items.length > 0 
    ? Math.min(...event.items.map(item => item.price))
    : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Événement</Text>
        <TouchableOpacity style={styles.headerButton} onPress={openRegistration}>
          <Ionicons name="open-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.goldLine} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {event.banner && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: event.banner }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay} />
          </View>
        )}

        <View style={styles.contentPadding}>
          <Text style={styles.title}>{event.title}</Text>
          
          {/* Date & Time */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="calendar" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{dateInfo.date}</Text>
              </View>
            </View>
            
            {dateInfo.time && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="time" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Horaire</Text>
                  <Text style={styles.infoValue}>{dateInfo.time}</Text>
                </View>
              </View>
            )}

            {hasPrice && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="pricetag" size={20} color={theme.colors.gold} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Tarif</Text>
                  <Text style={styles.infoValuePrice}>
                    {minPrice === 0 ? 'Gratuit' : `À partir de ${minPrice.toFixed(2)} €`}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Description */}
          {event.description && (
            <View style={styles.descriptionCard}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          )}

          {/* Tariffs */}
          {event.items && event.items.length > 0 && (
            <View style={styles.tariffsCard}>
              <Text style={styles.sectionTitle}>Tarifs</Text>
              {event.items.map((item, index) => (
                <View key={item.id || index} style={styles.tariffItem}>
                  <View style={styles.tariffInfo}>
                    <Text style={styles.tariffName}>{item.name}</Text>
                    {item.description && (
                      <Text style={styles.tariffDescription}>{item.description}</Text>
                    )}
                  </View>
                  <Text style={styles.tariffPrice}>
                    {item.price === 0 ? 'Gratuit' : `${item.price.toFixed(2)} €`}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Registration Button */}
          <TouchableOpacity style={styles.registerButton} onPress={openRegistration}>
            <Ionicons name="ticket" size={22} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.registerButtonText}>S'inscrire à l'événement</Text>
          </TouchableOpacity>

          <Text style={styles.helloassoText}>
            Inscription sécurisée via HelloAsso
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  goldLine: {
    height: 2,
    backgroundColor: theme.colors.gold,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontFamily: theme.fonts.bodySemiBold,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  contentPadding: {
    padding: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 220,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.primaryLight,
  },
  title: {
    fontSize: 26,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    marginBottom: 20,
    lineHeight: 34,
  },
  infoCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    padding: 16,
    marginBottom: 16,
    ...theme.shadows.card,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28,103,159,0.08)',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(28,103,159,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.bodyMedium,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
  },
  infoValuePrice: {
    fontSize: 16,
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.gold,
  },
  descriptionCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    padding: 16,
    marginBottom: 16,
    ...theme.shadows.card,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.title,
    color: theme.colors.primary,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
    lineHeight: 24,
  },
  tariffsCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    padding: 16,
    marginBottom: 20,
    ...theme.shadows.card,
  },
  tariffItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28,103,159,0.08)',
  },
  tariffInfo: {
    flex: 1,
    marginRight: 16,
  },
  tariffName: {
    fontSize: 15,
    fontFamily: theme.fonts.bodyMedium,
    color: theme.colors.textPrimary,
  },
  tariffDescription: {
    fontSize: 13,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  tariffPrice: {
    fontSize: 16,
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.gold,
  },
  registerButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: theme.borderRadius.button,
    marginTop: 8,
    ...theme.shadows.card,
  },
  buttonIcon: {
    marginRight: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: theme.fonts.bodySemiBold,
  },
  helloassoText: {
    fontSize: 13,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    padding: 8,
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
});
