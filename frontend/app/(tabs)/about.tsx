import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import theme from '@/constants/theme';

export default function AboutScreen() {
  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Elegant Header */}
      <View style={styles.header}>
        <View style={styles.headerLine} />
        <Text style={styles.headerTitle}>À Propos</Text>
        <View style={styles.headerLine} />
      </View>

      {/* Greeting */}
      <Text style={styles.greeting}>Chère visiteuse, cher visiteur,</Text>
      
      {/* Drop Cap First Paragraph */}
      <View style={styles.dropCapContainer}>
        <Text style={styles.dropCap}>C</Text>
        <Text style={styles.dropCapText}>
          onscience Soufie est une association culturelle à but non lucratif.
        </Text>
      </View>

      <Text style={styles.paragraph}>
        Conscience Soufie ne s'inscrit pas dans un cadre confrérique et n'a pas vocation à se substituer aux fonctions, notamment initiatiques, des confréries existantes. Pour autant, elle valide d'évidence la pertinence du rattachement à un maître spirituel (homme ou femme) et à une chaîne initiatique (<Text style={styles.italic}>silsila</Text>) remontant au Prophète.
      </Text>

      <Text style={styles.paragraph}>
        <Text style={styles.bold}>Son but ?</Text> Celui de contribuer à une meilleure compréhension de l'islam et à l'épanouissement d'une spiritualité partagée, nourrie des valeurs soufies.
      </Text>

      {/* Section Divider */}
      <View style={styles.sectionDivider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerSymbol}>✦</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Son histoire */}
      <Text style={styles.sectionTitle}>Son histoire</Text>
      
      <Text style={styles.paragraph}>
        Le projet est né en 2015 ; il est le résultat de différents vœux convergents pour la création d'une institution consacrée à la diffusion des valeurs de l'islam et du soufisme pour le développement d'une conscience spirituelle. Une fondation basée à Genève vit le jour en 2016. Une équipe de quatre membres fondateurs, dont <Text style={styles.bold}>Éric Geoffroy</Text>, spécialiste du soufisme, traça les grands axes de son programme et rassembla autour d'elle quelques volontaires et sympathisants.
      </Text>

      {/* Section Divider */}
      <View style={styles.sectionDivider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerSymbol}>✦</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Son action */}
      <Text style={styles.sectionTitle}>Son action</Text>
      
      <Text style={styles.paragraph}>
        Aujourd'hui, Conscience Soufie est en France, et a évolué en association d'intérêt général afin d'alléger son fonctionnement. Elle accueille un public international et poursuit ses activités en suivant trois axes :
      </Text>

      {/* Les 3 axes - Editorial style */}
      <View style={styles.axeBlock}>
        <Text style={styles.axeNumber}>I</Text>
        <Text style={styles.axeTitle}>Transmission et Enseignement</Text>
        <Text style={styles.axeDescription}>
          Se déploie à travers de nombreuses conférences, en distanciel et gratuites, traitant de sujets variés, tous ancrés dans la spiritualité.
        </Text>
      </View>

      <View style={styles.axeBlock}>
        <Text style={styles.axeNumber}>II</Text>
        <Text style={styles.axeTitle}>Publication</Text>
        <Text style={styles.axeDescription}>
          Se concrétise par la réalisation d'une revue électronique et gratuite, des bibliographies, dossiers, articles, vidéos et podcasts mis en ligne.
        </Text>
      </View>

      <View style={styles.axeBlock}>
        <Text style={styles.axeNumber}>III</Text>
        <Text style={styles.axeTitle}>Voyages, Pérégrinations et Retraites</Text>
        <Text style={styles.axeDescription}>
          Une aventure spirituelle : chaque année, Conscience Soufie séjourne dans le désert marocain et part vers d'autres horizons – le Caire, de Fès à Tanger, d'Istanbul à Konya…
        </Text>
      </View>

      <Text style={styles.paragraph}>
        Conscience Soufie chemine pas à pas : l'équipe, dont tous les membres sont bénévoles, évolue selon les disponibilités des uns et des autres ; le public grandit et se fidélise.
      </Text>

      {/* Closing Section */}
      <View style={styles.closingSection}>
        <View style={styles.closingDivider} />
        <Text style={styles.welcomeText}>Nous vous souhaitons la Bienvenue !</Text>
        <Text style={styles.closingGreeting}>Bien fraternellement,</Text>
        <Text style={styles.signature}>Conscience Soufie</Text>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  contentContainer: {
    paddingHorizontal: 28,
    paddingTop: 32,
  },

  // Elegant Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1c679f',
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: theme.fonts.bodyMedium,
    color: '#1c679f',
    letterSpacing: 4,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
  },

  // Greeting
  greeting: {
    fontSize: 22,
    fontFamily: theme.fonts.titleBold,
    fontStyle: 'italic',
    color: '#1c679f',
    marginBottom: 28,
    textAlign: 'center',
  },

  // Drop Cap
  dropCapContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dropCap: {
    fontSize: 64,
    fontFamily: theme.fonts.titleBold,
    color: '#1c679f',
    lineHeight: 58,
    marginRight: 4,
    marginTop: -4,
  },
  dropCapText: {
    flex: 1,
    fontSize: 18,
    fontFamily: theme.fonts.title,
    color: '#2a2a2a',
    lineHeight: 28,
    paddingTop: 6,
  },

  // Paragraphs
  paragraph: {
    fontSize: 17,
    fontFamily: theme.fonts.title,
    color: '#2a2a2a',
    lineHeight: 28,
    marginBottom: 22,
    textAlign: 'justify',
  },
  
  bold: {
    fontFamily: theme.fonts.titleBold,
  },
  
  italic: {
    fontStyle: 'italic',
  },

  // Section Divider
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(28, 103, 159, 0.25)',
  },
  dividerSymbol: {
    fontSize: 12,
    color: '#1c679f',
    paddingHorizontal: 16,
  },

  // Section Titles
  sectionTitle: {
    fontSize: 26,
    fontFamily: theme.fonts.titleBold,
    color: '#1c679f',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 1,
  },

  // Axes - Editorial style with Roman numerals
  axeBlock: {
    marginBottom: 28,
    paddingLeft: 8,
  },
  axeNumber: {
    fontSize: 14,
    fontFamily: theme.fonts.title,
    color: '#1c679f',
    letterSpacing: 2,
    marginBottom: 6,
  },
  axeTitle: {
    fontSize: 19,
    fontFamily: theme.fonts.titleBold,
    color: '#2a2a2a',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  axeDescription: {
    fontSize: 16,
    fontFamily: theme.fonts.title,
    color: '#444444',
    lineHeight: 26,
    textAlign: 'justify',
  },

  // Closing Section
  closingSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  closingDivider: {
    width: 80,
    height: 2,
    backgroundColor: '#1c679f',
    marginBottom: 28,
  },
  welcomeText: {
    fontSize: 20,
    fontFamily: theme.fonts.titleBold,
    color: '#1c679f',
    marginBottom: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  closingGreeting: {
    fontSize: 16,
    fontFamily: theme.fonts.title,
    fontStyle: 'italic',
    color: '#666666',
    marginBottom: 8,
  },
  signature: {
    fontSize: 22,
    fontFamily: theme.fonts.titleBold,
    color: '#1c679f',
    letterSpacing: 1,
  },

  bottomSpacer: {
    height: 60,
  },
});
