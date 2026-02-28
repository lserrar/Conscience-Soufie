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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import theme from '@/constants/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// Topic filters (from WordPress categories)
const TOPIC_FILTERS = [
  { slug: 'all', label: 'Tous' },
  { slug: 'soufisme', label: 'Soufisme' },
  { slug: 'le-prophete-muhammad', label: 'Le Prophète' },
  { slug: 'ibn-arabi', label: 'Ibn \'Arabî' },
  { slug: 'rumi', label: 'Rûmî' },
  { slug: 'henry-corbin', label: 'Henry Corbin' },
  { slug: 'eva', label: 'Eva de Vitray' },
  { slug: 'cheikh-ahmad-al-alawi', label: 'Cheikh al-\'Alâwî' },
  { slug: 'hallaj', label: 'Hallâj' },
  { slug: 'poesie', label: 'Poésie' },
  { slug: 'philosophie', label: 'Philosophie' },
  { slug: 'references-bibilographiques', label: 'Bibliographie' },
  { slug: 'paix', label: 'Paix' },
  { slug: 'hommages', label: 'Hommages' },
];

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
  const params = useLocalSearchParams();
  const filterParam = typeof params.filter === 'string' ? params.filter : 'all';
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState(filterParam);
  const router = useRouter();

  // Sync filter when params change (navigation from home page)
  useEffect(() => {
    if (filterParam !== activeFilter) {
      setActiveFilter(filterParam);
    }
  }, [filterParam]);

  const fetchPosts = async (filter: string = 'all') => {
    try {
      setError(null);
      setLoading(true);
      
      if (filter === 'all') {
        // Fetch all posts
        const response = await axios.get(
          'https://consciencesoufie.com/wp-json/wp/v2/posts?per_page=20&_embed'
        );
        setPosts(response.data);
      } else {
        // Fetch by tag/category
        const response = await axios.get(`${BACKEND_URL}/api/articles/by-tag/${filter}`);
        if (response.data.articles) {
          setPosts(response.data.articles);
        } else {
          setPosts([]);
        }
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Impossible de charger le contenu. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts(activeFilter);
  }, [activeFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts(activeFilter);
  }, [activeFilter]);

  const handleFilterChange = (slug: string) => {
    setActiveFilter(slug);
  };

  const openPost = (post: Post) => {
    const title = stripHTML(post.title.rendered);
    router.push({
      pathname: '/article',
      params: {
        url: post.link,
        title: title,
      }
    });
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

  const renderFilters = () => (
    <View style={styles.filtersWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {TOPIC_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.slug}
            style={[
              styles.filterChip,
              activeFilter === filter.slug && styles.filterChipActive,
            ]}
            onPress={() => handleFilterChange(filter.slug)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === filter.slug && styles.filterChipTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (error && !loading) {
    return (
      <View style={styles.container}>
        {renderFilters()}
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchPosts(activeFilter)}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Topic Filters */}
      {renderFilters()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        {loading ? (
          <View style={styles.loadingInner}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Chargement des articles...</Text>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>Aucun article trouvé pour ce thème.</Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {activeFilter === 'all' 
                  ? 'Articles récents' 
                  : TOPIC_FILTERS.find(f => f.slug === activeFilter)?.label || 'Articles'}
              </Text>
              <View style={styles.goldAccent} />
            </View>
            
            {posts.map((post) => (
              <TouchableOpacity 
                key={post.id} 
                style={styles.postCard}
                onPress={() => openPost(post)}
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
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  
  // Filters
  filtersWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28,103,159,0.08)',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(28,103,159,0.08)',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: theme.fonts.bodyMedium,
    color: theme.colors.textPrimary,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  
  // Loading
  loadingInner: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
  },
  
  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  
  // Section
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
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
  
  // Empty
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
  
  // Post Card
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
