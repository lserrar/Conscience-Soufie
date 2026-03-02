import { Redirect } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import { View, ActivityIndicator } from 'react-native';
import { theme } from '@/constants/theme';

export default function Index() {
  const { profile, isLoading } = useUser();

  // Show loading while checking stored profile
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.primary }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // If user has a profile, go directly to tabs
  if (profile) {
    return <Redirect href="/(tabs)" />;
  }

  // Otherwise, show splash screen
  return <Redirect href="/splash" />;
}
