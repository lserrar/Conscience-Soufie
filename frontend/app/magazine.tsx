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

export default function MagazineScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  
  const { url, title } = params;
  const magazineUrl = typeof url === 'string' ? url : '';
  const magazineTitle = typeof title === 'string' ? title : 'Revue';

  const openInBrowser = async () => {
    if (magazineUrl) {
      await WebBrowser.openBrowserAsync(magazineUrl);
    }
  };

  const isWeb = Platform.OS === 'web';

  if (isWeb) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{magazineTitle}</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.webFallback}>
          <View style={styles.magazineIcon}>
            <Ionicons name="book" size={48} color="#fff" />
          </View>
          <Text style={styles.fallbackTitle}>{magazineTitle}</Text>
          <Text style={styles.fallbackText}>
            La lecture s'affiche mieux dans l'application mobile.
          </Text>
          <TouchableOpacity style={styles.openButton} onPress={openInBrowser}>
            <Text style={styles.openButtonText}>Lire sur Calameo</Text>
            <Ionicons name="open-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{magazineTitle}</Text>
        <TouchableOpacity style={styles.backButton} onPress={openInBrowser}>
          <Ionicons name="open-outline" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.webviewContainer}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Chargement de la revue...</Text>
          </View>
        )}
        <WebView
          source={{ uri: magazineUrl }}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsFullscreenVideo={true}
          scalesPageToFit={true}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
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
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  magazineIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  fallbackTitle: {
    fontSize: 22,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  fallbackText: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  openButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: theme.borderRadius.button,
    gap: 10,
  },
  openButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: theme.fonts.bodySemiBold,
  },
});
