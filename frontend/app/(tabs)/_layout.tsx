import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import Header from '@/components/Header';
import theme from '@/constants/theme';

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <Header />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#ffffff',
          tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
          tabBarStyle: {
            backgroundColor: theme.colors.primary,
            borderTopWidth: 0,
            paddingBottom: Platform.OS === 'ios' ? 24 : 10,
            paddingTop: 10,
            height: Platform.OS === 'ios' ? 88 : 68,
          },
          tabBarLabelStyle: {
            fontFamily: theme.fonts.bodyMedium,
            fontSize: 11,
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginBottom: -2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="accueil"
          options={{
            title: 'Accueil',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="blog"
          options={{
            title: 'Articles',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "newspaper" : "newspaper-outline"} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="podcasts"
          options={{
            title: 'Podcasts',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "headset" : "headset-outline"} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="live"
          options={{
            title: 'Zoom',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "videocam" : "videocam-outline"} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="about"
          options={{
            title: 'À Propos',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "information-circle" : "information-circle-outline"} size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
