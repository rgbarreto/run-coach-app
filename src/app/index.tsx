import React from 'react';
import { View, StyleSheet, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { LoginScreen } from '@/components/screens/LoginScreen';
import { AthleteShell } from '@/components/screens/AthleteShell';
import { TrainerShell } from '@/components/screens/TrainerShell';
import { AdminShell } from '@/components/screens/AdminShell';
import { Colors } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';

export default function HomeScreen() {
  const { user, loading } = useAuth();
  const scheme = useColorScheme();
  const themeColors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  if (loading) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color="#ff5722" />
        <ThemedText style={{ marginTop: 12 }}>Carregando sessão...</ThemedText>
      </View>
    );
  }

  // If user is not authenticated, render Login/Register
  if (!user) {
    return <LoginScreen />;
  }

  // Redirect to AthleteShell (personal training journal app)
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <AthleteShell />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
