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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';

const PRIMARY_COLOR = '#1c679f';
const LOGO_URL = 'https://consciencesoufie.com/wp-content/uploads/2019/07/logo-CS-Blanc.png';

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
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
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
            <Ionicons name="search" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setDonationModalVisible(true)}
          >
            <Ionicons name="heart" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setMembershipModalVisible(true)}
          >
            <Ionicons name="card" size={24} color="#fff" />
          </TouchableOpacity>
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
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher..."
                placeholderTextColor="#999"
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
              <ActivityIndicator size="large" color={PRIMARY_COLOR} />
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
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Ionicons name="heart" size={48} color={PRIMARY_COLOR} />
            <Text style={styles.modalTitle}>
              Soutenez Conscience Soufie pour ses 10 ans !
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setDonationModalVisible(false);
                openLink('https://www.helloasso.com/associations/conscience-soufie/formulaires/1');
              }}
            >
              <Ionicons name="heart" size={20} color="#fff" style={styles.modalButtonIcon} />
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
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Ionicons name="people" size={48} color={PRIMARY_COLOR} />
            <Text style={styles.modalTitle}>
              Rejoignez la communauté Conscience Soufie !
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setMembershipModalVisible(false);
                openLink('https://www.helloasso.com/associations/conscience-soufie/adhesions/campagne-d-adhesion-2026');
              }}
            >
              <Ionicons name="card" size={20} color="#fff" style={styles.modalButtonIcon} />
              <Text style={styles.modalButtonText}>Devenir adhérent</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: PRIMARY_COLOR,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
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
    backgroundColor: '#fff',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  closeButtonText: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontWeight: '600',
  },
  searchLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchResultTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  searchResultType: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
  },
  emptyResults: {
    padding: 32,
    alignItems: 'center',
  },
  emptyResultsText: {
    fontSize: 16,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    position: 'relative',
  },
  modalCloseIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 26,
  },
  modalButton: {
    backgroundColor: PRIMARY_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
  },
  modalButtonIcon: {
    marginRight: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
