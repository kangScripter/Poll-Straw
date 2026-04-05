import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { PollCardSkeleton } from '@/components/common/SkeletonLoader';
import { hapticSelection } from '@/utils/haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePollStore } from '@/store/pollStore';
import { useAuthStore } from '@/store/authStore';
import { PollCard } from '@/components/poll/PollCard';
import { Button } from '@/components/common/Button';
import { useTheme } from '@/theme';
import { MainTabScreenNavigationProp, Poll } from '@/types';

type DashboardScreenProps = {
  navigation: MainTabScreenNavigationProp<'Dashboard'>;
};

type PollFilter = 'all' | 'active' | 'closed';

const FILTER_CHIPS: { key: PollFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'closed', label: 'Closed' },
];

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuthStore();
  const { userPolls, userPollsPagination, fetchUserPolls, isLoading, error } = usePollStore();
  const [refreshing, setRefreshing] = useState(false);
  const [pollFilter, setPollFilter] = useState<PollFilter>('all');

  const filteredPolls = useMemo(() => {
    if (pollFilter === 'all') return userPolls;
    if (pollFilter === 'active') return userPolls.filter((p) => p.isActive);
    return userPolls.filter((p) => !p.isActive);
  }, [userPolls, pollFilter]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserPolls(1);
    }
  }, [isAuthenticated]);

  // Refetch when screen gains focus (e.g. after creating a poll)
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        fetchUserPolls(1);
      }
    }, [isAuthenticated])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUserPolls(1);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (userPollsPagination?.hasNext && !isLoading) {
      fetchUserPolls((userPollsPagination.page || 1) + 1);
    }
  };

  const handlePollPress = (poll: Poll) => {
    navigation.navigate('PollDetail', { pollId: poll.id });
  };

  const handleCreatePoll = () => {
    navigation.navigate('CreatePoll');
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Ionicons name="lock-closed-outline" size={64} color={theme.textTertiary} />
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Login Required</Text>
          <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>
            Please login to view and manage your polls
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

  if (isLoading && userPolls.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>My Polls</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Loading…</Text>
          </View>
        </View>
        <View style={styles.skeletonList}>
          <PollCardSkeleton />
          <PollCardSkeleton />
          <PollCardSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>My Polls</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {userPollsPagination?.total || 0} total polls
          </Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreatePoll}
        >
          <Ionicons name="add-circle" size={28} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      {userPolls.length > 0 && (
        <View style={styles.chipsRow}>
          {FILTER_CHIPS.map(({ key, label }) => {
            const active = pollFilter === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => {
                  hapticSelection();
                  setPollFilter(key);
                }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? theme.primary : theme.surfaceSubtle,
                    borderColor: active ? theme.primary : theme.border,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    { color: active ? theme.textOnPrimary : theme.textSecondary },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Stats */}
      {userPolls.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]}>
            <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>
              {userPolls.reduce((sum, poll) => sum + poll.totalVotes, 0)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Votes</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]}>
            <Ionicons name="eye" size={20} color={theme.accent} />
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>
              {userPolls.reduce((sum, poll) => sum + poll.viewCount, 0)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Views</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]}>
            <Ionicons name="time" size={20} color={theme.success} />
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>
              {userPolls.filter((poll) => poll.isActive).length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Active</Text>
          </View>
        </View>
      )}

      {/* Polls List */}
      {userPolls.length === 0 ? (
        <View style={styles.emptyContainer}>
          {error ? (
            <>
              <Ionicons name="alert-circle-outline" size={64} color={theme.error} />
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Could not load polls</Text>
              <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>{error}</Text>
              <Button
                title="Retry"
                onPress={() => fetchUserPolls(1)}
                variant="outline"
                size="md"
              />
            </>
          ) : (
            <>
              <Ionicons name="document-text-outline" size={64} color={theme.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Polls Yet</Text>
              <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>
                Create your first poll to get started
              </Text>
              <Button
                title="Create Poll"
                onPress={handleCreatePoll}
                size="md"
              />
            </>
          )}
        </View>
      ) : filteredPolls.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="funnel-outline" size={48} color={theme.textTertiary} />
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Polls in This Filter</Text>
          <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>
            {pollFilter === 'active'
              ? 'You have no active polls right now.'
              : 'You have no closed polls yet.'}
          </Text>
          <Button title="Show all polls" onPress={() => setPollFilter('all')} variant="outline" size="md" />
        </View>
      ) : (
        <FlatList
          data={filteredPolls}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PollCard poll={item} onPress={() => handlePollPress(item)} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoading && userPolls.length > 0 ? (
              <View style={styles.footer}>
                <ActivityIndicator size="small" color={theme.primary} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            error ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
                <Button
                  title="Retry"
                  onPress={() => fetchUserPolls(1)}
                  variant="outline"
                  size="sm"
                />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  createButton: {
    padding: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
  },
  skeletonList: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 12,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
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
    marginBottom: 8,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
