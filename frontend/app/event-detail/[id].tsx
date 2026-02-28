import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import theme from '@/constants/theme';

export default function EventDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const {
    id,
    title,
    description,
    startDate,
    endDate,
    url,
    place: placeString,
  } = params;
  
  // Parse place if it exists
  let place = null;
  if (placeString && typeof placeString === 'string') {
    try {
      place = JSON.parse(placeString);
    } catch (e) {
      console.log('Error parsing place:', e);
    }
  }

  const formatFullDate = (dateStr: string) => {
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

  const openHelloAsso = async () => {
    if (url && typeof url === 'string') {
      await WebBrowser.openBrowserAsync(url);
    }
  };

  // Clean HTML from description
  const cleanDescription = (html: string) => {
    if (!html) return '';
    // Remove HTML tags
    let text = html.replace(/<[^>]*>/g, '');
    // Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    // Clean up extra whitespace
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  };

  const cleanedDescription = cleanDescription(description as string);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Événement</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <View style={styles.goldLine} />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>{title}</Text>
        
        {/* Date & Time */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>
                {formatFullDate(startDate as string)}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="time" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Heure</Text>
              <Text style={styles.infoValue}>
                {formatTime(startDate as string)}
                {endDate && ` - ${formatTime(endDate as string)}`}
              </Text>
            </View>
          </View>
          
          {place && (place.name || place.city) && (
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="location" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Lieu</Text>
                <Text style={styles.infoValue}>
                  {place.name && `${place.name}`}
                  {place.name && place.city && '\n'}
                  {place.address && `${place.address}, `}
                  {place.city}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Description */}
        {cleanedDescription ? (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <View style={styles.goldAccent} />
            <Text style={styles.description}>{cleanedDescription}</Text>
          </View>
        ) : (
          <View style={styles.noDescriptionSection}>
            <Ionicons name="document-text-outline" size={32} color={theme.colors.textSecondary} />
            <Text style={styles.noDescriptionText}>
              Aucune description disponible
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity 
          style={styles.registerButton}
          onPress={openHelloAsso}
        >
          <Ionicons name="ticket" size={20} color="#fff" />
          <Text style={styles.registerButtonText}>S'inscrire sur HelloAsso</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  backButton: {
    padding: 8,
    width: 44,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: theme.fonts.title,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  goldLine: {
    height: 2,
    backgroundColor: theme.colors.gold,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 26,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    lineHeight: 34,
    marginBottom: 24,
  },
  infoSection: {
    backgroundColor: 'rgba(28,103,159,0.04)',
    borderRadius: theme.borderRadius.medium,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(28,103,159,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
    lineHeight: 22,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  goldAccent: {
    width: 40,
    height: 3,
    backgroundColor: theme.colors.gold,
    borderRadius: 2,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
    lineHeight: 26,
  },
  noDescriptionSection: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'rgba(28,103,159,0.03)',
    borderRadius: theme.borderRadius.medium,
  },
  noDescriptionText: {
    marginTop: 12,
    fontSize: 15,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(28,103,159,0.1)',
  },
  registerButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: theme.borderRadius.button,
    gap: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: theme.fonts.bodySemiBold,
  },
});
