import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';
import RenderHtml from 'react-native-render-html';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY_COLOR = '#1c679f';

interface Page {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
}

export default function AboutScreen() {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { width } = useWindowDimensions();

  const fetchPage = async () => {
    try {
      setError(null);
      const response = await axios.get(
        'https://consciencesoufie.com/wp-json/wp/v2/pages?slug=presentation'
      );
      if (response.data && response.data.length > 0) {
        setPage(response.data[0]);
      }
    } catch (err) {
      console.error('Error fetching page:', err);
      setError('Impossible de charger le contenu. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPage();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPage();
  }, []);

  const openLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
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
      .replace(/&#8212;/g, '—');
  };

  const tagsStyles = {
    body: {
      color: '#333',
      fontSize: 16,
      lineHeight: 24,
    },
    p: {
      marginBottom: 12,
    },
    h1: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: PRIMARY_COLOR,
      marginBottom: 16,
    },
    h2: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      color: PRIMARY_COLOR,
      marginBottom: 12,
    },
    h3: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: '#333',
      marginBottom: 8,
    },
    a: {
      color: PRIMARY_COLOR,
      textDecorationLine: 'underline' as const,
    },
    ul: {
      marginBottom: 12,
    },
    li: {
      marginBottom: 4,
    },
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPage}>
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
      {/* 10th Anniversary Banner */}
      <View style={styles.anniversaryBanner}>
        <Text style={styles.anniversaryText}>🎉 10 ans de Conscience Soufie !</Text>
      </View>

      <Text style={styles.sectionTitle}>
        {page ? decodeHTML(page.title.rendered) : 'À Propos'}
      </Text>

      {page && (
        <View style={styles.contentCard}>
          <RenderHtml
            contentWidth={width - 64}
            source={{ html: page.content.rendered }}
            tagsStyles={tagsStyles}
          />
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => openLink('https://www.helloasso.com/associations/conscience-soufie/adhesions/campagne-d-adhesion-2026')}
        >
          <Ionicons name="people" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.primaryButtonText}>Devenir adhérent</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => openLink('https://consciencesoufie.com/contact/')}
        >
          <Ionicons name="mail" size={20} color={PRIMARY_COLOR} style={styles.buttonIcon} />
          <Text style={styles.secondaryButtonText}>Nous contacter</Text>
        </TouchableOpacity>
      </View>
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
  anniversaryBanner: {
    backgroundColor: PRIMARY_COLOR,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  anniversaryText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtons: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: PRIMARY_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
  },
  secondaryButtonText: {
    color: PRIMARY_COLOR,
    fontSize: 18,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
});
