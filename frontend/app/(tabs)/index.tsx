import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '@/contexts/UserContext';
import theme from '@/constants/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
}

export default function AccueilScreen() {
  const [events, setEvents] = useState<HelloAssoEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<HelloAssoEvent | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showWebViewModal, setShowWebViewModal] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState('');
  const [webViewLoading, setWebViewLoading] = useState(true);
  
  // Profile form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  
  const { profile, saveProfile, hasProfile } = useUser();
  const insets = useSafeAreaInsets();

  const fetchEvents = async () => {
    try {
      setError(null);
      const response = await axios.get(`${BACKEND_URL}/api/helloasso/events`);
      if (response.data.events) {
        setEvents(response.data.events);
      } else if (response.data.error) {
        setError(response.data.error);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Impossible de charger le contenu. Vérifiez votre connexion.');
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

  const handleEventPress = (event: HelloAssoEvent) => {
    setSelectedEvent(event);
    if (hasProfile) {
      openCheckout(event);
    } else {
      setShowProfileModal(true);
    }
  };

  const handleProfileSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      return;
    }
    
    try {
      await saveProfile({ firstName, lastName, email });
      setShowProfileModal(false);
      if (selectedEvent) {
        openCheckout(selectedEvent);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const openCheckout = async (event: HelloAssoEvent) => {
    const userProfile = profile || { firstName, lastName, email };
    
    // On web, open in browser directly due to WebView limitations
    if (Platform.OS === 'web') {
      await WebBrowser.openBrowserAsync(event.url);
      return;
    }
    
    // On native, try to create checkout with pre-filled data
    try {
      const response = await axios.post(`${BACKEND_URL}/api/helloasso/checkout`, {
        event_slug: event.id,
        first_name: userProfile.firstName,
        last_name: userProfile.lastName,
        email: userProfile.email,
      });
      
      if (response.data.checkoutUrl) {
        setWebViewUrl(response.data.checkoutUrl);
        setShowWebViewModal(true);
      } else {
        // Fallback to direct URL
        setWebViewUrl(event.url);
        setShowWebViewModal(true);
      }
    } catch (error) {
      // Fallback to direct URL
      setWebViewUrl(event.url);
      setShowWebViewModal(true);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Chargement des événements...</Text>
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

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Événements</Text>
          <View style={styles.goldAccent} />
        </View>
        
        {events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>Aucun événement à venir pour le moment.</Text>
          </View>
        ) : (
          events.map((event) => {
            const dateInfo = formatDate(event.startDate);
            return (
              <TouchableOpacity 
                key={event.id} 
                style={styles.eventCard}
                onPress={() => handleEventPress(event)}
                activeOpacity={0.95}
              >
                {/* Image avec ratio 16:9 */}
                <View style={styles.imageContainer}>
                  {event.banner ? (
                    <Image
                      source={{ uri: event.banner }}
                      style={styles.eventImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.eventImage, styles.placeholderImage]}>
                      <Ionicons name="calendar" size={40} color={theme.colors.primary} />
                    </View>
                  )}
                  <View style={styles.imageOverlay} />
                  
                  {/* Date badge */}
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateDay}>{dateInfo.day}</Text>
                    <Text style={styles.dateMonth}>{dateInfo.month}</Text>
                  </View>
                </View>
                
                {/* Content */}
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                  
                  <View style={styles.eventMeta}>
                    <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.eventTime}>
                      {formatFullDate(event.startDate)} • {formatTime(event.startDate)}
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.registerButton}
                    onPress={() => handleEventPress(event)}
                  >
                    <Ionicons name="ticket-outline" size={18} color="#fff" />
                    <Text style={styles.registerButtonText}>S'inscrire</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Profile Modal */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowProfileModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.profileModal}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowProfileModal(false)}
            >
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={styles.modalIconContainer}>
              <Ionicons name="person" size={32} color="#fff" />
            </View>
            
            <Text style={styles.modalTitle}>Vos coordonnées</Text>
            <Text style={styles.modalSubtitle}>
              Pour faciliter votre inscription aux événements
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Prénom</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Votre prénom"
                placeholderTextColor={theme.colors.textSecondary}
                autoCapitalize="words"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nom</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Votre nom"
                placeholderTextColor={theme.colors.textSecondary}
                autoCapitalize="words"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="votre@email.com"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <TouchableOpacity 
              style={[
                styles.submitButton,
                (!firstName.trim() || !lastName.trim() || !email.trim()) && styles.submitButtonDisabled
              ]}
              onPress={handleProfileSubmit}
              disabled={!firstName.trim() || !lastName.trim() || !email.trim()}
            >
              <Text style={styles.submitButtonText}>Continuer</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* WebView Modal for HelloAsso checkout */}
      <Modal
        visible={showWebViewModal}
        animationType="slide"
        onRequestClose={() => setShowWebViewModal(false)}
      >
        <View style={[styles.webViewContainer, { paddingTop: insets.top }]}>
          <View style={styles.webViewHeader}>
            <TouchableOpacity 
              style={styles.webViewCloseButton}
              onPress={() => {
                setShowWebViewModal(false);
                setWebViewLoading(true);
              }}
            >
              <Ionicons name="close" size={28} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.webViewTitle}>Inscription</Text>
            <View style={styles.webViewCloseButton} />
          </View>
          
          <View style={styles.webViewGoldLine} />
          
          {webViewLoading && (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.webViewLoadingText}>Chargement...</Text>
            </View>
          )}
          
          <WebView
            source={{ uri: webViewUrl }}
            style={styles.webView}
            onLoadEnd={() => setWebViewLoading(false)}
            onLoadStart={() => setWebViewLoading(true)}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={false}
            originWhitelist={['*']}
          />
        </View>
      </Modal>
    </>
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
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  eventCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    marginBottom: 20,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: 'rgba(28,103,159,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28,103,159,0.08)',
  },
  dateBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 50,
  },
  dateDay: {
    fontSize: 22,
    fontFamily: theme.fonts.titleBold,
    color: '#fff',
    lineHeight: 24,
  },
  dateMonth: {
    fontSize: 11,
    fontFamily: theme.fonts.bodySemiBold,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.title,
    color: theme.colors.textPrimary,
    marginBottom: 8,
    lineHeight: 24,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventTime: {
    fontSize: 13,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  registerButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: theme.borderRadius.button,
    gap: 8,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: theme.fonts.bodySemiBold,
  },
  // Profile Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26,42,58,0.6)',
    justifyContent: 'flex-end',
  },
  profileModal: {
    backgroundColor: theme.colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
    zIndex: 1,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: theme.fonts.bodyMedium,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(28,103,159,0.15)',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.button,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(28,103,159,0.4)',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: theme.fonts.bodySemiBold,
  },
  // WebView Modal
  webViewContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  webViewHeader: {
    backgroundColor: theme.colors.cardBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  webViewGoldLine: {
    height: 2,
    backgroundColor: theme.colors.gold,
  },
  webViewCloseButton: {
    padding: 8,
    width: 44,
  },
  webViewTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: theme.fonts.title,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  webViewLoadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
  },
});
