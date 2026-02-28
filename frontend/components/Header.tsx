import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  Switch,
  ActivityIndicator,
  Platform,
  TextInput,
  FlatList,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import theme from '@/constants/theme';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_3f80383a-d81a-4581-ad89-ad734daf5fe0/artifacts/xcg84shu_logo1.png';
const DONATION_URL = 'https://www.helloasso.com/associations/conscience-soufie/formulaires/1';

interface SearchResult {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  link: string;
  date: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>;
  };
}

export default function Header() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [donationModalVisible, setDonationModalVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [webviewLoading, setWebviewLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [tempUserName, setTempUserName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  React.useEffect(() => {
    loadUserName();
  }, []);

  const loadUserName = async () => {
    try {
      const name = await AsyncStorage.getItem('@user_name');
      if (name) {
        setUserName(name);
        setTempUserName(name);
      }
    } catch (e) {
      console.log('Error loading user name');
    }
  };

  const saveUserName = async () => {
    try {
      await AsyncStorage.setItem('@user_name', tempUserName);
      setUserName(tempUserName);
      setIsEditingName(false);
    } catch (e) {
      console.log('Error saving user name');
    }
  };

  const openLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const navigateToAbout = () => {
    setProfileModalVisible(false);
    router.push('/about');
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('@user_name');
    setUserName('');
    setTempUserName('');
    setProfileModalVisible(false);
  };

  // Search functions
  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    Keyboard.dismiss();
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const response = await axios.get(
        `https://consciencesoufie.com/wp-json/wp/v2/posts`,
        {
          params: {
            search: searchQuery.trim(),
            per_page: 20,
            _embed: true,
          },
        }
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const openSearchResult = (result: SearchResult) => {
    setSearchModalVisible(false);
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    
    router.push({
      pathname: '/article',
      params: {
        url: result.link,
        title: stripHTML(result.title.rendered),
      },
    });
  };

  const stripHTML = (html: string) => {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&#8217;/g, "'")
      .replace(/&#8216;/g, "'")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/&hellip;/g, '...')
      .replace(/&rsquo;/g, "'")
      .trim();
  };

  const formatDate = (dateStr: string) => {
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

  const closeSearchModal = () => {
    setSearchModalVisible(false);
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  const isWeb = Platform.OS === 'web';

  return (
    <>
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {/* Left: Profile Button */}
            <TouchableOpacity
              style={styles.sideButton}
              onPress={() => setProfileModalVisible(true)}
            >
              <View style={styles.profileAvatar}>
                <Ionicons name="person" size={18} color="#fff" />
              </View>
            </TouchableOpacity>
            
            {/* Center: Logo + Subtitle */}
            <View style={styles.centerSection}>
              <Image
                source={{ uri: LOGO_URL }}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.subtitle}>Association culturelle à but non lucratif</Text>
            </View>
            
            {/* Right: Donation Button */}
            <TouchableOpacity
              style={styles.sideButton}
              onPress={() => setDonationModalVisible(true)}
            >
              <Ionicons name="gift" size={26} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Profile/Settings Modal */}
      <Modal
        visible={profileModalVisible}
        animationType="slide"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={[styles.modalFullScreen, { paddingTop: insets.top }]}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setProfileModalVisible(false)}
            >
              <Ionicons name="close" size={28} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Mon profil</Text>
            <View style={styles.modalCloseButton} />
          </View>
          
          <ScrollView style={styles.profileContent} showsVerticalScrollIndicator={false}>
            {/* Profile Section */}
            <View style={styles.profileSection}>
              <View style={styles.profileAvatarLarge}>
                <Ionicons name="person" size={40} color="#fff" />
              </View>
              
              {isEditingName ? (
                <View style={styles.editNameContainer}>
                  <TextInput
                    style={styles.nameInput}
                    value={tempUserName}
                    onChangeText={setTempUserName}
                    placeholder="Votre nom"
                    placeholderTextColor={theme.colors.textSecondary}
                    autoFocus
                  />
                  <View style={styles.editNameButtons}>
                    <TouchableOpacity style={styles.saveNameButton} onPress={saveUserName}>
                      <Text style={styles.saveNameButtonText}>Enregistrer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsEditingName(false)}>
                      <Text style={styles.cancelText}>Annuler</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setIsEditingName(true)}>
                  <Text style={styles.profileName}>
                    {userName || 'Ajouter votre nom'}
                  </Text>
                  {!userName && (
                    <Text style={styles.profileNameHint}>Appuyez pour modifier</Text>
                  )}
                </TouchableOpacity>
              )}
              
              <Text style={styles.profileSubtext}>Membre Conscience Soufie</Text>
            </View>

            {/* Settings */}
            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Préférences</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingItemLeft}>
                  <Ionicons name="notifications-outline" size={22} color={theme.colors.primary} />
                  <Text style={styles.settingItemText}>Notifications</Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#ddd', true: theme.colors.primary }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Confidentialité</Text>
              
              <TouchableOpacity 
                style={styles.settingItemButton}
                onPress={() => openLink('https://consciencesoufie.com/politique-de-confidentialite/')}
              >
                <View style={styles.settingItemLeft}>
                  <Ionicons name="shield-checkmark-outline" size={22} color={theme.colors.primary} />
                  <Text style={styles.settingItemText}>Politique de confidentialité</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.settingItemButton}
                onPress={() => openLink('https://consciencesoufie.com/conditions-generales/')}
              >
                <View style={styles.settingItemLeft}>
                  <Ionicons name="reader-outline" size={22} color={theme.colors.primary} />
                  <Text style={styles.settingItemText}>Conditions d'utilisation</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>À propos</Text>
              
              <TouchableOpacity 
                style={styles.settingItemButton}
                onPress={navigateToAbout}
              >
                <View style={styles.settingItemLeft}>
                  <Ionicons name="information-circle-outline" size={22} color={theme.colors.primary} />
                  <Text style={styles.settingItemText}>Qui sommes-nous</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.settingItemButton}
                onPress={() => openLink('https://consciencesoufie.com/contact/')}
              >
                <View style={styles.settingItemLeft}>
                  <Ionicons name="mail-outline" size={22} color={theme.colors.primary} />
                  <Text style={styles.settingItemText}>Nous contacter</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color="#dc3545" />
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </TouchableOpacity>

            {/* App Version */}
            <View style={styles.appVersion}>
              <Text style={styles.appVersionText}>Conscience Soufie</Text>
              <Text style={styles.appVersionNumber}>Version 1.0.0</Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Donation Modal with WebView */}
      <Modal
        visible={donationModalVisible}
        animationType="slide"
        onRequestClose={() => setDonationModalVisible(false)}
      >
        <View style={[styles.modalFullScreen, { paddingTop: insets.top }]}>
          <View style={styles.donationHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setDonationModalVisible(false)}
            >
              <Ionicons name="close" size={28} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Faire un don</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => openLink(DONATION_URL)}
            >
              <Ionicons name="open-outline" size={22} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {isWeb ? (
            <View style={styles.webFallback}>
              <View style={styles.donationIconContainer}>
                <Ionicons name="heart" size={48} color="#fff" />
              </View>
              <Text style={styles.donationTitle}>Soutenez Conscience Soufie</Text>
              <Text style={styles.donationSubtitle}>
                Votre don nous aide à poursuivre notre mission.
              </Text>
              <TouchableOpacity
                style={styles.donationCTAButton}
                onPress={() => {
                  setDonationModalVisible(false);
                  openLink(DONATION_URL);
                }}
              >
                <Ionicons name="heart" size={20} color="#fff" />
                <Text style={styles.donationCTAText}>Faire un don</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.webviewContainer}>
              {webviewLoading && (
                <View style={styles.webviewLoading}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={styles.webviewLoadingText}>Chargement...</Text>
                </View>
              )}
              <WebView
                source={{ uri: DONATION_URL }}
                style={styles.webview}
                onLoadStart={() => setWebviewLoading(true)}
                onLoadEnd={() => setWebviewLoading(false)}
                javaScriptEnabled={true}
                domStorageEnabled={true}
              />
            </View>
          )}
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
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
  },
  sideButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 50,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontFamily: theme.fonts.body,
    marginTop: 4,
  },
  
  // Modal Styles
  modalFullScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28,103,159,0.1)',
    backgroundColor: '#fff',
  },
  donationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28,103,159,0.1)',
    backgroundColor: '#fff',
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
  },
  profileContent: {
    flex: 1,
  },
  
  // Profile Section
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  profileAvatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 22,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  profileNameHint: {
    fontSize: 12,
    fontFamily: theme.fonts.body,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  profileSubtext: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  editNameContainer: {
    alignItems: 'center',
    width: '80%',
  },
  nameInput: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.button,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
    width: '100%',
    textAlign: 'center',
    marginBottom: 12,
  },
  editNameButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  saveNameButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.button,
  },
  saveNameButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: theme.fonts.bodySemiBold,
  },
  cancelText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontFamily: theme.fonts.body,
  },
  
  // Settings
  settingsSection: {
    backgroundColor: '#fff',
    marginBottom: 16,
    paddingVertical: 8,
  },
  settingsSectionTitle: {
    fontSize: 13,
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  settingItemText: {
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
  },
  
  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  logoutText: {
    fontSize: 16,
    fontFamily: theme.fonts.bodySemiBold,
    color: '#dc3545',
  },
  
  // App Version
  appVersion: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  appVersionText: {
    fontSize: 14,
    fontFamily: theme.fonts.title,
    color: theme.colors.textSecondary,
  },
  appVersionNumber: {
    fontSize: 12,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },

  // WebView
  webviewContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  webviewLoading: {
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
  webviewLoadingText: {
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
  donationIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  donationTitle: {
    fontSize: 24,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  donationSubtitle: {
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  donationCTAButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: theme.borderRadius.button,
    gap: 10,
  },
  donationCTAText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: theme.fonts.bodySemiBold,
  },
});
