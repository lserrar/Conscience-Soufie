import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';

const LOGO_WHITE = require('@/assets/images/logo-cs-blanc.png');

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Animation sequence: fade in + scale up
    Animated.sequence([
      // First: fade in and initial scale
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0.9,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Then: grow larger
      Animated.timing(scaleAnim, {
        toValue: 1.15,
        duration: 2500,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after 5 seconds
    const timer = setTimeout(() => {
      router.replace('/auth');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={LOGO_WHITE}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 320,
    height: 120,
  },
});
