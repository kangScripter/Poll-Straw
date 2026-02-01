import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, View, StyleSheet, Linking, Platform } from 'react-native';
import { NavigationContainer, NavigationContainerRef, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme/colors';
import { RootStackParamList, MainTabParamList } from '@/types';

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
import { AdminDashboardScreen } from '@/screens/admin/AdminDashboardScreen';
import { AdminModerationScreen } from '@/screens/admin/AdminModerationScreen';
import { AdminUsersScreen } from '@/screens/admin/AdminUsersScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main Tab Navigator
const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Create':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'Dashboard':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.gray[200],
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Create" component={CreatePollScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Loading Screen
const LoadingScreen: React.FC = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={colors.primary[500]} />
  </View>
);

// Deep Linking Configuration
// Using React Native's built-in Linking module for better compatibility
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    'pollstraw://',
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
  const { isAuthenticated, isLoading, loadAuth } = useAuthStore();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    loadAuth();
  }, []);

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

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      fallback={<LoadingScreen />}
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
export const getShareableUrl = (pollId: string, shareUrl: string): string => {
  // Use the web URL that will redirect to app or show install page
  return `https://pollstraw.com/poll/${shareUrl}`;
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
    backgroundColor: colors.white,
  },
});
