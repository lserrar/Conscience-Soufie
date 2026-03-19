import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import theme from '@/constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  // Calculate bottom padding: use safe area insets
  // Android with gesture navigation needs extra padding (minimum 48px)
  // Android with 3-button navigation needs even more (minimum 56px)
  const androidMinPadding = 48;
  const iosMinPadding = 20;
  const minPadding = Platform.OS === 'android' ? androidMinPadding : iosMinPadding;
  const bottomPadding = Math.max(insets.bottom, minPadding);
  const tabBarHeight = 60 + bottomPadding;

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
            paddingBottom: bottomPadding,
            paddingTop: 10,
            height: tabBarHeight,
          },
          tabBarLabelStyle: {
            fontFamily: theme.fonts.bodyMedium,
            fontSize: 11,
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginBottom: -2,
          },
          tabBarItemStyle: {
            flex: 1,
          },
        }}
        initialRouteName="accueil"
      >
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
