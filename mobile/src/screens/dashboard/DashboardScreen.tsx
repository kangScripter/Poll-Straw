import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePollStore } from '@/store/pollStore';
import { useAuthStore } from '@/store/authStore';
import { PollCard } from '@/components/poll/PollCard';
import { Button } from '@/components/common/Button';
import { colors } from '@/theme/colors';
import { RootStackParamList, Poll } from '@/types';

type DashboardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { isAuthenticated } = useAuthStore();
  const { userPolls, userPollsPagination, fetchUserPolls, isLoading, error } = usePollStore();
  const [refreshing, setRefreshing] = useState(false);

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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Ionicons name="lock-closed-outline" size={64} color={colors.gray[400]} />
          <Text style={styles.emptyTitle}>Login Required</Text>
          <Text style={styles.emptyDescription}>
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Loading your polls...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Polls</Text>
          <Text style={styles.subtitle}>
            {userPollsPagination?.total || 0} total polls
          </Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreatePoll}
        >
          <Ionicons name="add-circle" size={28} color={colors.primary[500]} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      {userPolls.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary[500]} />
            <Text style={styles.statValue}>
              {userPolls.reduce((sum, poll) => sum + poll.totalVotes, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Votes</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="eye" size={20} color={colors.secondary[500]} />
            <Text style={styles.statValue}>
              {userPolls.reduce((sum, poll) => sum + poll.viewCount, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Views</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={20} color={colors.success} />
            <Text style={styles.statValue}>
              {userPolls.filter((poll) => poll.isActive).length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>
      )}

      {/* Polls List */}
      {userPolls.length === 0 ? (
        <View style={styles.emptyContainer}>
          {error ? (
            <>
              <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
              <Text style={styles.emptyTitle}>Could not load polls</Text>
              <Text style={styles.emptyDescription}>{error}</Text>
              <Button
                title="Retry"
                onPress={() => fetchUserPolls(1)}
                variant="outline"
                size="md"
              />
            </>
          ) : (
            <>
              <Ionicons name="document-text-outline" size={64} color={colors.gray[400]} />
              <Text style={styles.emptyTitle}>No Polls Yet</Text>
              <Text style={styles.emptyDescription}>
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
      ) : (
        <FlatList
          data={userPolls}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PollCard poll={item} onPress={() => handlePollPress(item)} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary[500]]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoading && userPolls.length > 0 ? (
              <View style={styles.footer}>
                <ActivityIndicator size="small" color={colors.primary[500]} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
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
    backgroundColor: colors.gray[50],
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
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 4,
  },
  createButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
  },
  statLabel: {
    fontSize: 11,
    color: colors.gray[500],
    textTransform: 'uppercase',
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
    color: colors.gray[600],
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
    color: colors.gray[900],
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.gray[600],
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
    color: colors.error,
    textAlign: 'center',
  },
});
