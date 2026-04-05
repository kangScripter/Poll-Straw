import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePollStore } from '@/store/pollStore';
import { useAuthStore } from '@/store/authStore';
import { PollCard } from '@/components/poll/PollCard';
import { Button } from '@/components/common/Button';
import { HomeRecentSkeleton } from '@/components/common/SkeletonLoader';
import { useTheme } from '@/theme';
import { MainTabScreenNavigationProp, Poll } from '@/types';

type HomeScreenProps = {
  navigation: MainTabScreenNavigationProp<'Home'>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [shareUrl, setShareUrl] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [recentLoading, setRecentLoading] = useState(true);

  const { isAuthenticated, user } = useAuthStore();
  const { fetchPollByShareUrl, fetchRecentPolls, recentPolls, currentPoll } = usePollStore();

  useEffect(() => {
    void (async () => {
      await fetchRecentPolls();
      setRecentLoading(false);
    })();
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchRecentPolls();
    setIsRefreshing(false);
  }, []);

  const handleSearch = async () => {
    if (!shareUrl.trim()) return;

    setIsSearching(true);
    try {
      await fetchPollByShareUrl(shareUrl.trim());
      if (currentPoll) {
        navigation.navigate('PollDetail', { pollId: currentPoll.id });
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreatePoll = () => {
    navigation.navigate('Create');
  };

  const handlePollPress = (poll: Poll) => {
    navigation.navigate('PollDetail', { pollId: poll.id });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.textPrimary }]}>
              {isAuthenticated ? `Hello, ${user?.name || 'there'}!` : 'Welcome!'}
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Create or join a poll
            </Text>
          </View>
          {isAuthenticated && (
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="person-circle-outline" size={32} color={theme.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Search / Join Poll */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, {
            backgroundColor: theme.inputBg,
            borderColor: theme.inputBorder,
          }]}>
            <Ionicons name="link-outline" size={20} color={theme.textTertiary} />
            <TextInput
              style={[styles.searchInput, { color: theme.textPrimary }]}
              placeholder="Enter poll code or URL"
              placeholderTextColor={theme.textTertiary}
              value={shareUrl}
              onChangeText={setShareUrl}
              onSubmitEditing={handleSearch}
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: theme.primary }]}
            onPress={handleSearch}
            disabled={isSearching || !shareUrl.trim()}
          >
            <Ionicons name="arrow-forward" size={24} color={theme.textOnPrimary} />
          </TouchableOpacity>
        </View>

        {/* Create Poll CTA */}
        <View style={styles.createSection}>
          <View style={[styles.createCard, {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            borderTopColor: theme.borderAccent,
          }]}>
            <View style={styles.createCardContent}>
              <View style={[styles.createIconContainer, { backgroundColor: theme.primarySubtle }]}>
                <Ionicons name="add-circle" size={40} color={theme.primary} />
              </View>
              <Text style={[styles.createTitle, { color: theme.textPrimary }]}>
                Create a Poll
              </Text>
              <Text style={[styles.createDescription, { color: theme.textSecondary }]}>
                Ask a question, add options, and share with anyone
              </Text>
              <Button
                title="Create Poll"
                onPress={handleCreatePoll}
                size="md"
              />
            </View>
          </View>
        </View>

        {/* Recent Polls */}
        {recentLoading && (
          <View style={styles.recentSection}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Recent Polls</Text>
            <HomeRecentSkeleton />
          </View>
        )}
        {!recentLoading && recentPolls.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Recent Polls
            </Text>
            {recentPolls.map((poll) => (
              <TouchableOpacity
                key={poll.id}
                onPress={() => handlePollPress(poll)}
              >
                <PollCard poll={poll} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Features */}
        <View style={styles.features}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Why PollStraw?
          </Text>
          <View style={styles.featuresList}>
            {[
              { icon: 'flash', title: 'Real-time Results', desc: 'Watch votes come in live', bg: theme.primarySubtle, color: theme.primary },
              { icon: 'share-social', title: 'Easy Sharing', desc: 'Share via link or QR code', bg: theme.infoSubtle, color: theme.info },
              { icon: 'shield-checkmark', title: 'Vote Protection', desc: 'Prevent duplicate votes', bg: theme.successSubtle, color: theme.success },
            ].map((feature) => (
              <View
                key={feature.title}
                style={[styles.featureItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <View style={[styles.featureIcon, { backgroundColor: feature.bg }]}>
                  <Ionicons name={feature.icon as any} size={20} color={feature.color} />
                </View>
                <View style={styles.featureText}>
                  <Text style={[styles.featureTitle, { color: theme.textPrimary }]}>
                    {feature.title}
                  </Text>
                  <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                    {feature.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  createCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderTopWidth: 3,
    overflow: 'hidden',
  },
  createCardContent: {
    padding: 24,
    alignItems: 'center',
  },
  createIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  createTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  createDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  recentSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  features: {
    paddingHorizontal: 16,
  },
  featuresList: {
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 14,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
  },
});
