import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import theme from '@/constants/theme';

export default function AboutScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const openLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
      }
    >
      {/* 10th Anniversary Banner */}
      <View style={styles.anniversaryBanner}>
        <View style={styles.anniversaryIcon}>
          <Ionicons name="sparkles" size={28} color={theme.colors.gold} />
        </View>
        <Text style={styles.anniversaryText}>10 ans de Conscience Soufie !</Text>
        <Text style={styles.anniversarySubtext}>2016 - 2026</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>À Propos</Text>
        <View style={styles.goldAccent} />
      </View>

      <View style={styles.contentCard}>
        <Text style={styles.heading}>Qui sommes-nous ?</Text>
        <Text style={styles.paragraph}>
          Conscience Soufie est une association qui a pour vocation de faire connaître la spiritualité soufie dans son universalité et son actualité.
        </Text>
        
        <Text style={styles.heading}>Nos missions</Text>
        <View style={styles.missionItem}>
          <View style={styles.bulletPoint} />
          <Text style={styles.missionText}>Organiser des conférences, séminaires et événements</Text>
        </View>
        <View style={styles.missionItem}>
          <View style={styles.bulletPoint} />
          <Text style={styles.missionText}>Diffuser la pensée soufie et ses enseignements</Text>
        </View>
        <View style={styles.missionItem}>
          <View style={styles.bulletPoint} />
          <Text style={styles.missionText}>Favoriser le dialogue interreligieux et interculturel</Text>
        </View>
        <View style={styles.missionItem}>
          <View style={styles.bulletPoint} />
          <Text style={styles.missionText}>Proposer un espace d'échange et de réflexion spirituelle</Text>
        </View>

        <Text style={styles.heading}>Notre histoire</Text>
        <Text style={styles.paragraph}>
          Fondée en 2016, Conscience Soufie célèbre cette année ses 10 ans d'existence. L'association a su créer une communauté dynamique autour des valeurs du soufisme : amour, connaissance, tolérance et ouverture spirituelle.
        </Text>

        <Text style={styles.heading}>Nos intervenants</Text>
        <Text style={styles.paragraph}>
          Nous accueillons régulièrement des chercheurs, universitaires, enseignants spirituels et artistes qui partagent leurs connaissances et expériences lors de nos événements.
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => openLink('https://www.helloasso.com/associations/conscience-soufie/adhesions/campagne-d-adhesion-2026')}
        >
          <Ionicons name="people-outline" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.primaryButtonText}>Devenir adhérent</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => openLink('https://consciencesoufie.com/contact/')}
        >
          <Ionicons name="mail-outline" size={20} color={theme.colors.primary} style={styles.buttonIcon} />
          <Text style={styles.secondaryButtonText}>Nous contacter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tertiaryButton}
          onPress={() => openLink('https://consciencesoufie.com/presentation/')}
        >
          <Ionicons name="globe-outline" size={20} color={theme.colors.primary} style={styles.buttonIcon} />
          <Text style={styles.tertiaryButtonText}>Voir sur le site web</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  anniversaryBanner: {
    backgroundColor: theme.colors.primary,
    padding: 24,
    borderRadius: theme.borderRadius.medium,
    marginBottom: 20,
    alignItems: 'center',
    ...theme.shadows.card,
  },
  anniversaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  anniversaryText: {
    color: '#fff',
    fontSize: 22,
    fontFamily: theme.fonts.titleBold,
    textAlign: 'center',
  },
  anniversarySubtext: {
    color: theme.colors.gold,
    fontSize: 16,
    fontFamily: theme.fonts.bodyMedium,
    marginTop: 4,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 28,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  goldAccent: {
    width: 60,
    height: 3,
    backgroundColor: theme.colors.gold,
    borderRadius: 2,
  },
  contentCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    padding: 20,
    marginBottom: 24,
    ...theme.shadows.card,
  },
  heading: {
    fontSize: 18,
    fontFamily: theme.fonts.title,
    color: theme.colors.primary,
    marginBottom: 10,
    marginTop: 20,
  },
  paragraph: {
    fontSize: 15,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
    lineHeight: 24,
    marginBottom: 8,
  },
  missionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingLeft: 4,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.gold,
    marginTop: 8,
    marginRight: 12,
  },
  missionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
    lineHeight: 22,
  },
  actionButtons: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: theme.borderRadius.button,
    marginBottom: 12,
    ...theme.shadows.card,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: theme.fonts.bodySemiBold,
  },
  secondaryButton: {
    backgroundColor: theme.colors.cardBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: theme.borderRadius.button,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: 17,
    fontFamily: theme.fonts.bodySemiBold,
  },
  tertiaryButton: {
    backgroundColor: theme.colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: theme.borderRadius.button,
    borderWidth: 1,
    borderColor: 'rgba(28,103,159,0.2)',
  },
  tertiaryButtonText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontFamily: theme.fonts.bodyMedium,
  },
  buttonIcon: {
    marginRight: 10,
  },
});
