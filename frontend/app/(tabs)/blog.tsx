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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import theme from '../../constants/theme';

interface Post {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  link: string;
  date: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>;
  };
}

export default function BlogScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchPosts = async () => {
    try {
      setError(null);
      const response = await axios.get(
        'https://consciencesoufie.com/wp-json/wp/v2/posts?per_page=15&_embed'
      );
      setPosts(response.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Impossible de charger le contenu. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, []);

  const openPost = (postId: number) => {
    router.push(`/post/${postId}`);
  };

  const stripHTML = (html: string) => {
    return html
      .replace(/<[^>]*>/g, '')
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
      .replace(/\[&hellip;\]/g, '...')
      .replace(/&hellip;/g, '...')
      .replace(/&rsquo;/g, "'")
      .replace(/&lsquo;/g, "'")
      .trim();
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Chargement des articles...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="cloud-offline-outline" size={48} color={theme.colors.textSecondary} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPosts}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
      }
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Articles récents</Text>
        <View style={styles.goldAccent} />
      </View>
      
      {posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={styles.emptyText}>Aucun article disponible.</Text>
        </View>
      ) : (
        posts.map((post) => (
          <TouchableOpacity 
            key={post.id} 
            style={styles.postCard}
            onPress={() => openPost(post.id)}
            activeOpacity={0.9}
          >
            {post._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: post._embedded['wp:featuredmedia'][0].source_url }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay} />
              </View>
            )}
            <View style={styles.postContent}>
              <Text style={styles.postDate}>{formatDate(post.date)}</Text>
              <Text style={styles.postTitle}>{stripHTML(post.title.rendered)}</Text>
              <Text style={styles.postExcerpt} numberOfLines={3}>
                {stripHTML(post.excerpt.rendered)}
              </Text>
              <View style={styles.readMoreContainer}>
                <Text style={styles.readMoreText}>Lire la suite</Text>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
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
  postCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    marginBottom: 16,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  imageContainer: {
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: 180,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.primaryLight,
  },
  postContent: {
    padding: 16,
  },
  postDate: {
    fontSize: 12,
    fontFamily: theme.fonts.bodyMedium,
    color: theme.colors.gold,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  postTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.title,
    color: theme.colors.textPrimary,
    marginBottom: 8,
    lineHeight: 24,
  },
  postExcerpt: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(28,103,159,0.08)',
  },
  readMoreText: {
    fontSize: 14,
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.primary,
    marginRight: 6,
  },
});
