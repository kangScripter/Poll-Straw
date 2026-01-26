import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { adminApi, AdminAnalytics } from '@/services/api/adminApi';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/common/Button';
import { colors } from '@/theme/colors';
import { RootStackParamList, Poll } from '@/types';

type AdminDashboardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
          <Ionicons name="lock-closed" size={64} color={colors.error} />
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
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
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
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
            <Ionicons name="shield-checkmark" size={24} color={colors.primary[500]} />
          </TouchableOpacity>
        </View>

        {/* Overview Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.primary[50] }]}>
              <Ionicons name="document-text" size={24} color={colors.primary[500]} />
            </View>
            <Text style={styles.statValue}>{analytics.overview.totalPolls.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Polls</Text>
            <Text style={styles.statChange}>+{analytics.today.polls} today</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.secondary[50] }]}>
              <Ionicons name="checkmark-circle" size={24} color={colors.secondary[500]} />
            </View>
            <Text style={styles.statValue}>{analytics.overview.totalVotes.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Votes</Text>
            <Text style={styles.statChange}>+{analytics.today.votes} today</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="people" size={24} color={colors.success} />
            </View>
            <Text style={styles.statValue}>{analytics.overview.totalUsers.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
            <Text style={styles.statChange}>+{analytics.today.users} today</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.warning + '15' }]}>
              <Ionicons name="alert-circle" size={24} color={colors.warning} />
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
              <Ionicons name="shield-checkmark" size={28} color={colors.primary[500]} />
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
              <Ionicons name="people" size={28} color={colors.secondary[500]} />
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
              <Ionicons name="flag" size={28} color={colors.warning} />
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
                      <Ionicons name="checkmark-circle" size={14} color={colors.gray[500]} />
                      <Text style={styles.pollMetaText}>{poll.totalVotes} votes</Text>
                    </View>
                    <View style={styles.pollMetaItem}>
                      <Ionicons name="eye" size={14} color={colors.gray[500]} />
                      <Text style={styles.pollMetaText}>{poll.viewCount} views</Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
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
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray[600],
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
    color: colors.gray[900],
  },
  errorText: {
    fontSize: 16,
    color: colors.gray[600],
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
    color: colors.gray[900],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[500],
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
    backgroundColor: colors.white,
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
    color: colors.gray[900],
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray[500],
    textTransform: 'uppercase',
  },
  statChange: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.white,
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
    color: colors.gray[700],
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.error,
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
    color: colors.white,
  },
  pollItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  pollRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pollRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary[500],
  },
  pollInfo: {
    flex: 1,
  },
  pollTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 4,
  },
  pollTime: {
    fontSize: 12,
    color: colors.gray[500],
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
    color: colors.gray[500],
  },
});
