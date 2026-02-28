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
import axios from 'axios';

const PRIMARY_COLOR = '#1c679f';

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
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Chargement des articles...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
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
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY_COLOR]} />
      }
    >
      <Text style={styles.sectionTitle}>Articles récents</Text>
      {posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucun article disponible.</Text>
        </View>
      ) : (
        posts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            {post._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
              <Image
                source={{ uri: post._embedded['wp:featuredmedia'][0].source_url }}
                style={styles.postImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.postContent}>
              <Text style={styles.postDate}>{formatDate(post.date)}</Text>
              <Text style={styles.postTitle}>{stripHTML(post.title.rendered)}</Text>
              <Text style={styles.postExcerpt} numberOfLines={3}>
                {stripHTML(post.excerpt.rendered)}
              </Text>
              <TouchableOpacity
                style={styles.postButton}
                onPress={() => openPost(post.link)}
              >
                <Text style={styles.postButtonText}>Lire la suite</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
    backgroundColor: '#f5f5f5',
    padding: 24,
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
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postImage: {
    width: '100%',
    height: 180,
  },
  postContent: {
    padding: 16,
  },
  postDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  postExcerpt: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  postButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
