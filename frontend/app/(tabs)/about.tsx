import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';
import theme from '@/constants/theme';

const PRESENTATION_URL = 'https://consciencesoufie.com/presentation/';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);

  const openInBrowser = async () => {
    await WebBrowser.openBrowserAsync(PRESENTATION_URL);
  };

  const isWeb = Platform.OS === 'web';

  if (isWeb) {
    return (
      <View style={styles.container}>
        <View style={styles.webFallback}>
          <View style={styles.iconContainer}>
            <Ionicons name="information-circle" size={48} color="#fff" />
          </View>
          <Text style={styles.fallbackTitle}>Conscience Soufie</Text>
          <Text style={styles.fallbackSubtitle}>Association culturelle à but non lucratif</Text>
          <Text style={styles.fallbackText}>
            La page s'affiche mieux dans l'application mobile.
          </Text>
          <TouchableOpacity style={styles.openButton} onPress={openInBrowser}>
            <Text style={styles.openButtonText}>Voir la présentation</Text>
            <Ionicons name="open-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.webviewContainer}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        )}
        <WebView
          source={{ uri: PRESENTATION_URL }}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scalesPageToFit={true}
          showsVerticalScrollIndicator={false}
        />
      </View>
      
      {/* Floating button to open in browser */}
      <TouchableOpacity 
        style={[styles.floatingButton, { bottom: insets.bottom + 20 }]}
        onPress={openInBrowser}
      >
        <Ionicons name="open-outline" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  floatingButton: {
    position: 'absolute',
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  fallbackTitle: {
    fontSize: 26,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  fallbackSubtitle: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginBottom: 24,
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
