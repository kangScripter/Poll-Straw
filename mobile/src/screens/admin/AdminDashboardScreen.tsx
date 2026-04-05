import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { adminApi, AdminAnalytics } from '@/services/api/adminApi';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/common/Button';
import { AdminStatsSkeleton, SkeletonLoader } from '@/components/common/SkeletonLoader';
import { useTheme } from '@/theme';
import { RootStackParamList, Poll } from '@/types';

type AdminDashboardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getAnalytics();
      if (response.success && response.data) {
        setAnalytics(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="lock-closed" size={64} color={theme.error} />
          <Text style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorText}>You need admin privileges to access this screen</Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="outline"
            size="md"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading && !analytics) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <SkeletonLoader layout={[{ type: 'rect', width: '70%', height: 28, marginBottom: 8 }]} />
          <SkeletonLoader layout={[{ type: 'rect', width: '50%', height: 14, marginBottom: 24 }]} />
          <AdminStatsSkeleton />
          <SkeletonLoader layout={[{ type: 'rect', width: '40%', height: 20, marginBottom: 16 }]} />
          <SkeletonLoader layout={[{ type: 'rect', width: '100%', height: 72, marginBottom: 8 }]} />
          <SkeletonLoader layout={[{ type: 'rect', width: '100%', height: 72, marginBottom: 8 }]} />
          <SkeletonLoader layout={[{ type: 'rect', width: '100%', height: 72 }]} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>Platform analytics and overview</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => {
              const parent = navigation.getParent();
              if (parent) {
                parent.navigate('AdminModeration');
              } else {
                navigation.navigate('AdminModeration');
              }
            }}
          >
            <Ionicons name="shield-checkmark" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Overview Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: theme.primarySubtle }]}>
              <Ionicons name="document-text" size={24} color={theme.primary} />
            </View>
            <Text style={styles.statValue}>{analytics.overview.totalPolls.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Polls</Text>
            <Text style={styles.statChange}>+{analytics.today.polls} today</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: theme.accentSubtle }]}>
              <Ionicons name="checkmark-circle" size={24} color={theme.accent} />
            </View>
            <Text style={styles.statValue}>{analytics.overview.totalVotes.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Votes</Text>
            <Text style={styles.statChange}>+{analytics.today.votes} today</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: theme.successSubtle }]}>
              <Ionicons name="people" size={24} color={theme.success} />
            </View>
            <Text style={styles.statValue}>{analytics.overview.totalUsers.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
            <Text style={styles.statChange}>+{analytics.today.users} today</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: theme.warningSubtle }]}>
              <Ionicons name="alert-circle" size={24} color={theme.warning} />
            </View>
            <Text style={styles.statValue}>{analytics.overview.pendingReports}</Text>
            <Text style={styles.statLabel}>Pending Reports</Text>
            <Text style={styles.statChange}>Needs review</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => {
                const parent = navigation.getParent();
                if (parent) {
                  parent.navigate('AdminModeration');
                } else {
                  navigation.navigate('AdminModeration');
                }
              }}
            >
              <Ionicons name="shield-checkmark" size={28} color={theme.primary} />
              <Text style={styles.actionLabel}>Moderation</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => {
                const parent = navigation.getParent();
                if (parent) {
                  parent.navigate('AdminUsers');
                } else {
                  navigation.navigate('AdminUsers');
                }
              }}
            >
              <Ionicons name="people" size={28} color={theme.accent} />
              <Text style={styles.actionLabel}>Users</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => {
                const parent = navigation.getParent();
                if (parent) {
                  parent.navigate('AdminModeration', { filter: 'PENDING' });
                } else {
                  navigation.navigate('AdminModeration', { filter: 'PENDING' });
                }
              }}
            >
              <Ionicons name="flag" size={28} color={theme.warning} />
              <Text style={styles.actionLabel}>Reports</Text>
              {analytics.overview.pendingReports > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{analytics.overview.pendingReports}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Polls */}
        {analytics.topPolls && analytics.topPolls.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Polls by Votes</Text>
            {analytics.topPolls.map((poll, index) => (
              <TouchableOpacity
                key={poll.id}
                style={styles.pollItem}
                onPress={() => {
                  const parent = navigation.getParent();
                  if (parent) {
                    parent.navigate('PollDetail', { pollId: poll.id });
                  } else {
                    navigation.navigate('PollDetail', { pollId: poll.id });
                  }
                }}
              >
                <View style={styles.pollRank}>
                  <Text style={styles.pollRankText}>#{index + 1}</Text>
                </View>
                <View style={styles.pollInfo}>
                  <Text style={styles.pollTitle} numberOfLines={1}>
                    {poll.title}
                  </Text>
                  <View style={styles.pollMeta}>
                    <View style={styles.pollMetaItem}>
                      <Ionicons name="checkmark-circle" size={14} color={theme.textTertiary} />
                      <Text style={styles.pollMetaText}>{poll.totalVotes} votes</Text>
                    </View>
                    <View style={styles.pollMetaItem}>
                      <Ionicons name="eye" size={14} color={theme.textTertiary} />
                      <Text style={styles.pollMetaText}>{poll.viewCount} views</Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Recent Polls */}
        {analytics.recentPolls && analytics.recentPolls.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Polls</Text>
            {analytics.recentPolls.slice(0, 5).map((poll) => (
              <TouchableOpacity
                key={poll.id}
                style={styles.pollItem}
                onPress={() => {
                  const parent = navigation.getParent();
                  if (parent) {
                    parent.navigate('PollDetail', { pollId: poll.id });
                  } else {
                    navigation.navigate('PollDetail', { pollId: poll.id });
                  }
                }}
              >
                <View style={styles.pollInfo}>
                  <Text style={styles.pollTitle} numberOfLines={1}>
                    {poll.title}
                  </Text>
                  <Text style={styles.pollTime}>
                    {new Date(poll.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      gap: 16,
    },
    errorTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    errorText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.textPrimary,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textTertiary,
    },
    settingsButton: {
      padding: 8,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 24,
    },
    statCard: {
      width: '48%',
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      gap: 8,
    },
    statIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    statValue: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    statLabel: {
      fontSize: 12,
      color: theme.textTertiary,
      textTransform: 'uppercase',
    },
    statChange: {
      fontSize: 11,
      color: theme.success,
      fontWeight: '600',
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.textPrimary,
      marginBottom: 16,
    },
    actionsGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    actionCard: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      position: 'relative',
    },
    actionLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    badge: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: theme.error,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.textOnPrimary,
    },
    pollItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      gap: 12,
    },
    pollRank: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.primarySubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pollRankText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.primary,
    },
    pollInfo: {
      flex: 1,
    },
    pollTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.textPrimary,
      marginBottom: 4,
    },
    pollTime: {
      fontSize: 12,
      color: theme.textTertiary,
    },
    pollMeta: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 4,
    },
    pollMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    pollMetaText: {
      fontSize: 12,
      color: theme.textTertiary,
    },
  });
