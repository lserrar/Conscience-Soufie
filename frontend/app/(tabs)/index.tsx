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
import theme from '@/constants/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Calameo magazines with read URLs for in-app viewing
const MAGAZINES = [
  {
    id: '4',
    title: 'Revue N°4',
    readUrl: 'https://www.calameo.com/read/007294180361a4e13db8f',
  },
  {
    id: '3',
    title: 'Revue N°3',
    readUrl: 'https://www.calameo.com/read/00729418046e9bf1ac1d9',
  },
  {
    id: '2',
    title: 'Revue N°2',
    readUrl: 'https://www.calameo.com/read/0072941807720db430b2a',
  },
  {
    id: '1',
    title: 'Revue N°1',
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

  const openMagazine = (readUrl: string, title: string) => {
    router.push({
      pathname: '/magazine',
      params: { url: readUrl, title }
    });
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
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
                <Ionicons name="chevron-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Section 1: Prochains Événements */}
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

      {/* Section 2: Derniers Articles */}
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
                  <Text style={styles.articleTitle} numberOfLines={2}>{cleanHtml(item.title.rendered)}</Text>
                  <Text style={styles.articleDate}>{formatDate(item.date)}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Section 3: Revues Conscience Soufie */}
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
                <View style={styles.magazineCoverInner}>
                  <Text style={styles.magazineBrand}>CONSCIENCE</Text>
                  <Text style={styles.magazineBrand}>SOUFIE</Text>
                  <View style={styles.magazineNumberBadge}>
                    <Text style={styles.magazineNumber}>N°{item.id}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.magazineTitle}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

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

  // Hero Section - Fixed aspect ratio for event poster
  heroSection: {
    marginBottom: 24,
    backgroundColor: '#f0f4f8',
  },
  heroImageContainer: {
    width: SCREEN_WIDTH,
    aspectRatio: 16 / 9,
    backgroundColor: '#1a2a3a',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(28,103,159,0.1)',
  },
  heroInfo: {
    padding: 20,
    backgroundColor: '#fff',
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
    fontSize: 22,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    marginBottom: 8,
    lineHeight: 28,
  },
  heroDate: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
    gap: 6,
  },
  heroButtonText: {
    fontSize: 14,
    fontFamily: theme.fonts.bodySemiBold,
    color: '#fff',
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
    backgroundColor: theme.colors.primary,
  },
  magazineCoverInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderWidth: 3,
    borderColor: theme.colors.gold,
    margin: 8,
    borderRadius: 4,
  },
  magazineBrand: {
    color: '#fff',
    fontSize: 14,
    fontFamily: theme.fonts.titleBold,
    textAlign: 'center',
    letterSpacing: 2,
  },
  magazineNumberBadge: {
    marginTop: 16,
    backgroundColor: theme.colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  magazineNumber: {
    color: '#fff',
    fontSize: 14,
    fontFamily: theme.fonts.titleBold,
  },
  magazineTitle: {
    fontSize: 12,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },

  bottomSpacer: {
    height: 40,
  },
});
