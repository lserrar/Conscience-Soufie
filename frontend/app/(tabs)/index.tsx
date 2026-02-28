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
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';
import theme from '@/constants/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Calameo magazines data with actual cover URLs
const MAGAZINES = [
  {
    id: '4',
    title: 'Revue N°4',
    thumbnail: 'https://p.calameoassets.com/230213174144-96e4b9d84c8e4f3e9ed6f3e1a0b2c3d4/p1.jpg',
    readUrl: 'https://www.calameo.com/read/007294180361a4e13db8f',
    date: 'Février 2023',
  },
  {
    id: '3',
    title: 'Revue N°3',
    thumbnail: 'https://p.calameoassets.com/200301202336-c9f1a9e6b1f2ea2b3d3b6c0a8d7e4f5a/p1.jpg',
    readUrl: 'https://www.calameo.com/read/00729418046e9bf1ac1d9',
    date: 'Mars 2020',
  },
  {
    id: '2',
    title: 'Revue N°2',
    thumbnail: 'https://p.calameoassets.com/230213174144-b2a0bd2077e6b8c4d5f1a2c3e4d5f6a7/p1.jpg',
    readUrl: 'https://www.calameo.com/read/0072941807720db430b2a',
    date: 'Février 2023',
  },
  {
    id: '1',
    title: 'Revue N°1',
    thumbnail: 'https://p.calameoassets.com/230213174144-6fec09d2823d4e5f6a7b8c9d0e1f2a3b/p1.jpg',
    readUrl: 'https://www.calameo.com/read/00729418082df7e90cef6',
    date: 'Février 2023',
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

export default function AccueilScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [events, setEvents] = useState<HelloAssoEvent[]>([]);
  const [highlightEvent, setHighlightEvent] = useState<HelloAssoEvent | null>(null);
  
  const highlightScale = useRef(new Animated.Value(1)).current;

  const fetchData = async () => {
    try {
      // Fetch articles from WordPress
      const articlesResponse = await axios.get(
        'https://consciencesoufie.com/wp-json/wp/v2/posts?per_page=10&_embed'
      ).catch(() => ({ data: [] }));
      
      // Fetch events from HelloAsso
      const eventsResponse = await axios.get(
        `${BACKEND_URL}/api/helloasso/events`
      ).catch(() => ({ data: { events: [] } }));
      
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
      pathname: '/post/[id]',
      params: {
        id: post.id.toString(),
        title: post.title.rendered,
        content: '',
        link: post.link,
      }
    });
  };

  const openMagazine = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
      });
    } catch {
      return '';
    }
  };

  const cleanHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
  };

  const handleHighlightPressIn = () => {
    Animated.spring(highlightScale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handleHighlightPressOut = () => {
    Animated.spring(highlightScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
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
      {/* Hero - Highlight Event */}
      {highlightEvent && (
        <Animated.View style={[styles.heroSection, { transform: [{ scale: highlightScale }] }]}>
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
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.heroImage, styles.heroPlaceholder]}>
                  <Ionicons name="calendar" size={64} color={theme.colors.primary} />
                </View>
              )}
              
              {/* Gradient overlay */}
              <View style={styles.heroGradient} />
              
              {/* Event info overlay */}
              <View style={styles.heroContent}>
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>PROCHAIN ÉVÉNEMENT</Text>
                </View>
                <Text style={styles.heroTitle} numberOfLines={2}>{highlightEvent.title}</Text>
                <Text style={styles.heroDate}>{formatDate(highlightEvent.startDate)}</Text>
                
                <TouchableOpacity 
                  style={styles.heroButton}
                  onPress={() => openEventDetail(highlightEvent)}
                >
                  <Text style={styles.heroButtonText}>Voir l'événement</Text>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Section: Derniers Articles */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Derniers articles</Text>
          <TouchableOpacity onPress={() => router.push('/blog')}>
            <Text style={styles.sectionLink}>Voir tout →</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          horizontal
          data={articles.slice(0, 8)}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => {
            const thumbnail = item._embedded?.['wp:featuredmedia']?.[0]?.source_url;
            return (
              <TouchableOpacity
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
                  <Text style={styles.articleTitle} numberOfLines={2}>
                    {cleanHtml(item.title.rendered)}
                  </Text>
                  <Text style={styles.articleDate}>{formatDate(item.date)}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Section: Revues Conscience Soufie */}
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
              onPress={() => openMagazine(item.url)}
              activeOpacity={0.9}
            >
              <View style={styles.magazineImageContainer}>
                <View style={[styles.magazineImage, styles.magazinePlaceholder]}>
                  <Ionicons name="book" size={40} color={theme.colors.primary} />
                  <Text style={styles.magazineNumber}>N°{item.id}</Text>
                </View>
              </View>
              <Text style={styles.magazineTitle} numberOfLines={2}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Section: Prochains Événements */}
      {events.length > 1 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Prochains événements</Text>
            <TouchableOpacity onPress={() => router.push('/live')}>
              <Text style={styles.sectionLink}>Voir tout →</Text>
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

  // Hero Section
  heroSection: {
    marginBottom: 24,
  },
  heroImageContainer: {
    width: SCREEN_WIDTH,
    aspectRatio: 4 / 5,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    backgroundColor: 'rgba(28,103,159,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'transparent',
    backgroundImage: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 24,
  },
  heroBadge: {
    backgroundColor: theme.colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: theme.fonts.bodySemiBold,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: theme.fonts.titleBold,
    color: '#fff',
    marginBottom: 8,
    lineHeight: 30,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroDate: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
    gap: 6,
  },
  heroButtonText: {
    fontSize: 14,
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.primary,
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

  // Article Card
  articleCard: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
    width: 140,
    alignItems: 'center',
  },
  magazineImageContainer: {
    width: 140,
    height: 180,
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    marginBottom: 10,
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
  magazinePlaceholder: {
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  magazineNumber: {
    color: '#fff',
    fontSize: 24,
    fontFamily: theme.fonts.titleBold,
    marginTop: 8,
  },
  magazineTitle: {
    fontSize: 13,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Event Card
  eventCard: {
    width: 180,
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventImage: {
    width: '100%',
    height: 100,
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

  bottomSpacer: {
    height: 40,
  },
});
