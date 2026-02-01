import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from './src/store/authStore';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme/colors';

export default function App() {
  const { loadAuth, isLoading } = useAuthStore();
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadAuth().finally(() => {
      if (mounted) setHasInitialized(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!hasInitialized || isLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
  },
});
