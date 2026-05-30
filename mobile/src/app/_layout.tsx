import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { ActivityIndicator, View, StatusBar } from 'react-native';

export default function RootLayout() {
  const { isAuthenticated, initialize, loading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Load the authenticated session from SecureStore on startup
  useEffect(() => {
    initialize();
  }, []);

  // Monitor auth status and route accordingly
  useEffect(() => {
    if (loading) return;

    // Cast to string[] because typed routes generates a strict tuple type
    // that doesn't account for all possible runtime segment values (login, register, etc.)
    const segs = segments as string[];

    const inTabsGroup = segs[0] === '(tabs)';
    const inAnalysisDetail = segs[0] === 'analysis';

    if (isAuthenticated) {
      // If user is authenticated but not in the tabs layout or analysis detail, route them to dashboard
      if (!inTabsGroup && !inAnalysisDetail) {
        router.replace('/(tabs)/dashboard');
      }
    } else {
      // If user is NOT authenticated, keep them on the auth flow (Welcome, Login, or Register)
      const isAuthScreen = segs[0] === 'login' || segs[0] === 'register' || segs.length === 0;
      if (!isAuthScreen) {
        router.replace('/');
      }
    }
  }, [isAuthenticated, segments, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#a855f7" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0f172a',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: '#020617',
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Sign In', headerBackTitle: 'Back' }} />
        <Stack.Screen name="register" options={{ title: 'Sign Up', headerBackTitle: 'Back' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="analysis/[id]" 
          options={{ 
            title: 'Audit Report', 
            headerBackTitle: 'Back',
            headerStyle: { backgroundColor: '#0f172a' } 
          }} 
        />
      </Stack>
    </>
  );
}
