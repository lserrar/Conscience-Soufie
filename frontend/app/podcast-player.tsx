import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';
import theme from '@/constants/theme';

const DEFAULT_COVER = 'https://i1.sndcdn.com/avatars-000342847280-qdvr5o-t500x500.jpg';

export default function PodcastPlayerScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);

  const title = typeof params.title === 'string' ? params.title : 'Podcast';
  const podcastUrl = typeof params.url === 'string' ? params.url : '';
  const imageUrl = typeof params.image === 'string' ? params.image : DEFAULT_COVER;
  const duration = typeof params.duration === 'string' ? params.duration : '';
  const pubDate = typeof params.pubDate === 'string' ? params.pubDate : '';

  // Extract track ID from SoundCloud URL for embed
  // SoundCloud URLs look like: https://soundcloud.com/conscience-soufie/track-name
  const getEmbedUrl = (url: string) => {
    // SoundCloud oEmbed widget
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%231c679f&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const openInSoundCloud = async () => {
    if (podcastUrl) {
      await WebBrowser.openBrowserAsync(podcastUrl);
    }
  };

  const isWeb = Platform.OS === 'web';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-down" size={28} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>En lecture</Text>
        <TouchableOpacity style={styles.backButton} onPress={openInSoundCloud}>
          <Ionicons name="open-outline" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        </View>

        {/* Track Info */}
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle}>{title}</Text>
          <View style={styles.trackMeta}>
            {pubDate && <Text style={styles.trackDate}>{formatDate(pubDate)}</Text>}
            {duration && (
              <>
                <View style={styles.dot} />
                <Text style={styles.trackDuration}>{duration}</Text>
              </>
            )}
          </View>
        </View>

        {/* SoundCloud Player Embed */}
        <View style={styles.playerContainer}>
          {isWeb ? (
            <View style={styles.webFallback}>
              <Text style={styles.webFallbackText}>
                Le lecteur audio n'est pas disponible sur le web.
              </Text>
              <TouchableOpacity style={styles.openButton} onPress={openInSoundCloud}>
                <Ionicons name="play-circle" size={24} color="#fff" />
                <Text style={styles.openButtonText}>Écouter sur SoundCloud</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {loading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={styles.loadingText}>Chargement du lecteur...</Text>
                </View>
              )}
              <WebView
                source={{ uri: getEmbedUrl(podcastUrl) }}
                style={[styles.webview, loading && { opacity: 0 }]}
                onLoadEnd={() => setLoading(false)}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
              />
            </>
          )}
        </View>

        {/* Open in SoundCloud Button */}
        <TouchableOpacity style={styles.soundcloudButton} onPress={openInSoundCloud}>
          <Ionicons name="logo-soundcloud" size={24} color="#ff5500" />
          <Text style={styles.soundcloudButtonText}>Ouvrir dans SoundCloud</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28,103,159,0.1)',
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
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  coverContainer: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 40,
  },
  coverImage: {
    width: 280,
    height: 280,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  trackInfo: {
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: 'center',
  },
  trackTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 8,
  },
  trackMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackDate: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.textSecondary,
    marginHorizontal: 8,
  },
  trackDuration: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
  },
  playerContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    height: 166,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
    padding: 20,
  },
  webFallbackText: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  openButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: theme.fonts.bodySemiBold,
  },
  soundcloudButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 40,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff5500',
    gap: 10,
  },
  soundcloudButtonText: {
    fontSize: 15,
    fontFamily: theme.fonts.bodySemiBold,
    color: '#ff5500',
  },
});
