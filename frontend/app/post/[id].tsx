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

interface Post {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  link: string;
  date: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>;
    'author'?: Array<{ name: string }>;
  };
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setError(null);
      const response = await axios.get(
        `https://consciencesoufie.com/wp-json/wp/v2/posts/${id}?_embed`
      );
      setPost(response.data);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Impossible de charger l\'article.');
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
    
    return cleaned;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const openExternalLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const tagsStyles = {
    body: {
      color: theme.colors.textPrimary,
      fontSize: 17,
      lineHeight: 28,
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
      marginTop: 20,
      fontFamily: theme.fonts.title,
    },
    h2: {
      fontSize: 21,
      fontWeight: 'bold' as const,
      color: theme.colors.primary,
      marginBottom: 12,
      marginTop: 20,
      fontFamily: theme.fonts.title,
    },
    h3: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: theme.colors.textPrimary,
      marginBottom: 8,
      marginTop: 16,
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
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.gold,
      paddingLeft: 16,
      marginVertical: 16,
      fontStyle: 'italic' as const,
      color: theme.colors.textSecondary,
    },
    ul: {
      marginBottom: 16,
    },
    ol: {
      marginBottom: 16,
    },
    li: {
      marginBottom: 8,
    },
    img: {
      marginVertical: 16,
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

  if (error || !post) {
    return (
      <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Ionicons name="alert-circle-outline" size={48} color={theme.colors.textSecondary} />
        <Text style={styles.errorText}>{error || 'Article non trouvé'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPost}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const authorName = post._embedded?.['author']?.[0]?.name;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Article</Text>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => openExternalLink(post.link)}
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
          <View style={styles.metaHeader}>
            <Text style={styles.date}>{formatDate(post.date)}</Text>
            {authorName && (
              <>
                <View style={styles.metaDot} />
                <Text style={styles.author}>{authorName}</Text>
              </>
            )}
          </View>

          <Text style={styles.title}>{decodeHTML(post.title.rendered)}</Text>

          <View style={styles.divider} />

          <View style={styles.htmlContent}>
            <RenderHtml
              contentWidth={width - 64}
              source={{ html: cleanContent(post.content.rendered) }}
              tagsStyles={tagsStyles}
            />
          </View>

          <TouchableOpacity
            style={styles.externalButton}
            onPress={() => openExternalLink(post.link)}
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
  metaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 13,
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.textSecondary,
    marginHorizontal: 10,
  },
  author: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
  },
  title: {
    fontSize: 28,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    marginBottom: 16,
    lineHeight: 36,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(28,103,159,0.1)',
    marginBottom: 20,
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
