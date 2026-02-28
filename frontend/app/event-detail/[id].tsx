import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';
import theme from '@/constants/theme';

// HelloAsso brand colors
const HELLOASSO_GREEN = '#49D38A';

export default function EventDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const { title, url } = params;
  const eventUrl = typeof url === 'string' ? url : '';

  const openInBrowser = async () => {
    if (eventUrl) {
      await WebBrowser.openBrowserAsync(eventUrl);
    }
  };

  // Check if we're on web (WebView doesn't work well on web)
  const isWeb = Platform.OS === 'web';

  if (isWeb) {
    // On web, show a simple page with link to HelloAsso
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Événement</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.webFallback}>
          <Ionicons name="calendar" size={64} color={theme.colors.primary} />
          <Text style={styles.webFallbackTitle}>{title}</Text>
          <Text style={styles.webFallbackText}>
            La page de l'événement s'affiche mieux dans l'application mobile.
          </Text>
          <TouchableOpacity style={styles.helloassoButton} onPress={openInBrowser}>
            <View style={styles.helloassoContent}>
              <Text style={styles.helloassoText}>Voir sur</Text>
              <Text style={styles.helloassoBrand}>HelloAsso</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title || 'Événement'}</Text>
        <TouchableOpacity style={styles.browserButton} onPress={openInBrowser}>
          <Ionicons name="open-outline" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* WebView with HelloAsso page */}
      <View style={styles.webviewContainer}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        )}
        
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="cloud-offline-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={styles.errorText}>Impossible de charger la page</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => setError(false)}>
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.helloassoButtonSmall} onPress={openInBrowser}>
              <Text style={styles.helloassoTextSmall}>Ouvrir dans le navigateur</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            source={{ uri: eventUrl }}
            style={styles.webview}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            startInLoadingState={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scalesPageToFit={true}
            showsVerticalScrollIndicator={false}
            // Inject CSS to hide HelloAsso header/footer for cleaner look
            injectedJavaScript={`
              (function() {
                // Hide cookie banner if present
                var cookieBanner = document.querySelector('.cookie-consent-banner');
                if (cookieBanner) cookieBanner.style.display = 'none';
                
                // Hide navigation header
                var header = document.querySelector('header');
                if (header) header.style.display = 'none';
                
                // Hide footer
                var footer = document.querySelector('footer');
                if (footer) footer.style.display = 'none';
                
                // Add some padding at top
                var main = document.querySelector('main');
                if (main) main.style.paddingTop = '16px';
              })();
              true;
            `}
          />
        )}
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
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    width: 48,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: theme.fonts.title,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  headerSpacer: {
    width: 48,
  },
  browserButton: {
    padding: 8,
    width: 48,
    alignItems: 'flex-end',
  },
  
  // WebView
  webviewContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: theme.fonts.title,
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
    marginTop: 12,
    fontSize: 16,
    fontFamily: theme.fonts.title,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.button,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: theme.fonts.title,
  },
  helloassoButtonSmall: {
    paddingVertical: 12,
  },
  helloassoTextSmall: {
    color: theme.colors.primary,
    fontSize: 14,
    fontFamily: theme.fonts.title,
  },
  
  // Web fallback
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  webFallbackTitle: {
    marginTop: 20,
    fontSize: 22,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 30,
  },
  webFallbackText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: theme.fonts.title,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  helloassoButton: {
    backgroundColor: HELLOASSO_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    maxWidth: 280,
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
});
