import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
  Image,
  ScrollView,
  Switch,
  TextInput,
  FlatList,
  Keyboard,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import theme from '@/constants/theme';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_3f80383a-d81a-4581-ad89-ad734daf5fe0/artifacts/xcg84shu_logo1.png';
const DONATION_URL = 'https://www.helloasso.com/associations/conscience-soufie/formulaires/1';

// Social links
const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/ConscienceSoufie',
  instagram: 'https://www.instagram.com/conscience_soufie/',
  youtube: 'https://www.youtube.com/channel/UCK37umfJRkclvPvuVXFkjQA/videos',
  website: 'https://consciencesoufie.com/',
  spotify: 'https://open.spotify.com/show/3zKLZijUDiFANmWvH76fqa',
  soundcloud: 'https://soundcloud.com/user-431553500',
  apple: 'https://podcasts.apple.com/fr/podcast/conscience-soufie/id1447560870',
};

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
  const [donationPageVisible, setDonationPageVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
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

  const sendEmail = () => {
    Linking.openURL('mailto:info@consciencesoufie.com?subject=Contact depuis l\'application');
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

  return (
    <>
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {/* Left spacer for balance */}
            <View style={styles.sideSpace} />
            
            {/* Center: Logo (clickable for profile) */}
            <TouchableOpacity
              style={styles.logoButton}
              onPress={() => setProfileModalVisible(true)}
              data-testid="menu-btn"
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: LOGO_URL }}
                style={styles.logoBig}
                resizeMode="contain"
              />
            </TouchableOpacity>
            
            {/* Right: Search only */}
            <View style={styles.sideSpace}>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={() => setSearchModalVisible(true)}
                data-testid="search-btn"
                activeOpacity={0.8}
              >
                <Ionicons name="search" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Search Modal */}
      <Modal
        visible={searchModalVisible}
        animationType="slide"
        onRequestClose={closeSearchModal}
      >
        <View style={[styles.modalFullScreen, { paddingTop: insets.top }]}>
          {/* Search Header */}
          <View style={styles.searchHeader}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un article..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={performSearch}
                returnKeyType="search"
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={closeSearchModal} style={styles.searchCancelButton}>
              <Text style={styles.searchCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>

          {/* Search Results */}
          <View style={styles.searchContent}>
            {isSearching ? (
              <View style={styles.searchLoading}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.searchLoadingText}>Recherche en cours...</Text>
              </View>
            ) : hasSearched && searchResults.length === 0 ? (
              <View style={styles.searchEmpty}>
                <Ionicons name="search-outline" size={48} color={theme.colors.textSecondary} />
                <Text style={styles.searchEmptyText}>Aucun résultat trouvé</Text>
                <Text style={styles.searchEmptySubtext}>
                  Essayez avec d'autres mots-clés
                </Text>
              </View>
            ) : !hasSearched ? (
              <View style={styles.searchEmpty}>
                <Ionicons name="document-text-outline" size={48} color={theme.colors.textSecondary} />
                <Text style={styles.searchEmptyText}>Rechercher dans les articles</Text>
                <Text style={styles.searchEmptySubtext}>
                  Entrez un mot-clé et appuyez sur Entrée
                </Text>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.searchResultsList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => openSearchResult(item)}
                    activeOpacity={0.9}
                  >
                    {item._embedded?.['wp:featuredmedia']?.[0]?.source_url ? (
                      <Image
                        source={{ uri: item._embedded['wp:featuredmedia'][0].source_url }}
                        style={styles.searchResultImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.searchResultImage, styles.searchResultImagePlaceholder]}>
                        <Ionicons name="document-text" size={24} color={theme.colors.primary} />
                      </View>
                    )}
                    <View style={styles.searchResultContent}>
                      <Text style={styles.searchResultTitle} numberOfLines={2}>
                        {stripHTML(item.title.rendered)}
                      </Text>
                      <Text style={styles.searchResultExcerpt} numberOfLines={2}>
                        {stripHTML(item.excerpt.rendered)}
                      </Text>
                      <Text style={styles.searchResultDate}>{formatDate(item.date)}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Profile/Menu Modal - FNAC Style */}
      <Modal
        visible={profileModalVisible}
        animationType="slide"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={[styles.modalFullScreen, { paddingTop: 0 }]}>
          {/* Blue Header Section */}
          <View style={[styles.profileHeaderBlue, { paddingTop: insets.top + 16 }]}>
            <TouchableOpacity
              style={styles.closeButtonWhite}
              onPress={() => setProfileModalVisible(false)}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.profileHeaderContent}>
              <Image
                source={{ uri: LOGO_URL }}
                style={styles.profileLogo}
                resizeMode="contain"
              />
              {userName ? (
                <Text style={styles.welcomeText}>Bienvenue, {userName}</Text>
              ) : (
                <Text style={styles.welcomeText}>Bienvenue</Text>
              )}
            </View>
          </View>
          
          <ScrollView style={styles.profileContent} showsVerticalScrollIndicator={false}>
            {/* User Name Edit */}
            {!userName && (
              <View style={styles.addNameSection}>
                {isEditingName ? (
                  <View style={styles.editNameContainer}>
                    <TextInput
                      style={styles.nameInput}
                      value={tempUserName}
                      onChangeText={setTempUserName}
                      placeholder="Votre prénom"
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
                  <TouchableOpacity style={styles.addNameButton} onPress={() => setIsEditingName(true)}>
                    <Ionicons name="person-add-outline" size={20} color={theme.colors.primary} />
                    <Text style={styles.addNameText}>Ajouter votre prénom</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Préférences */}
            <View style={styles.menuSection}>
              <Text style={styles.menuSectionTitle}>Préférences</Text>
              
              <View style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Ionicons name="notifications-outline" size={22} color={theme.colors.textPrimary} />
                  <Text style={styles.menuItemText}>Notifications</Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#ddd', true: theme.colors.primary }}
                  thumbColor="#fff"
                />
              </View>

              {userName && (
                <TouchableOpacity style={styles.menuItem} onPress={() => setIsEditingName(true)}>
                  <View style={styles.menuItemLeft}>
                    <Ionicons name="person-outline" size={22} color={theme.colors.textPrimary} />
                    <Text style={styles.menuItemText}>Modifier mon prénom</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Confidentialité & Paramètres */}
            <View style={styles.menuSection}>
              <Text style={styles.menuSectionTitle}>Paramètres</Text>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => setPrivacyModalVisible(true)}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="shield-checkmark-outline" size={22} color={theme.colors.textPrimary} />
                  <Text style={styles.menuItemText}>Confidentialité</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => setTermsModalVisible(true)}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="document-text-outline" size={22} color={theme.colors.textPrimary} />
                  <Text style={styles.menuItemText}>Conditions d'utilisation</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* À propos */}
            <View style={styles.menuSection}>
              <Text style={styles.menuSectionTitle}>À propos</Text>
              
              <Pressable 
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                onPress={() => {
                  console.log('Don et adhésion pressed');
                  setDonationPageVisible(true);
                }}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="heart-outline" size={22} color={theme.colors.textPrimary} />
                  <Text style={styles.menuItemText}>Don et adhésion</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </Pressable>
              
              <Pressable 
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                onPress={navigateToAbout}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="information-circle-outline" size={22} color={theme.colors.textPrimary} />
                  <Text style={styles.menuItemText}>Qui sommes-nous</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </Pressable>
              
              <Pressable 
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                onPress={sendEmail}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name="mail-outline" size={22} color={theme.colors.textPrimary} />
                  <Text style={styles.menuItemText}>Nous contacter</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </Pressable>
            </View>

            {/* Réseaux sociaux */}
            <View style={styles.menuSection}>
              <Text style={styles.menuSectionTitle}>Suivez-nous</Text>
              
              <View style={styles.socialIconsContainer}>
                <TouchableOpacity 
                  style={styles.socialIcon}
                  onPress={() => openLink(SOCIAL_LINKS.website)}
                >
                  <Ionicons name="globe-outline" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.socialIcon}
                  onPress={() => openLink(SOCIAL_LINKS.facebook)}
                >
                  <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.socialIcon}
                  onPress={() => openLink(SOCIAL_LINKS.instagram)}
                >
                  <Ionicons name="logo-instagram" size={24} color="#E4405F" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.socialIcon}
                  onPress={() => openLink(SOCIAL_LINKS.youtube)}
                >
                  <Ionicons name="logo-youtube" size={24} color="#FF0000" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.socialIcon}
                  onPress={() => openLink(SOCIAL_LINKS.spotify)}
                >
                  <Ionicons name="musical-notes" size={24} color="#1DB954" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.socialIcon}
                  onPress={() => openLink(SOCIAL_LINKS.soundcloud)}
                >
                  <Ionicons name="cloud-outline" size={24} color="#FF5500" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.socialIcon}
                  onPress={() => openLink(SOCIAL_LINKS.apple)}
                >
                  <Ionicons name="logo-apple" size={24} color="#000" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Déconnexion */}
            {userName && (
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={22} color="#dc3545" />
                <Text style={styles.logoutText}>Se déconnecter</Text>
              </TouchableOpacity>
            )}

            {/* App Version */}
            <View style={styles.appVersion}>
              <Text style={styles.appVersionText}>Conscience Soufie</Text>
              <Text style={styles.appVersionNumber}>Version 1.0.0</Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={privacyModalVisible}
        animationType="slide"
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <View style={[styles.modalFullScreen, { paddingTop: insets.top }]}>
          <View style={styles.legalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setPrivacyModalVisible(false)}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.legalHeaderTitle}>Confidentialité</Text>
            <View style={styles.modalCloseButton} />
          </View>
          
          <ScrollView style={styles.legalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.legalTitle}>Politique de Confidentialité</Text>
            <Text style={styles.legalDate}>Dernière mise à jour : Mars 2026</Text>
            
            <Text style={styles.legalSectionTitle}>1. Collecte des données</Text>
            <Text style={styles.legalText}>
              L'application Conscience Soufie respecte votre vie privée. Nous collectons uniquement les données strictement nécessaires au fonctionnement de l'application :{'\n\n'}
              • Votre prénom (optionnel, stocké localement){'\n'}
              • Vos préférences de notifications{'\n'}
              • Données d'utilisation anonymisées
            </Text>
            
            <Text style={styles.legalSectionTitle}>2. Utilisation des données</Text>
            <Text style={styles.legalText}>
              Vos données sont utilisées exclusivement pour :{'\n\n'}
              • Personnaliser votre expérience{'\n'}
              • Améliorer nos services{'\n'}
              • Vous informer des nouveaux contenus (si vous l'avez autorisé)
            </Text>
            
            <Text style={styles.legalSectionTitle}>3. Protection des données</Text>
            <Text style={styles.legalText}>
              Conformément au Règlement Général sur la Protection des Données (RGPD), nous garantissons :{'\n\n'}
              • Le stockage sécurisé de vos informations{'\n'}
              • Aucune transmission à des tiers sans consentement{'\n'}
              • Votre droit d'accès, de rectification et de suppression
            </Text>
            
            <Text style={styles.legalSectionTitle}>4. Vos droits</Text>
            <Text style={styles.legalText}>
              Vous disposez à tout moment des droits suivants :{'\n\n'}
              • Accéder à vos données personnelles{'\n'}
              • Demander leur rectification ou suppression{'\n'}
              • Retirer votre consentement{'\n'}
              • Porter réclamation auprès de la CNIL{'\n\n'}
              Pour exercer ces droits, contactez-nous à : info@consciencesoufie.com
            </Text>
            
            <Text style={styles.legalSectionTitle}>5. Contact</Text>
            <Text style={styles.legalText}>
              Association Conscience Soufie{'\n'}
              Email : info@consciencesoufie.com{'\n'}
              Site web : consciencesoufie.com
            </Text>
          </ScrollView>
        </View>
      </Modal>

      {/* Terms of Use Modal */}
      <Modal
        visible={termsModalVisible}
        animationType="slide"
        onRequestClose={() => setTermsModalVisible(false)}
      >
        <View style={[styles.modalFullScreen, { paddingTop: insets.top }]}>
          <View style={styles.legalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setTermsModalVisible(false)}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.legalHeaderTitle}>Conditions d'utilisation</Text>
            <View style={styles.modalCloseButton} />
          </View>
          
          <ScrollView style={styles.legalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.legalTitle}>Conditions Générales d'Utilisation</Text>
            <Text style={styles.legalDate}>Dernière mise à jour : Mars 2026</Text>
            
            <Text style={styles.legalSectionTitle}>1. Objet</Text>
            <Text style={styles.legalText}>
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de l'application mobile Conscience Soufie, éditée par l'association culturelle Conscience Soufie.
            </Text>
            
            <Text style={styles.legalSectionTitle}>2. Acceptation des conditions</Text>
            <Text style={styles.legalText}>
              L'utilisation de l'application implique l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.
            </Text>
            
            <Text style={styles.legalSectionTitle}>3. Accès à l'application</Text>
            <Text style={styles.legalText}>
              L'application est accessible gratuitement à tout utilisateur disposant d'un appareil mobile compatible. L'association se réserve le droit de modifier, suspendre ou interrompre l'accès à tout ou partie de l'application.
            </Text>
            
            <Text style={styles.legalSectionTitle}>4. Propriété intellectuelle</Text>
            <Text style={styles.legalText}>
              L'ensemble des contenus présents sur l'application (textes, images, vidéos, podcasts) sont la propriété de Conscience Soufie ou de ses partenaires. Toute reproduction non autorisée est interdite.
            </Text>
            
            <Text style={styles.legalSectionTitle}>5. Responsabilité</Text>
            <Text style={styles.legalText}>
              L'association Conscience Soufie s'efforce de fournir des informations exactes et à jour. Toutefois, elle ne saurait être tenue responsable des erreurs, omissions ou résultats qui pourraient être obtenus par un mauvais usage de ces informations.
            </Text>
            
            <Text style={styles.legalSectionTitle}>6. Protection des données</Text>
            <Text style={styles.legalText}>
              Le traitement des données personnelles est régi par notre Politique de Confidentialité, accessible depuis l'application, en conformité avec le RGPD.
            </Text>
            
            <Text style={styles.legalSectionTitle}>7. Droit applicable</Text>
            <Text style={styles.legalText}>
              Les présentes CGU sont soumises au droit français. Tout litige relatif à leur interprétation ou exécution relève des tribunaux français compétents.
            </Text>
            
            <Text style={styles.legalSectionTitle}>8. Contact</Text>
            <Text style={styles.legalText}>
              Pour toute question concernant ces conditions, contactez-nous :{'\n\n'}
              Association Conscience Soufie{'\n'}
              Email : info@consciencesoufie.com{'\n'}
              Site web : consciencesoufie.com
            </Text>
          </ScrollView>
        </View>
      </Modal>

      {/* Donation Modal with WebView */}
      <Modal
        visible={donationPageVisible}
        animationType="slide"
        onRequestClose={() => setDonationPageVisible(false)}
      >
        <View style={[styles.modalFullScreen, { paddingTop: insets.top }]}>
          <View style={styles.legalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setDonationPageVisible(false)}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.legalHeaderTitle}>Don et adhésion</Text>
            <View style={styles.modalCloseButton} />
          </View>
          
          <ScrollView style={styles.donationContent} showsVerticalScrollIndicator={false}>
            {/* Elegant Header */}
            <View style={styles.donationPageHeader}>
              <View style={styles.donationIconLarge}>
                <Ionicons name="heart" size={40} color="#fff" />
              </View>
              <Text style={styles.donationPageTitle}>Soutenez Conscience Soufie</Text>
            </View>
            
            {/* Content */}
            <View style={styles.donationTextContainer}>
              <Text style={styles.donationGreeting}>Chers membres du Cercle Conscience Soufie,</Text>
              
              <Text style={styles.donationParagraph}>
                Votre adhésion à Conscience Soufie arrive à échéance le 31 décembre.
              </Text>
              
              <Text style={styles.donationParagraph}>
                Pour rappel, l'adhésion est annuelle, gratuite et vous permet d'assister à nos assemblées générales, mais également de recevoir les liens Zoom pour assister à nos événements en ligne.
              </Text>
              
              <Text style={styles.donationParagraph}>
                Votre soutien nous est précieux à plus d'un titre, et votre adhésion est essentielle à notre association. Nous espérons vous compter à nouveau parmi nos membres. Elle s'effectue en moins de 3 min sur le site HelloAsso.
              </Text>
              
              <View style={styles.donationHighlight}>
                <Ionicons name="gift-outline" size={24} color={theme.colors.primary} />
                <Text style={styles.donationHighlightText}>
                  Vous pouvez soutenir également nos actions en effectuant un don ponctuel ou régulier. Vos dons permettront à Conscience Soufie de pérenniser ses actions et l'encourageront à poursuivre ses efforts pour transmettre la sagesse universelle du soufisme à un large public.
                </Text>
              </View>
              
              <View style={styles.fiscalBox}>
                <Text style={styles.fiscalTitle}>Avantage fiscal</Text>
                <Text style={styles.fiscalText}>
                  L'association Conscience Soufie est une association loi 1901 d'intérêt général et à ce titre, elle est habilitée à délivrer des reçus fiscaux.
                </Text>
                <View style={styles.fiscalExample}>
                  <Text style={styles.fiscalExampleText}>
                    Donner <Text style={styles.fiscalBold}>50€</Text> ne vous coûte que <Text style={styles.fiscalBold}>17€</Text>
                  </Text>
                  <Text style={styles.fiscalSmall}>après déduction fiscale</Text>
                </View>
              </View>
              
              {/* CTA Button */}
              <TouchableOpacity
                style={styles.donationMainButton}
                onPress={() => openLink(DONATION_URL)}
              >
                <Ionicons name="heart" size={22} color="#fff" />
                <Text style={styles.donationMainButtonText}>Adhérer ou faire un don</Text>
              </TouchableOpacity>
              
              {/* Closing */}
              <View style={styles.donationClosing}>
                <Text style={styles.donationClosingText}>Bien fraternellement,</Text>
                <Text style={styles.donationSignature}>Conscience Soufie</Text>
              </View>
            </View>
          </ScrollView>
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
    paddingVertical: 8,
  },
  sideSpace: {
    width: 50,
    alignItems: 'flex-end',
  },
  logoButton: {
    flex: 1,
    alignItems: 'center',
  },
  logoBig: {
    width: 220,
    height: 55,
  },
  searchButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Search Modal Styles
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28,103,159,0.1)',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
  },
  searchCancelButton: {
    paddingVertical: 8,
  },
  searchCancelText: {
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.primary,
  },
  searchContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchLoadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
  },
  searchEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  searchEmptyText: {
    fontSize: 18,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    marginTop: 16,
    textAlign: 'center',
  },
  searchEmptySubtext: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  searchResultsList: {
    padding: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(28,103,159,0.1)',
  },
  searchResultImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  searchResultImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  searchResultTitle: {
    fontSize: 15,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    lineHeight: 20,
    marginBottom: 4,
  },
  searchResultExcerpt: {
    fontSize: 13,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  searchResultDate: {
    fontSize: 12,
    fontFamily: theme.fonts.body,
    color: theme.colors.gold,
  },
  
  // Modal Styles
  modalFullScreen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  // Profile Modal - FNAC Style
  profileHeaderBlue: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  closeButtonWhite: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  profileHeaderContent: {
    alignItems: 'center',
    paddingTop: 20,
  },
  profileLogo: {
    width: 200,
    height: 55,
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 18,
    fontFamily: theme.fonts.title,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
  },
  profileContent: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  
  // Add Name Section
  addNameSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  addNameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  addNameText: {
    fontSize: 15,
    fontFamily: theme.fonts.bodyMedium,
    color: theme.colors.primary,
  },
  editNameContainer: {
    alignItems: 'center',
  },
  nameInput: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
    width: '100%',
    marginBottom: 12,
  },
  editNameButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  saveNameButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
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
  
  // Menu Sections
  menuSection: {
    backgroundColor: '#fff',
    marginBottom: 8,
    paddingVertical: 8,
  },
  menuSectionTitle: {
    fontSize: 13,
    fontFamily: theme.fonts.bodySemiBold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemPressed: {
    backgroundColor: '#f5f5f5',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
  },
  
  // Social Icons
  socialIconsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  socialIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
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
    borderRadius: 8,
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
  
  // Legal Pages
  legalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28,103,159,0.1)',
    backgroundColor: '#fff',
  },
  legalHeaderTitle: {
    fontSize: 17,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
  },
  legalContent: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  legalTitle: {
    fontSize: 24,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  legalDate: {
    fontSize: 13,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginBottom: 24,
  },
  legalSectionTitle: {
    fontSize: 17,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.primary,
    marginTop: 24,
    marginBottom: 12,
  },
  legalText: {
    fontSize: 15,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
    lineHeight: 24,
  },
  
  // Donation Modal
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
    borderRadius: 8,
    gap: 10,
  },
  donationCTAText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: theme.fonts.bodySemiBold,
  },
  
  // Donation Page Elegant Styles
  donationContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  donationPageHeader: {
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  donationIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  donationPageTitle: {
    fontSize: 24,
    fontFamily: theme.fonts.titleBold,
    color: '#fff',
    textAlign: 'center',
  },
  donationTextContainer: {
    padding: 24,
  },
  donationGreeting: {
    fontSize: 18,
    fontFamily: theme.fonts.title,
    fontStyle: 'italic',
    color: theme.colors.textPrimary,
    marginBottom: 20,
  },
  donationParagraph: {
    fontSize: 15,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
    lineHeight: 24,
    marginBottom: 16,
  },
  donationHighlight: {
    flexDirection: 'row',
    backgroundColor: 'rgba(28,103,159,0.05)',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    padding: 16,
    marginVertical: 20,
    borderRadius: 4,
  },
  donationHighlightText: {
    flex: 1,
    fontSize: 15,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
    lineHeight: 24,
    marginLeft: 12,
  },
  fiscalBox: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 20,
    marginVertical: 20,
    alignItems: 'center',
  },
  fiscalTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.primary,
    marginBottom: 12,
  },
  fiscalText: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  fiscalExample: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  fiscalExampleText: {
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: '#fff',
  },
  fiscalBold: {
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 18,
  },
  fiscalSmall: {
    fontSize: 12,
    fontFamily: theme.fonts.body,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  donationMainButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    gap: 10,
    marginTop: 8,
  },
  donationMainButtonText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: theme.fonts.bodySemiBold,
  },
  donationClosing: {
    marginTop: 32,
    alignItems: 'center',
    paddingBottom: 40,
  },
  donationClosingText: {
    fontSize: 15,
    fontFamily: theme.fonts.title,
    fontStyle: 'italic',
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  donationSignature: {
    fontSize: 18,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.primary,
  },
});
