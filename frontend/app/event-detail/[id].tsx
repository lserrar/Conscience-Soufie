import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';
import theme from '@/constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function EventDetailScreen() {
  const params = useLocalSearchParams<{
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    banner: string;
    url: string;
    widgetUrl: string;
  }>();
  
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [showWidget, setShowWidget] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

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

  const openWidget = () => {
    setShowWidget(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeWidget = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowWidget(false);
      setLoading(true);
    });
  };

  const dateInfo = params.startDate && params.endDate 
    ? formatDateRange(params.startDate, params.endDate) 
    : { date: '', time: null };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Événement</Text>
        <View style={styles.headerButton} />
      </View>
      
      <View style={styles.goldLine} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Banner Image */}
        {params.banner && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: params.banner }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay} />
          </View>
        )}

        <View style={styles.contentPadding}>
          {/* Title */}
          <Text style={styles.title}>{params.title}</Text>
          
          {/* Date & Time Card */}
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
              <View style={[styles.infoRow, styles.infoRowLast]}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="time" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Horaire</Text>
                  <Text style={styles.infoValue}>{dateInfo.time}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Description */}
          {params.description && (
            <View style={styles.descriptionCard}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{params.description}</Text>
            </View>
          )}

          {/* Register Button */}
          <TouchableOpacity style={styles.registerButton} onPress={openWidget}>
            <Ionicons name="ticket" size={22} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.registerButtonText}>S'inscrire à l'événement</Text>
          </TouchableOpacity>

          <View style={styles.securityBadge}>
            <Ionicons name="shield-checkmark" size={16} color={theme.colors.success} />
            <Text style={styles.securityText}>Paiement sécurisé via HelloAsso</Text>
          </View>
        </View>
      </ScrollView>

      {/* HelloAsso Widget Modal */}
      {showWidget && (
        <Animated.View 
          style={[
            styles.widgetContainer, 
            { 
              transform: [{ translateY: slideAnim }],
              paddingTop: insets.top 
            }
          ]}
        >
          <View style={styles.widgetHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={closeWidget}>
              <Ionicons name="close" size={28} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.widgetTitle}>Inscription</Text>
            <View style={styles.closeButton} />
          </View>
          
          <View style={styles.widgetGoldLine} />
          
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Chargement du formulaire...</Text>
            </View>
          )}
          
          <WebView
            source={{ uri: params.widgetUrl || params.url }}
            style={styles.webview}
            onLoadEnd={() => setLoading(false)}
            onLoadStart={() => setLoading(true)}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={false}
            scalesPageToFit={true}
            allowsInlineMediaPlayback={true}
            mixedContentMode="compatibility"
            originWhitelist={['*']}
            userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
          />
        </Animated.View>
      )}
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
    width: 40,
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontFamily: theme.fonts.bodySemiBold,
    textAlign: 'center',
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
  infoRowLast: {
    borderBottomWidth: 0,
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
  descriptionCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    padding: 16,
    marginBottom: 20,
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
  registerButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: theme.borderRadius.button,
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
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  securityText: {
    fontSize: 13,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  // Widget Modal Styles
  widgetContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.background,
  },
  widgetHeader: {
    backgroundColor: theme.colors.cardBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28,103,159,0.1)',
  },
  widgetGoldLine: {
    height: 2,
    backgroundColor: theme.colors.gold,
  },
  closeButton: {
    padding: 8,
    width: 44,
  },
  widgetTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: theme.fonts.title,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  webview: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
  },
});
