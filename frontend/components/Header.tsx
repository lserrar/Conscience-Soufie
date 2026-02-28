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
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import theme from '@/constants/theme';

const LOGO_URL = 'https://consciencesoufie.com/wp-content/uploads/2019/07/logo-CS-Blanc.png';

// SVG pattern as base64 for geometric Islamic pattern
const GEOMETRIC_PATTERN = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ2VvbWV0cmljIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiPjxwYXRoIGQ9Ik0wIDIwTDIwIDBMNDAgMjBMMjAgNDBMMCAyMFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PHBhdGggZD0iTTIwIDBMMjAgNDBNMCAyMEw0MCAyMCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNnZW9tZXRyaWMpIi8+PC9zdmc+`;

interface SearchResult {
  id: number;
  title: string;
  url: string;
  type: string;
}

export default function Header() {
  const insets = useSafeAreaInsets();
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [donationModalVisible, setDonationModalVisible] = useState(false);
  const [membershipModalVisible, setMembershipModalVisible] = useState(false);
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

  return (
    <>
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          {/* Geometric pattern overlay */}
          <View style={styles.patternOverlay}>
            <Image 
              source={{ uri: GEOMETRIC_PATTERN }} 
              style={styles.patternImage}
              resizeMode="repeat"
            />
          </View>
          
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Image
                source={{ uri: LOGO_URL }}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.iconContainer}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setSearchModalVisible(true)}
              >
                <Ionicons name="search-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setDonationModalVisible(true)}
              >
                <Ionicons name="heart-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setMembershipModalVisible(true)}
              >
                <Ionicons name="card-outline" size={24} color="#fff" />
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

      {/* Membership Modal */}
      <Modal
        visible={membershipModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setMembershipModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseIcon}
              onPress={() => setMembershipModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <View style={styles.modalIconContainer}>
              <Ionicons name="people" size={32} color="#fff" />
            </View>
            <Text style={styles.modalTitle}>
              Rejoignez la communauté{"\n"}Conscience Soufie !
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setMembershipModalVisible(false);
                openLink('https://www.helloasso.com/associations/conscience-soufie/adhesions/campagne-d-adhesion-2026');
              }}
            >
              <Ionicons name="card" size={18} color="#fff" style={styles.modalButtonIcon} />
              <Text style={styles.modalButtonText}>Devenir adhérent</Text>
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
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 1,
  },
  patternImage: {
    width: '100%',
    height: '100%',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  goldLine: {
    height: 2,
    backgroundColor: theme.colors.gold,
  },
  logoContainer: {
    flex: 1,
  },
  logo: {
    width: 150,
    height: 40,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
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
