import React, { useEffect, useRef, useMemo } from 'react';
import { ActivityIndicator, View, StyleSheet, Linking } from 'react-native';
import {
  NavigationContainer,
  NavigationContainerRef,
  LinkingOptions,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/theme';
import { CustomTabBar } from './CustomTabBar';
import { RootStackParamList, MainTabParamList } from '@/types';
import { buildSharePollUrl } from '@/utils/constants';

// Auth Screens
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { RegisterScreen } from '@/screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from '@/screens/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from '@/screens/auth/ResetPasswordScreen';

// Main Screens
import { HomeScreen } from '@/screens/home/HomeScreen';
import { CreatePollScreen } from '@/screens/poll/CreatePollScreen';
import { PollDetailScreen } from '@/screens/poll/PollDetailScreen';
import { ResultsScreen } from '@/screens/poll/ResultsScreen';
import { ShareScreen } from '@/screens/poll/ShareScreen';
import { DashboardScreen } from '@/screens/dashboard/DashboardScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { EditProfileScreen } from '@/screens/profile/EditProfileScreen';
import { EditPollScreen } from '@/screens/poll/EditPollScreen';
import { AdminDashboardScreen } from '@/screens/admin/AdminDashboardScreen';
import { AdminModerationScreen } from '@/screens/admin/AdminModerationScreen';
import { AdminUsersScreen } from '@/screens/admin/AdminUsersScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main Tab Navigator
const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Create" component={CreatePollScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const NavigationLoadingScreen: React.FC = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );
};

// Deep Linking Configuration
// Using React Native's built-in Linking module for better compatibility
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    'pollstraw://',
    'https://share.pollstraw.com',
    'https://pollstraw.com',
    'https://www.pollstraw.com',
  ],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Home: 'home',
          Create: 'create',
          Dashboard: 'dashboard',
          Profile: 'profile',
        },
      },
      PollDetail: {
        path: 'poll/:pollId',
        parse: {
          pollId: (pollId: string) => pollId,
        },
      },
      Results: {
        path: 'poll/:pollId/results',
        parse: {
          pollId: (pollId: string) => pollId,
        },
      },
      Share: {
        path: 'poll/:pollId/share',
        parse: {
          pollId: (pollId: string) => pollId,
        },
      },
      Login: 'login',
      Register: 'register',
    },
  },
};

// Main App Navigator
export const AppNavigator: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { theme, isDark } = useTheme();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  const navigationTheme = useMemo(
    () => ({
      ...(isDark ? DarkTheme : DefaultTheme),
      colors: {
        ...(isDark ? DarkTheme : DefaultTheme).colors,
        primary: theme.primary,
        background: theme.background,
        card: theme.surface,
        text: theme.textPrimary,
        border: theme.border,
        notification: theme.error,
      },
    }),
    [theme, isDark]
  );

  // Handle deep link when app is already open
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      console.log('Deep link received:', url);
      
      // Parse the URL and navigate
      const pollMatch = url.match(/poll\/([a-zA-Z0-9-_]+)/);
      if (pollMatch && pollMatch[1]) {
        const pollId = pollMatch[1];
        // Navigate to PollDetail with the pollId
        if (navigationRef.current) {
          navigationRef.current.navigate('PollDetail', { pollId });
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated]);

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      theme={navigationTheme}
      fallback={<NavigationLoadingScreen />}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen 
              name="ForgotPassword" 
              component={ForgotPasswordScreen}
              options={{
                headerShown: true,
                headerTitle: 'Forgot Password',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen 
              name="ResetPassword" 
              component={ResetPasswordScreen}
              options={{
                headerShown: true,
                headerTitle: 'Reset Password',
                headerBackTitle: 'Back',
              }}
            />
            {/* Guest-accessible poll screens (via deep links) */}
            <Stack.Screen
              name="PollDetail"
              component={PollDetailScreen}
              options={{
                headerShown: true,
                headerTitle: 'Poll',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="Results"
              component={ResultsScreen}
              options={{
                headerShown: true,
                headerTitle: 'Results',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="Share"
              component={ShareScreen}
              options={{
                headerShown: true,
                headerTitle: 'Share Poll',
                headerBackTitle: 'Back',
              }}
            />
          </>
        ) : (
          // Main Stack
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen 
              name="PollDetail" 
              component={PollDetailScreen}
              options={{
                headerShown: true,
                headerTitle: 'Poll',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen 
              name="CreatePoll" 
              component={CreatePollScreen}
              options={{
                headerShown: true,
                headerTitle: 'Create Poll',
                headerBackTitle: 'Back',
                presentation: 'modal',
              }}
            />
            <Stack.Screen 
              name="Results" 
              component={ResultsScreen}
              options={{
                headerShown: true,
                headerTitle: 'Results',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen 
              name="Share" 
              component={ShareScreen}
              options={{
                headerShown: true,
                headerTitle: 'Share Poll',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{
                headerShown: true,
                headerTitle: 'Edit Profile',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="EditPoll"
              component={EditPollScreen}
              options={{
                headerShown: true,
                headerTitle: 'Edit Poll',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen 
              name="MyPolls" 
              component={DashboardScreen}
              options={{
                headerShown: true,
                headerTitle: 'My Polls',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen 
              name="AdminDashboard" 
              component={AdminDashboardScreen}
              options={{
                headerShown: true,
                headerTitle: 'Admin Dashboard',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen 
              name="AdminModeration" 
              component={AdminModerationScreen}
              options={{
                headerShown: true,
                headerTitle: 'Moderation',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen 
              name="AdminUsers" 
              component={AdminUsersScreen}
              options={{
                headerShown: true,
                headerTitle: 'User Management',
                headerBackTitle: 'Back',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Export helper to generate shareable deep link URLs
export const getShareableUrl = (_pollId: string, shareUrl: string): string => {
  return buildSharePollUrl(shareUrl);
};

// Export helper to generate app deep link
export const getDeepLinkUrl = (pollId: string): string => {
  return `pollstraw://poll/${pollId}`;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
