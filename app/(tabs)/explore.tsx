import { useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we redirect
SplashScreen.preventAutoHideAsync();

export default function TabTwoScreen() {
  const router = useRouter();

  const handleRedirect = useCallback(() => {
    router.replace('/cart');
  }, [router]);

  useEffect(() => {
    handleRedirect();
  }, [handleRedirect]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <Ionicons name="arrow-forward" size={40} color="#E50914" />
      <ThemedText style={{ color: '#fff', marginTop: 20 }}>Redirecting to Cart...</ThemedText>
    </View>
  );
}

