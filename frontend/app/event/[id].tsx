import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';
import RenderHtml from 'react-native-render-html';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '@/constants/theme';

interface Event {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  link: string;
  date: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>;
  };
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setError(null);
      const response = await axios.get(
        `https://consciencesoufie.com/wp-json/wp/v2/mec-events/${id}?_embed`
      );
      setEvent(response.data);
    } catch (err) {
      console.error('Error fetching event:', err);
      setError('Impossible de charger l\'événement.');
    } finally {
      setLoading(false);
    }
  };

  const decodeHTML = (html: string) => {
    return html
      .replace(/&#8217;/g, "'")
      .replace(/&#8216;/g, "'")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/&#8211;/g, '–')
      .replace(/&#8212;/g, '—')
      .replace(/&rsquo;/g, "'")
      .replace(/&lsquo;/g, "'")
      .replace(/&rdquo;/g, '"')
      .replace(/&ldquo;/g, '"')
      .replace(/&hellip;/g, '...');
  };

  const cleanContent = (html: string) => {
    let cleaned = html
      .replace(/\[et_pb_[^\]]*\]/g, '')
      .replace(/\[\/et_pb_[^\]]*\]/g, '')
      .replace(/\[vc_[^\]]*\]/g, '')
      .replace(/\[\/vc_[^\]]*\]/g, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    
    if (cleaned.replace(/<[^>]*>/g, '').trim().length < 50) {
      return '<p>Consultez les détails de cet événement sur notre site web.</p>';
    }
    
    return cleaned;
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

  const openExternalLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const tagsStyles = {
    body: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      lineHeight: 26,
      fontFamily: theme.fonts.body,
    },
    p: {
      marginBottom: 16,
    },
    h1: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: theme.colors.primary,
      marginBottom: 16,
      marginTop: 16,
      fontFamily: theme.fonts.title,
    },
    h2: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      color: theme.colors.primary,
      marginBottom: 12,
      marginTop: 16,
      fontFamily: theme.fonts.title,
    },
    h3: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: theme.colors.textPrimary,
      marginBottom: 8,
      marginTop: 12,
      fontFamily: theme.fonts.title,
    },
    a: {
      color: theme.colors.primary,
      textDecorationLine: 'underline' as const,
    },
    strong: {
      fontWeight: 'bold' as const,
    },
    em: {
      fontStyle: 'italic' as const,
    },
    ul: {
      marginBottom: 16,
    },
    li: {
      marginBottom: 8,
    },
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

  const imageUrl = event._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Événement</Text>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => openExternalLink(event.link)}
        >
          <Ionicons name="open-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {/* Gold accent line */}
      <View style={styles.goldLine} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay} />
          </View>
        )}

        <View style={styles.contentPadding}>
          <Text style={styles.title}>{decodeHTML(event.title.rendered)}</Text>
          
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <View style={styles.metaIconContainer}>
                <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
              </View>
              <Text style={styles.metaText}>{formatDate(event.date)}</Text>
            </View>
            <View style={styles.metaItem}>
              <View style={styles.metaIconContainer}>
                <Ionicons name="time-outline" size={18} color={theme.colors.primary} />
              </View>
              <Text style={styles.metaText}>{formatTime(event.date)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.htmlContent}>
            <RenderHtml
              contentWidth={width - 32}
              source={{ html: cleanContent(event.content.rendered) }}
              tagsStyles={tagsStyles}
            />
          </View>

          <TouchableOpacity
            style={styles.externalButton}
            onPress={() => openExternalLink(event.link)}
          >
            <Ionicons name="globe-outline" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.externalButtonText}>Voir sur le site web</Text>
          </TouchableOpacity>
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
    marginBottom: 16,
    lineHeight: 34,
  },
  metaContainer: {
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(28,103,159,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontSize: 15,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(28,103,159,0.1)',
    marginVertical: 16,
  },
  htmlContent: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    padding: 16,
    ...theme.shadows.card,
  },
  externalButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: theme.borderRadius.button,
    marginTop: 24,
  },
  buttonIcon: {
    marginRight: 10,
  },
  externalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: theme.fonts.bodySemiBold,
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
