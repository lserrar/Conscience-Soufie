import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import theme from '@/constants/theme';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_3f80383a-d81a-4581-ad89-ad734daf5fe0/artifacts/xcg84shu_logo1.png';

interface SearchResult {
  id: number;
  title: string;
  url: string;
  type: string;
}

export default function Header() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [donationModalVisible, setDonationModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const performSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await axios.get(
        `https://consciencesoufie.com/wp-json/wp/v2/search?search=${encodeURIComponent(query)}&per_page=10`
      );
      setSearchResults(
        response.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          url: item.url,
          type: item.type,
        }))
      );
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const openLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    performSearch(text);
  };

  const openProfile = () => {
    // Navigate to profile or show profile modal
    // For now, we can navigate to the about page or create a profile page later
    router.push('/about');
  };

  return (
    <>
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {/* Left side: Profile + Logo */}
            <View style={styles.leftSection}>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={openProfile}
              >
                <Ionicons name="person-circle" size={32} color="#fff" />
              </TouchableOpacity>
              
              <Image
                source={{ uri: LOGO_URL }}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            
            {/* Right side: Search + Donation */}
            <View style={styles.rightSection}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setSearchModalVisible(true)}
              >
                <Ionicons name="search" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.donationButton}
                onPress={() => setDonationModalVisible(true)}
              >
                <Ionicons name="heart" size={18} color={theme.colors.primary} />
                <Text style={styles.donationText}>Don</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Gold accent line */}
          <View style={styles.goldLine} />
        </View>
      </View>

      {/* Search Modal */}
      <Modal
        visible={searchModalVisible}
        animationType="slide"
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.searchHeader}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={handleSearchChange}
                autoFocus
              />
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setSearchModalVisible(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>

          {searching ? (
            <View style={styles.searchLoading}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.searchResultItem}
                  onPress={() => {
                    openLink(item.url);
                    setSearchModalVisible(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                >
                  <Text style={styles.searchResultTitle}>{item.title}</Text>
                  <Text style={styles.searchResultType}>
                    {item.type === 'post' ? 'Article' : 'Page'}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                searchQuery.length >= 2 ? (
                  <View style={styles.emptyResults}>
                    <Text style={styles.emptyResultsText}>Aucun résultat trouvé</Text>
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </Modal>

      {/* Donation Modal */}
      <Modal
        visible={donationModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setDonationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseIcon}
              onPress={() => setDonationModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <View style={styles.modalIconContainer}>
              <Ionicons name="heart" size={32} color="#fff" />
            </View>
            <Text style={styles.modalTitle}>
              Soutenez Conscience Soufie{"\n"}pour ses 10 ans !
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setDonationModalVisible(false);
                openLink('https://www.helloasso.com/associations/conscience-soufie/formulaires/1');
              }}
            >
              <Ionicons name="heart" size={18} color="#fff" style={styles.modalButtonIcon} />
              <Text style={styles.modalButtonText}>Faire un don</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: theme.colors.primary,
  },
  header: {
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  goldLine: {
    height: 2,
    backgroundColor: theme.colors.gold,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileButton: {
    padding: 4,
    marginRight: 8,
  },
  logo: {
    width: 160,
    height: 44,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 10,
  },
  donationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  donationText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontFamily: theme.fonts.bodySemiBold,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28,103,159,0.1)',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    fontFamily: theme.fonts.body,
    marginLeft: 8,
    color: theme.colors.textPrimary,
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  closeButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontFamily: theme.fonts.bodyMedium,
  },
  searchLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultItem: {
    padding: 16,
    backgroundColor: theme.colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28,103,159,0.08)',
  },
  searchResultTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.bodyMedium,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  searchResultType: {
    fontSize: 12,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  emptyResults: {
    padding: 32,
    alignItems: 'center',
  },
  emptyResultsText: {
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26,42,58,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.large,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    position: 'relative',
    ...theme.shadows.card,
  },
  modalCloseIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.title,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 28,
  },
  modalButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: theme.borderRadius.button,
    width: '100%',
  },
  modalButtonIcon: {
    marginRight: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: theme.fonts.bodySemiBold,
  },
});
