import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import theme from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Hero image from the website
const HERO_IMAGE = 'https://consciencesoufie.com/wp-content/uploads/2019/07/IMG_9119-2.jpg';

export default function AboutScreen() {
  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Image
          source={{ uri: HERO_IMAGE }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Présentation</Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentSection}>
        {/* Greeting */}
        <Text style={styles.greeting}>Chère visiteuse, cher visiteur,</Text>
        
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Conscience Soufie</Text> est une association culturelle à but non lucratif.
        </Text>

        <Text style={styles.paragraph}>
          Conscience Soufie ne s'inscrit pas dans un cadre confrérique et n'a pas vocation à se substituer aux fonctions, notamment initiatiques, des confréries existantes. Pour autant, elle valide d'évidence la pertinence du rattachement à un maître spirituel (homme ou femme) et à une chaîne initiatique (<Text style={styles.italic}>silsila</Text>) remontant au Prophète.
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Son but ?</Text> Celui de contribuer à une meilleure compréhension de l'islam et à l'épanouissement d'une spiritualité partagée, nourrie des valeurs soufies.
        </Text>

        {/* Son histoire */}
        <Text style={styles.sectionTitle}>Son histoire</Text>
        <View style={styles.goldLine} />
        
        <Text style={styles.paragraph}>
          Le projet est né en 2015 ; il est le résultat de différents vœux convergents pour la création d'une institution consacrée à la diffusion des valeurs de l'islam et du soufisme pour le développement d'une conscience spirituelle. Une fondation basée à Genève vit le jour en 2016. Une équipe de quatre membres fondateurs, dont <Text style={styles.bold}>Éric Geoffroy</Text>, spécialiste du soufisme, traça les grands axes de son programme et rassembla autour d'elle quelques volontaires et sympathisants.
        </Text>

        {/* Son action */}
        <Text style={styles.sectionTitle}>Son action</Text>
        <View style={styles.goldLine} />
        
        <Text style={styles.paragraph}>
          Aujourd'hui, Conscience Soufie est en France, et a évolué en association d'intérêt général afin d'alléger son fonctionnement. Elle accueille un public international et poursuit ses activités en suivant trois axes :
        </Text>

        {/* Axe 1 */}
        <View style={styles.axeContainer}>
          <View style={styles.axeNumber}>
            <Text style={styles.axeNumberText}>1</Text>
          </View>
          <View style={styles.axeContent}>
            <Text style={styles.axeTitle}>Transmission et Enseignement</Text>
            <Text style={styles.axeDescription}>
              Se déploie à travers de nombreuses conférences, en distanciel et gratuites, traitant de sujets variés, tous ancrés dans la spiritualité.
            </Text>
          </View>
        </View>

        {/* Axe 2 */}
        <View style={styles.axeContainer}>
          <View style={styles.axeNumber}>
            <Text style={styles.axeNumberText}>2</Text>
          </View>
          <View style={styles.axeContent}>
            <Text style={styles.axeTitle}>Publication</Text>
            <Text style={styles.axeDescription}>
              Se concrétise par la réalisation d'une revue électronique et gratuite, des bibliographies, dossiers, articles, vidéos et podcasts mis en ligne.
            </Text>
          </View>
        </View>

        {/* Axe 3 */}
        <View style={styles.axeContainer}>
          <View style={styles.axeNumber}>
            <Text style={styles.axeNumberText}>3</Text>
          </View>
          <View style={styles.axeContent}>
            <Text style={styles.axeTitle}>Voyages, Pérégrinations et Retraites</Text>
            <Text style={styles.axeDescription}>
              Une aventure spirituelle : chaque année, Conscience Soufie séjourne dans le désert marocain et part vers d'autres horizons – le Caire, de Fès à Tanger, d'Istanbul à Konya…
            </Text>
          </View>
        </View>

        <Text style={styles.paragraph}>
          Conscience Soufie chemine pas à pas : l'équipe, dont tous les membres sont bénévoles, évolue selon les disponibilités des uns et des autres ; le public grandit et se fidélise.
        </Text>

        {/* Closing */}
        <View style={styles.closingSection}>
          <Text style={styles.welcomeText}>Nous vous souhaitons la Bienvenue !</Text>
          <Text style={styles.closingGreeting}>Bien fraternellement,</Text>
          <Text style={styles.signature}>Conscience Soufie</Text>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  // Hero Section
  heroSection: {
    width: SCREEN_WIDTH,
    height: 220,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28, 103, 159, 0.6)',
  },
  heroContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontFamily: theme.fonts.titleBold,
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 3,
  },

  // Content Section
  contentSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  
  greeting: {
    fontSize: 18,
    fontFamily: theme.fonts.titleBold,
    fontStyle: 'italic',
    color: theme.colors.primary,
    marginBottom: 20,
  },
  
  paragraph: {
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: '#333333',
    lineHeight: 26,
    marginBottom: 18,
    textAlign: 'justify',
  },
  
  bold: {
    fontFamily: theme.fonts.bodySemiBold,
    fontWeight: '600',
  },
  
  italic: {
    fontStyle: 'italic',
  },
  
  // Section Titles
  sectionTitle: {
    fontSize: 22,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.primary,
    marginTop: 28,
    marginBottom: 8,
  },
  
  goldLine: {
    width: 50,
    height: 3,
    backgroundColor: theme.colors.gold,
    marginBottom: 20,
    borderRadius: 2,
  },

  // Axes (3 pillars)
  axeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingLeft: 4,
  },
  axeNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  axeNumberText: {
    fontSize: 16,
    fontFamily: theme.fonts.bodySemiBold,
    color: '#ffffff',
  },
  axeContent: {
    flex: 1,
  },
  axeTitle: {
    fontSize: 17,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  axeDescription: {
    fontSize: 15,
    fontFamily: theme.fonts.body,
    color: '#555555',
    lineHeight: 23,
    textAlign: 'justify',
  },

  // Closing Section
  closingSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(28, 103, 159, 0.15)',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  closingGreeting: {
    fontSize: 16,
    fontFamily: theme.fonts.body,
    fontStyle: 'italic',
    color: '#666666',
    marginBottom: 8,
  },
  signature: {
    fontSize: 20,
    fontFamily: theme.fonts.titleBold,
    color: theme.colors.primary,
  },

  bottomSpacer: {
    height: 60,
  },
});
