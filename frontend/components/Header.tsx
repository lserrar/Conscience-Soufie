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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import theme from '@/constants/theme';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_3f80383a-d81a-4581-ad89-ad734daf5fe0/artifacts/xcg84shu_logo1.png';
const DONATION_URL = 'https://www.helloasso.com/associations/conscience-soufie/formulaires/1';

interface SearchResult {
  id: number;
  title: string;
  url: string;
  type: string;
}

export default function Header() {
  const insets = useSafeAreaInsets();
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [donationModalVisible, setDonationModalVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const openLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  return (
    <>
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {/* Left: Profile Button */}
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => setProfileModalVisible(true)}
            >
              <View style={styles.profileAvatar}>
                <Ionicons name="person" size={18} color="#fff" />
              </View>
            </TouchableOpacity>
            
            {/* Center: Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={{ uri: LOGO_URL }}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            
            {/* Right: Donation Button */}
            <TouchableOpacity
              style={styles.donationButton}
              onPress={() => setDonationModalVisible(true)}
            >
              <Ionicons name="gift" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {/* Gold accent line */}
          <View style={styles.goldLine} />
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
            <Text style={styles.modalHeaderTitle}>Profil</Text>
            <View style={styles.modalCloseButton} />
          </View>
          
          <ScrollView style={styles.profileContent} showsVerticalScrollIndicator={false}>
            {/* Profile Section */}
            <View style={styles.profileSection}>
              <View style={styles.profileAvatarLarge}>
                <Ionicons name="person" size={40} color="#fff" />
              </View>
              <Text style={styles.profileName}>Adhérent</Text>
              <Text style={styles.profileSubtext}>Membre Conscience Soufie</Text>
            </View>

            {/* Settings Sections */}
            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Paramètres</Text>
              
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
                onPress={() => openLink('https://consciencesoufie.com/mentions-legales/')}
              >
                <View style={styles.settingItemLeft}>
                  <Ionicons name="document-text-outline" size={22} color={theme.colors.primary} />
                  <Text style={styles.settingItemText}>Mentions légales</Text>
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
                onPress={() => openLink('https://consciencesoufie.com/qui-sommes-nous/')}
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

            {/* App Version */}
            <View style={styles.appVersion}>
              <Text style={styles.appVersionText}>Conscience Soufie</Text>
              <Text style={styles.appVersionNumber}>Version 1.0.0</Text>
            </View>
          </ScrollView>
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
              <Ionicons name="gift" size={32} color="#fff" />
            </View>
            <Text style={styles.modalTitle}>
              Soutenez Conscience Soufie{"\n"}pour ses 10 ans !
            </Text>
            <Text style={styles.modalSubtitle}>
              Votre don nous aide à poursuivre notre mission de transmission du soufisme.
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  goldLine: {
    height: 2,
    backgroundColor: theme.colors.gold,
  },
  
  // Profile Button (Left)
  profileButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  
  // Logo (Center)
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 40,
  },
  
  // Donation Button (Right)
  donationButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  
  // Profile Modal (Full Screen)
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
  },
  profileSubtext: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
  },
  
  // Settings Sections
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
  
  // Donation Modal (Popup)
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
    marginBottom: 12,
    lineHeight: 28,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
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
