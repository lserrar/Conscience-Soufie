import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Animated,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as Linking from 'expo-linking';
import theme from '@/constants/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Thematic tags for article carousels (from WordPress categories)
// Ordered as per user request - some tags redirect to other categories
const THEMATIC_TAGS = [
  { slug: 'references-bibilographiques', label: 'Bibliographie' },
  { slug: 'le-prophete-muhammad', label: 'Le Prophète Muhammad' },
  { slug: 'ibn-arabi', label: 'Ibn \'Arabî' },
  { slug: 'rumi', label: 'Rûmî' },
  { slug: 'hallaj', label: 'Hallâj' },
  { slug: 'poesie', label: 'Poésie' },
  { slug: 'hommages', label: 'Hommages' },
  { slug: 'eva', label: 'Eva de Vitray-Meyerovitch' },
  { slug: 'hallaj', label: 'Louis Massignon', redirect: true }, // Redirects to Hallaj articles
  { slug: 'henry-corbin', label: 'Henry Corbin' },
  { slug: 'ibn-arabi', label: 'Michel Chodkiewicz', redirect: true }, // Redirects to Ibn Arabi articles
  { slug: 'rene-guenon', label: 'René Guénon' },
  { slug: 'cheikh-ahmad-al-alawi', label: 'Cheikh al-\'Alâwî' },
  { slug: 'philosophie', label: 'Philosophie' },
  { slug: 'paix', label: 'Paix' },
  { slug: 'soufisme', label: 'Soufisme' },
];

// YouTube channel data for Conscience Soufie
const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@ConscienceSoufie';
const YOUTUBE_VIDEOS = [
  {
    id: '1',
    title: 'Conscience Soufie',
    thumbnail: 'https://i.ytimg.com/vi/JfHPsrZNmwg/hqdefault.jpg',
    url: YOUTUBE_CHANNEL_URL,
  },
  {
    id: '2',
    title: 'Vidéos récentes',
    thumbnail: 'https://i.ytimg.com/vi/8XW_h64XZOM/hqdefault.jpg',
    url: YOUTUBE_CHANNEL_URL,
  },
  {
    id: '3',
    title: 'Conférences',
    thumbnail: 'https://i.ytimg.com/vi/QeVg7bqVKjY/hqdefault.jpg',
    url: YOUTUBE_CHANNEL_URL,
  },
];

// Calameo magazines with actual cover images
const MAGAZINES = [
  {
    id: '4',
    title: 'Présence du Prophète',
    cover: 'https://customer-assets.emergentagent.com/job_3f80383a-d81a-4581-ad89-ad734daf5fe0/artifacts/43f2ucto_Une-de-Couv-Revue-CS4-Newsletter%402x-100.jpg',
    readUrl: 'https://www.calameo.com/read/007294180361a4e13db8f',
  },
  {
    id: '3',
    title: 'Soufisme et Poésie',
    cover: 'https://i.calameoassets.com/181429070361a4e13db8f/large.jpg',
    readUrl: 'https://www.calameo.com/read/00729418046e9bf1ac1d9',
  },
  {
    id: '2',
    title: 'Soufisme et Poésie',
    cover: 'https://customer-assets.emergentagent.com/job_3f80383a-d81a-4581-ad89-ad734daf5fe0/artifacts/w39zxa8f_Image-23-03-2019-a%CC%80-21.38.jpg',
    readUrl: 'https://www.calameo.com/read/0072941807720db430b2a',
  },
  {
    id: '1',
    title: 'Revue N°1',
    cover: 'https://customer-assets.emergentagent.com/job_3f80383a-d81a-4581-ad89-ad734daf5fe0/artifacts/9vdxekwg_Revue-Conscience-Soufie-N1-web.jpg',
    readUrl: 'https://www.calameo.com/read/00729418082df7e90cef6',
  },
];

interface BlogPost {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  link: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
    }>;
  };
}

interface HelloAssoEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  banner: string | null;
  logo: string | null;
  url: string;
  place?: {
    name?: string;
    city?: string;
  };
}

interface ThemedArticles {
  [key: string]: BlogPost[];
}

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
}

export default function AccueilScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [events, setEvents] = useState<HelloAssoEvent[]>([]);
  const [highlightEvent, setHighlightEvent] = useState<HelloAssoEvent | null>(null);
  const [themedArticles, setThemedArticles] = useState<ThemedArticles>({});
  
  const highlightScale = useRef(new Animated.Value(1)).current;

  const fetchThemedArticles = async () => {
    const results: ThemedArticles = {};
    
    // Fetch articles for each theme in parallel
    await Promise.all(
      THEMATIC_TAGS.map(async (tag) => {
        try {
          const response = await axios.get(`${BACKEND_URL}/api/articles/by-tag/${tag.slug}`);
          if (response.data.articles && response.data.articles.length > 0) {
            results[tag.slug] = response.data.articles.slice(0, 8);
          }
        } catch (err) {
          console.log(`No articles for ${tag.slug}`);
        }
      })
    );
    
    setThemedArticles(results);
  };

  const fetchData = async () => {
    try {
      const [articlesResponse, eventsResponse] = await Promise.all([
        axios.get('https://consciencesoufie.com/wp-json/wp/v2/posts?per_page=10&_embed').catch(() => ({ data: [] })),
        axios.get(`${BACKEND_URL}/api/helloasso/events`).catch(() => ({ data: { events: [] } })),
      ]);
      
      if (articlesResponse.data) {
        setArticles(articlesResponse.data);
      }
      
      if (eventsResponse.data.events) {
        const eventList = eventsResponse.data.events;
        setEvents(eventList);
        if (eventList.length > 0) {
          setHighlightEvent(eventList[0]);
        }
      }
      
      // Fetch themed articles
      await fetchThemedArticles();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const openEventDetail = (event: HelloAssoEvent) => {
    router.push({
      pathname: '/event-detail/[id]',
      params: {
        id: event.id,
        title: event.title,
        description: event.description || '',
        startDate: event.startDate,
        url: event.url,
      }
    });
  };

  const openArticle = (post: BlogPost) => {
    router.push({
      pathname: '/article',
      params: {
        url: post.link,
        title: cleanHtml(post.title.rendered),
      }
    });
  };

  const openMagazine = (readUrl: string, title: string) => {
    router.push({
      pathname: '/magazine',
      params: { url: readUrl, title }
    });
  };

  const openYouTube = async (url: string) => {
    // Use platform-specific opening method
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // Fallback for web environment
        if (typeof window !== 'undefined') {
          window.open(url, '_blank');
        }
      }
    } catch (error) {
      // Fallback for web environment
      if (typeof window !== 'undefined') {
        window.open(url, '_blank');
      }
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    } catch {
      return '';
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const dateFormatted = date.toLocaleDateString('fr-FR', { 
        weekday: 'long',
        day: 'numeric', 
        month: 'long' 
      });
      const timeFormatted = date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      return `${dateFormatted} à ${timeFormatted}`;
    } catch {
      return '';
    }
  };

  const cleanHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
  };

  const handleHighlightPressIn = () => {
    Animated.spring(highlightScale, { toValue: 0.98, useNativeDriver: true }).start();
  };

  const handleHighlightPressOut = () => {
    Animated.spring(highlightScale, { toValue: 1, useNativeDriver: true }).start();
  };

  const renderArticleCard = (item: BlogPost) => {
    const thumbnail = item._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.articleCard}
        onPress={() => openArticle(item)}
        activeOpacity={0.9}
      >
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={styles.articleImage} resizeMode="cover" />
        ) : (
          <View style={[styles.articleImage, styles.articlePlaceholder]}>
            <Ionicons name="document-text" size={32} color={theme.colors.primary} />
          </View>
        )}
        <View style={styles.articleContent}>
          <Text style={styles.articleTitle} numberOfLines={2}>{cleanHtml(item.title.rendered)}</Text>
          <Text style={styles.articleDate}>{formatDate(item.date)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
      }
    >
      {/* Hero - À la une */}
      {highlightEvent && (
        <View style={styles.heroSection}>
          {/* Section Title */}
          <View style={styles.aLaUneHeader}>
            <Text style={styles.aLaUneTitle}>À la une</Text>
            <View style={styles.aLaUneUnderline} />
          </View>
          
          <Animated.View style={{ transform: [{ scale: highlightScale }] }}>
            <TouchableOpacity
              activeOpacity={1}
              onPressIn={handleHighlightPressIn}
              onPressOut={handleHighlightPressOut}
              onPress={() => openEventDetail(highlightEvent)}
            >
              <View style={styles.heroImageContainer}>
                {(highlightEvent.logo || highlightEvent.banner) ? (
                  <Image
                    source={{ uri: highlightEvent.logo || highlightEvent.banner }}
                    style={styles.heroImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={[styles.heroImage, styles.heroPlaceholder]}>
                    <Ionicons name="calendar" size={64} color={theme.colors.primary} />
                  </View>
                )}
              </View>
              
              {/* Event info below image */}
              <View style={styles.heroInfo}>
                <Text style={styles.heroTitle} numberOfLines={2}>{highlightEvent.title}</Text>
                <Text style={styles.heroDate}>{formatDateTime(highlightEvent.startDate)}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {/* Section 1: Prochains Événements */}
      {events.length > 1 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Prochains événements</Text>
            <TouchableOpacity onPress={() => router.push('/live')}>
              <Text style={styles.sectionLink}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            horizontal
            data={events.slice(1, 6)}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.eventCard}
                onPress={() => openEventDetail(item)}
                activeOpacity={0.9}
              >
                {(item.logo || item.banner) ? (
                  <Image source={{ uri: item.logo || item.banner }} style={styles.eventImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.eventImage, styles.eventPlaceholder]}>
                    <Ionicons name="calendar" size={32} color={theme.colors.primary} />
                  </View>
                )}
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.eventDate}>{formatDate(item.startDate)}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Section 2: Derniers Articles */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Derniers articles</Text>
          <TouchableOpacity onPress={() => router.push('/blog')}>
            <Text style={styles.sectionLink}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          horizontal
          data={articles.slice(0, 8)}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => renderArticleCard(item)}
        />
      </View>

      {/* Section 3: Dernières vidéos YouTube */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dernières vidéos</Text>
          <TouchableOpacity onPress={() => openYouTube(YOUTUBE_CHANNEL_URL)}>
            <Text style={styles.sectionLink}>Voir la chaîne</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          horizontal
          data={YOUTUBE_VIDEOS}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.youtubeCard}
              onPress={() => openYouTube(item.url)}
              activeOpacity={0.9}
            >
              <View style={styles.youtubeImageContainer}>
                <Image source={{ uri: item.thumbnail }} style={styles.youtubeImage} resizeMode="cover" />
                <View style={styles.youtubePlayButton}>
                  <Ionicons name="play" size={24} color="#fff" />
                </View>
              </View>
              <View style={styles.youtubeContent}>
                <Text style={styles.youtubeTitle} numberOfLines={2}>{item.title}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Section 4: Revues Conscience Soufie */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Revues Conscience Soufie</Text>
        </View>
        
        <FlatList
          horizontal
          data={MAGAZINES}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.magazineCard}
              onPress={() => openMagazine(item.readUrl, item.title)}
              activeOpacity={0.9}
            >
              <View style={styles.magazineCover}>
                <Image
                  source={{ uri: item.cover }}
                  style={styles.magazineImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.magazineTitle}>Revue N°{item.id}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Thematic Article Sections */}
      {THEMATIC_TAGS.map((tag, index) => {
        const tagArticles = themedArticles[tag.slug];
        if (!tagArticles || tagArticles.length === 0) return null;
        
        return (
          <View key={`${tag.slug}-${tag.label}-${index}`} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{tag.label}</Text>
              <TouchableOpacity onPress={() => router.push({ pathname: '/blog', params: { filter: tag.slug } })}>
                <Text style={styles.sectionLink}>Voir tout</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              horizontal
              data={tagArticles}
              keyExtractor={(item) => `${tag.slug}-${tag.label}-${item.id}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => renderArticleCard(item)}
            />
          </View>
        );
      })}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: theme.fonts.title,
    color: theme.colors.textSecondary,
  },

  // Hero Section - À la une
  heroSection: {
    marginBottom: 24,
    paddingTop: 20,
  },
  aLaUneHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  aLaUneTitle: {
    fontSize: 24,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
  },
  aLaUneUnderline: {
    width: 60,
    height: 3,
    backgroundColor: theme.colors.gold,
    marginTop: 8,
    borderRadius: 2,
  },
  heroImageContainer: {
    marginHorizontal: 16,
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    backgroundColor: '#f0f4f8',
  },
  heroImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  heroPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(28,103,159,0.1)',
  },
  heroInfo: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    marginBottom: 8,
    lineHeight: 26,
  },
  heroDate: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
  },

  // Sections
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
  },
  sectionLink: {
    fontSize: 14,
    fontFamily: theme.fonts.bodyMedium,
    color: theme.colors.primary,
  },
  horizontalList: {
    paddingHorizontal: 16,
    gap: 14,
  },

  // Event Card
  eventCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(28,103,159,0.1)',
  },
  eventImage: {
    width: '100%',
    height: 90,
  },
  eventPlaceholder: {
    backgroundColor: 'rgba(28,103,159,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventContent: {
    padding: 12,
  },
  eventTitle: {
    fontSize: 13,
    fontFamily: theme.fonts.title,
    color: theme.colors.textPrimary,
    lineHeight: 17,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 12,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
  },

  // Article Card
  articleCard: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(28,103,159,0.1)',
  },
  articleImage: {
    width: '100%',
    height: 120,
  },
  articlePlaceholder: {
    backgroundColor: 'rgba(28,103,159,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  articleContent: {
    padding: 12,
  },
  articleTitle: {
    fontSize: 14,
    fontFamily: theme.fonts.title,
    color: theme.colors.textPrimary,
    lineHeight: 18,
    marginBottom: 6,
  },
  articleDate: {
    fontSize: 12,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
  },

  // Magazine Card
  magazineCard: {
    width: 120,
    alignItems: 'center',
  },
  magazineCover: {
    width: 120,
    height: 170,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  magazineImage: {
    width: '100%',
    height: '100%',
  },
  magazineTitle: {
    fontSize: 12,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },

  // YouTube Card
  youtubeCard: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(28,103,159,0.1)',
  },
  youtubeImageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
  },
  youtubeImage: {
    width: '100%',
    height: '100%',
  },
  youtubePlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  youtubeContent: {
    padding: 12,
  },
  youtubeTitle: {
    fontSize: 14,
    fontFamily: theme.fonts.title,
    color: theme.colors.textPrimary,
    lineHeight: 18,
  },

  bottomSpacer: {
    height: 40,
  },
});
