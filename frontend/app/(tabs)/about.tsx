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

const PRIMARY_COLOR = '#1c679f';

interface Page {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
}

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
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY_COLOR]} />
      }
    >
      {/* 10th Anniversary Banner */}
      <View style={styles.anniversaryBanner}>
        <Text style={styles.anniversaryText}>🎉 10 ans de Conscience Soufie !</Text>
      </View>

      <Text style={styles.sectionTitle}>À Propos</Text>

      <View style={styles.contentCard}>
        <Text style={styles.heading}>Qui sommes-nous ?</Text>
        <Text style={styles.paragraph}>
          Conscience Soufie est une association qui a pour vocation de faire connaître la spiritualité soufie dans son universalité et son actualité.
        </Text>
        
        <Text style={styles.heading}>Nos missions</Text>
        <Text style={styles.paragraph}>
          • Organiser des conférences, séminaires et événements{"\n"}
          • Diffuser la pensée soufie et ses enseignements{"\n"}
          • Favoriser le dialogue interreligieux et interculturel{"\n"}
          • Proposer un espace d'échange et de réflexion spirituelle
        </Text>

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
          <Ionicons name="people" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.primaryButtonText}>Devenir adhérent</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => openLink('https://consciencesoufie.com/contact/')}
        >
          <Ionicons name="mail" size={20} color={PRIMARY_COLOR} style={styles.buttonIcon} />
          <Text style={styles.secondaryButtonText}>Nous contacter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tertiaryButton}
          onPress={() => openLink('https://consciencesoufie.com/presentation/')}
        >
          <Ionicons name="globe" size={20} color={PRIMARY_COLOR} style={styles.buttonIcon} />
          <Text style={styles.tertiaryButtonText}>Voir sur le site web</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  anniversaryBanner: {
    backgroundColor: PRIMARY_COLOR,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  anniversaryText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginBottom: 8,
    marginTop: 16,
  },
  paragraph: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
    marginBottom: 8,
  },
  actionButtons: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: PRIMARY_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: PRIMARY_COLOR,
    fontSize: 18,
    fontWeight: '600',
  },
  tertiaryButton: {
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tertiaryButtonText: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontWeight: '500',
  },
  buttonIcon: {
    marginRight: 8,
  },
});
