import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import theme from '@/constants/theme';

// HelloAsso brand colors
const HELLOASSO_GREEN = '#49D38A';
const HELLOASSO_DARK = '#2D2D2D';

export default function EventDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { title, description, url } = params;

  const openHelloAsso = async () => {
    if (url && typeof url === 'string') {
      await WebBrowser.openBrowserAsync(url);
    }
  };

  // Clean HTML from description and get full text
  const cleanDescription = (html: string) => {
    if (!html) return '';
    // Remove HTML tags
    let text = html.replace(/<[^>]*>/g, ' ');
    // Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    text = text.replace(/&eacute;/g, 'é');
    text = text.replace(/&egrave;/g, 'è');
    text = text.replace(/&agrave;/g, 'à');
    text = text.replace(/&ccedil;/g, 'ç');
    text = text.replace(/&ocirc;/g, 'ô');
    text = text.replace(/&icirc;/g, 'î');
    text = text.replace(/&ucirc;/g, 'û');
    text = text.replace(/&acirc;/g, 'â');
    text = text.replace(/&ecirc;/g, 'ê');
    text = text.replace(/&rsquo;/g, "'");
    text = text.replace(/&lsquo;/g, "'");
    text = text.replace(/&rdquo;/g, '"');
    text = text.replace(/&ldquo;/g, '"');
    text = text.replace(/&hellip;/g, '...');
    text = text.replace(/&ndash;/g, '–');
    text = text.replace(/&mdash;/g, '—');
    // Clean up multiple spaces and line breaks
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  };

  const cleanedDescription = cleanDescription(description as string);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Événement</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Description */}
        {cleanedDescription ? (
          <View style={styles.descriptionSection}>
            <Text style={styles.description}>{cleanedDescription}</Text>
          </View>
        ) : (
          <View style={styles.noDescriptionSection}>
            <Text style={styles.noDescriptionText}>
              Retrouvez tous les détails sur HelloAsso
            </Text>
          </View>
        )}
      </ScrollView>

      {/* HelloAsso Button - Fixed at bottom */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity 
          style={styles.helloassoButton}
          onPress={openHelloAsso}
          activeOpacity={0.9}
        >
          <View style={styles.helloassoContent}>
            <Text style={styles.helloassoText}>S'inscrire sur</Text>
            <Text style={styles.helloassoBrand}>HelloAsso</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.helloassoSubtext}>
          Plateforme sécurisée de billetterie
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28,103,159,0.08)',
  },
  backButton: {
    padding: 8,
    width: 48,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: theme.fonts.title,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 140,
  },
  title: {
    fontSize: 28,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    lineHeight: 36,
    marginBottom: 24,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    fontFamily: theme.fonts.title,
    color: theme.colors.textPrimary,
    lineHeight: 28,
    textAlign: 'justify',
  },
  noDescriptionSection: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'rgba(28,103,159,0.04)',
    borderRadius: theme.borderRadius.medium,
  },
  noDescriptionText: {
    fontSize: 14,
    fontFamily: theme.fonts.title,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  // HelloAsso Button
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(28,103,159,0.08)',
  },
  helloassoButton: {
    backgroundColor: HELLOASSO_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: HELLOASSO_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  helloassoContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  helloassoText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: theme.fonts.title,
  },
  helloassoBrand: {
    color: '#fff',
    fontSize: 18,
    fontFamily: theme.fonts.titleBold,
  },
  helloassoSubtext: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 12,
    fontFamily: theme.fonts.title,
    color: theme.colors.textSecondary,
  },
});
