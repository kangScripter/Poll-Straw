import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store/authStore';
import { userApi, UserProfile } from '@/services/api/userApi';
import { Button } from '@/components/common/Button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { ProfileSkeleton } from '@/components/common/SkeletonLoader';
import { useTheme } from '@/theme';
import { MainTabScreenNavigationProp, RootStackParamList } from '@/types';

type ProfileScreenProps = {
  navigation: MainTabScreenNavigationProp<'Profile'>;
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated]);

  const resetToLogin = () => {
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await userApi.getProfile();
      if (response.success && response.data) {
        setProfile(response.data.user);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            resetToLogin();
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your polls and data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await userApi.deleteAccount();
              Alert.alert('Account Deleted', 'Your account has been deleted');
              await logout();
              resetToLogin();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Ionicons name="person-circle-outline" size={64} color={theme.textTertiary} />
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Not Logged In</Text>
          <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>
            Please login to view your profile
          </Text>
          <Button
            title="Go to Login"
            onPress={() => navigation.navigate('Login')}
            size="md"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingTop: 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <ProfileSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: theme.primarySubtle, borderColor: theme.primary }]}>
            <Ionicons name="person" size={40} color={theme.primary} />
          </View>
          <Text style={[styles.name, { color: theme.textPrimary }]}>{user?.name || 'User'}</Text>
          <Text style={[styles.email, { color: theme.textSecondary }]}>{user?.email}</Text>
        </View>

        {/* Stats */}
        {profile && (
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]}>
              <Ionicons name="document-text" size={24} color={theme.primary} />
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>{profile.pollsCount || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Polls</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]}>
              <Ionicons name="checkmark-circle" size={24} color={theme.accent} />
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>{profile.votesCount || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Votes</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]}>
              <Ionicons name="calendar" size={24} color={theme.success} />
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>
                {profile.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Member Since</Text>
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View style={[styles.menuSection, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: theme.divider }]}
            onPress={() => navigation.navigate('MyPolls')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: theme.primarySubtle }]}>
                <Ionicons name="document-text-outline" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>My Polls</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: theme.divider }]}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: theme.accentSubtle }]}>
                <Ionicons name="create-outline" size={20} color={theme.accent} />
              </View>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: theme.divider }]}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: theme.successSubtle }]}>
                <Ionicons name="grid-outline" size={20} color={theme.success} />
              </View>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Dashboard</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </TouchableOpacity>

          {/* Theme Toggle */}
          <View style={[styles.menuItem, { borderBottomColor: theme.divider }]}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: theme.warningSubtle }]}>
                <Ionicons name="sunny-outline" size={20} color={theme.warning} />
              </View>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Theme</Text>
            </View>
            <ThemeToggle />
          </View>

          {user?.role === 'ADMIN' && (
            <>
              <View style={[styles.divider, { backgroundColor: theme.divider }]} />
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Admin</Text>
              <TouchableOpacity
                style={[styles.menuItem, { borderBottomColor: theme.divider }]}
                onPress={() => navigation.navigate('AdminDashboard')}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: theme.primarySubtle }]}>
                    <Ionicons name="shield-checkmark" size={20} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuText, { color: theme.textPrimary }]}>Admin Dashboard</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, { borderBottomColor: theme.divider }]}
                onPress={() => navigation.navigate('AdminModeration')}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: theme.warningSubtle }]}>
                    <Ionicons name="flag" size={20} color={theme.warning} />
                  </View>
                  <Text style={[styles.menuText, { color: theme.textPrimary }]}>Moderation</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            size="lg"
            leftIcon={<Ionicons name="log-out-outline" size={20} color={theme.error} />}
          />

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
          >
            <Ionicons name="trash-outline" size={20} color={theme.error} />
            <Text style={[styles.deleteButtonText, { color: theme.error }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  menuSection: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actions: {
    gap: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
