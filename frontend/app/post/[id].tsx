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

const PRIMARY_COLOR = '#1c679f';

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
    // Remove Divi/Elementor shortcodes and clean up
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
      color: '#333',
      fontSize: 17,
      lineHeight: 28,
    },
    p: {
      marginBottom: 16,
    },
    h1: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: PRIMARY_COLOR,
      marginBottom: 16,
      marginTop: 20,
    },
    h2: {
      fontSize: 21,
      fontWeight: 'bold' as const,
      color: PRIMARY_COLOR,
      marginBottom: 12,
      marginTop: 20,
    },
    h3: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: '#333',
      marginBottom: 8,
      marginTop: 16,
    },
    a: {
      color: PRIMARY_COLOR,
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
      borderLeftColor: PRIMARY_COLOR,
      paddingLeft: 16,
      marginVertical: 16,
      fontStyle: 'italic' as const,
      color: '#555',
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
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={PRIMARY_COLOR} />
        </TouchableOpacity>
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

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        <View style={styles.contentPadding}>
          <View style={styles.metaHeader}>
            <Text style={styles.date}>{formatDate(post.date)}</Text>
            {authorName && (
              <Text style={styles.author}>par {authorName}</Text>
            )}
          </View>

          <Text style={styles.title}>{decodeHTML(post.title.rendered)}</Text>

          <View style={styles.divider} />

          <RenderHtml
            contentWidth={width - 32}
            source={{ html: cleanContent(post.content.rendered) }}
            tagsStyles={tagsStyles}
          />

          <TouchableOpacity
            style={styles.externalButton}
            onPress={() => openExternalLink(post.link)}
          >
            <Ionicons name="globe" size={20} color="#fff" style={styles.buttonIcon} />
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
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: PRIMARY_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
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
  image: {
    width: '100%',
    height: 220,
  },
  metaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
    color: PRIMARY_COLOR,
    fontWeight: '500',
  },
  author: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    lineHeight: 34,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 20,
  },
  externalButton: {
    backgroundColor: PRIMARY_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonIcon: {
    marginRight: 8,
  },
  externalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
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
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
