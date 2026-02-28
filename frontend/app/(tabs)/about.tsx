import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import theme from '@/constants/theme';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_3f80383a-d81a-4581-ad89-ad734daf5fe0/artifacts/xcg84shu_logo1.png';

export default function AboutScreen() {
  const openLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const openEmail = () => {
    Linking.openURL('mailto:info@consciencesoufie.com');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Logo */}
      <View style={styles.headerSection}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: LOGO_URL }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.headerSubtitle}>Association culturelle à but non lucratif</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.salutation}>Chère visiteuse, cher visiteur,</Text>
          
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Conscience Soufie</Text> est une association culturelle à but non lucratif.
          </Text>
          
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Conscience Soufie</Text> ne s'inscrit pas dans un cadre confrérique et n'a pas vocation à se substituer aux fonctions, notamment initiatiques, des confréries existantes. Pour autant, elle valide d'évidence la pertinence du rattachement à un maître spirituel (homme ou femme) et à une chaîne initiatique (<Text style={styles.italic}>silsila</Text>) remontant au Prophète.
          </Text>
          
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Son but ?</Text> Celui de contribuer à une meilleure compréhension de l'islam et à l'épanouissement d'une spiritualité partagée, nourrie des valeurs soufies.
          </Text>
        </View>

        {/* Son histoire */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Son histoire</Text>
          <View style={styles.goldAccent} />
          
          <Text style={styles.paragraph}>
            Le projet est né en 2015 ; il est le résultat de différents vœux convergents pour la création d'une institution consacrée à la diffusion des valeurs de l'islam et du soufisme pour le développement d'une conscience spirituelle.
          </Text>
          
          <Text style={styles.paragraph}>
            Une fondation basée à Genève vit le jour en 2016. Une équipe de quatre membres fondateurs, dont Éric Geoffroy, spécialiste du soufisme, traça les grands axes de son programme et rassembla autour d'elle quelques volontaires et sympathisants.
          </Text>
        </View>

        {/* Son action */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Son action</Text>
          <View style={styles.goldAccent} />
          
          <Text style={styles.paragraph}>
            Aujourd'hui, <Text style={styles.italic}>Conscience Soufie</Text> est en France, et a évolué en association d'intérêt général afin d'alléger son fonctionnement. Elle accueille un public international et poursuit ses activités en suivant trois axes :
          </Text>
          
          {/* Axe 1 */}
          <View style={styles.axeCard}>
            <View style={styles.axeHeader}>
              <Ionicons name="school-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.axeTitle}>Transmission et Enseignement</Text>
            </View>
            <Text style={styles.axeText}>
              De nombreuses conférences, en distanciel et gratuites, traitant de sujets variés, tous ancrés dans la spiritualité. Des veillées spirituelles, ouvertes à tous, ponctuent régulièrement l'année. Enfin, des ateliers de calligraphie permettent de toucher du doigt la beauté de la langue arabe.
            </Text>
          </View>
          
          {/* Axe 2 */}
          <View style={styles.axeCard}>
            <View style={styles.axeHeader}>
              <Ionicons name="book-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.axeTitle}>Publication</Text>
            </View>
            <Text style={styles.axeText}>
              Une revue électronique et gratuite, avec une version papier raffinée offerte lors de certains événements. Des bibliographies, des dossiers et de nombreux articles sont également mis en ligne sur le site ainsi que les vidéos et les podcasts des conférences et des enseignements des veillées.
            </Text>
          </View>
          
          {/* Axe 3 */}
          <View style={styles.axeCard}>
            <View style={styles.axeHeader}>
              <Ionicons name="airplane-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.axeTitle}>Voyages et Retraites</Text>
            </View>
            <Text style={styles.axeText}>
              Chaque année, Conscience Soufie séjourne dans le désert marocain pour offrir une expérience de vide et de plein vivifiants. Elle est déjà partie vers d'autres horizons – le Caire, de Fès à Tanger, d'Istanbul à Konya… – afin de faire goûter à la sagesse du soufisme.
            </Text>
          </View>
        </View>

        {/* Closing */}
        <View style={styles.section}>
          <Text style={styles.paragraph}>
            Conscience Soufie chemine pas à pas : l'équipe, dont tous les membres sont bénévoles, évolue selon les disponibilités des uns et des autres, le cercle ne cesse de s'enrichir ; le public grandit et se fidélise ; les dons, petits et grands, permettent de financer les frais de fonctionnement, et Conscience Soufie exprime à tous ses généreux donateurs son immense gratitude.
          </Text>
          
          <Text style={styles.welcome}>Nous vous souhaitons la Bienvenue !</Text>
          
          <Text style={styles.signature}>
            Bien fraternellement,{"\n"}
            <Text style={styles.bold}>Conscience Soufie</Text>
          </Text>
        </View>

        {/* Contact Info */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Nous contacter</Text>
          <View style={styles.goldAccentSmall} />
          
          <View style={styles.contactInfo}>
            <View style={styles.contactRow}>
              <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.contactText}>
                14 avenue de l'opéra{"\n"}
                75001 PARIS
              </Text>
            </View>
            
            <TouchableOpacity style={styles.contactRow} onPress={openEmail}>
              <Ionicons name="mail-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.contactText, styles.contactLink]}>info@consciencesoufie.com</Text>
            </TouchableOpacity>
          </View>
          
          {/* Social Links */}
          <View style={styles.socialLinks}>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => openLink('https://www.facebook.com/ConscienceSoufie')}
            >
              <Ionicons name="logo-facebook" size={24} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => openLink('https://twitter.com/ConscienceSoufi/')}
            >
              <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => openLink('https://www.youtube.com/channel/UCK37umfJRkclvPvuVXFkjQA')}
            >
              <Ionicons name="logo-youtube" size={24} color="#FF0000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaSection}>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => openLink('https://www.helloasso.com/associations/conscience-soufie/adhesions/campagne-d-adhesion-2025')}
          >
            <Ionicons name="people" size={20} color="#fff" />
            <Text style={styles.ctaButtonText}>Devenir adhérent</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.ctaButton, styles.ctaButtonSecondary]}
            onPress={() => openLink('https://www.helloasso.com/associations/conscience-soufie/formulaires/1')}
          >
            <Ionicons name="heart" size={20} color={theme.colors.primary} />
            <Text style={[styles.ctaButtonText, styles.ctaButtonTextSecondary]}>Faire un don</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerSection: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 32,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 12,
  },
  logo: {
    width: 200,
    height: 60,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  salutation: {
    fontSize: 18,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  paragraph: {
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
    lineHeight: 26,
    marginBottom: 16,
    textAlign: 'justify',
  },
  bold: {
    fontFamily: theme.fonts.bodySemiBold,
  },
  italic: {
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  goldAccent: {
    width: 50,
    height: 3,
    backgroundColor: theme.colors.gold,
    borderRadius: 2,
    marginBottom: 16,
  },
  goldAccentSmall: {
    width: 40,
    height: 2,
    backgroundColor: theme.colors.gold,
    borderRadius: 2,
    marginBottom: 16,
  },
  
  // Axe Cards
  axeCard: {
    backgroundColor: 'rgba(28,103,159,0.04)',
    borderRadius: theme.borderRadius.medium,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  axeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  axeTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.primary,
  },
  axeText: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
    lineHeight: 22,
  },
  
  // Closing
  welcome: {
    fontSize: 18,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.primary,
    textAlign: 'center',
    marginVertical: 20,
  },
  signature: {
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  
  // Contact
  contactSection: {
    backgroundColor: 'rgba(28,103,159,0.04)',
    borderRadius: theme.borderRadius.medium,
    padding: 20,
    marginBottom: 20,
  },
  contactTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  contactInfo: {
    gap: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  contactText: {
    fontSize: 15,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
    lineHeight: 22,
  },
  contactLink: {
    color: theme.colors.primary,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // CTA Buttons
  ctaSection: {
    gap: 12,
    marginBottom: 20,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.button,
    gap: 10,
  },
  ctaButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  ctaButtonText: {
    fontSize: 16,
    fontFamily: theme.fonts.bodySemiBold,
    color: '#fff',
  },
  ctaButtonTextSecondary: {
    color: theme.colors.primary,
  },
  
  bottomSpacer: {
    height: 20,
  },
});
