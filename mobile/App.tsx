import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from './src/store/authStore';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/theme';

// Error Boundary class component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorBoundaryFallback
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    return this.props.children;
  }
}

function ErrorBoundaryFallback({ error, onRetry }: { error: Error | null; onRetry: () => void }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.errorBoundary, { backgroundColor: theme.background }]}>
      <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>Something went wrong</Text>
      <Text style={[styles.errorMessage, { color: theme.textSecondary }]}>{error?.message}</Text>
      <TouchableOpacity
        style={[styles.errorButton, { backgroundColor: theme.primary }]}
        onPress={onRetry}
      >
        <Text style={[styles.errorButtonText, { color: theme.textOnPrimary }]}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

function AppContent() {
  const { loadAuth, isLoading } = useAuthStore();
  const { theme, isDark } = useTheme();
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
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBoundary: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});
