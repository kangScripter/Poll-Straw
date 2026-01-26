import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { usePollStore } from '@/store/pollStore';
import { useAuthStore } from '@/store/authStore';
import { PollCard } from '@/components/poll/PollCard';
import { Button } from '@/components/common/Button';
import { colors } from '@/theme/colors';
import { RootStackParamList, Poll } from '@/types';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [shareUrl, setShareUrl] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const { isAuthenticated, user } = useAuthStore();
  const { fetchPollByShareUrl, currentPoll, isLoading, error } = usePollStore();

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
    // Navigate to Create tab in tab navigator
    navigation.navigate('Create');
  };

  const handlePollPress = (poll: Poll) => {
    navigation.navigate('PollDetail', { pollId: poll.id });
  };

  // Example recent polls (in real app, these would come from API)
  const recentPolls: Poll[] = [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {isAuthenticated ? `Hello, ${user?.name || 'there'}!` : 'Welcome!'}
          </Text>
          <Text style={styles.subtitle}>Create or join a poll</Text>
        </View>
        {isAuthenticated && (
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle-outline" size={32} color={colors.primary[500]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Search / Join Poll */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="link-outline" size={20} color={colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Enter poll code or URL"
            placeholderTextColor={colors.gray[400]}
            value={shareUrl}
            onChangeText={setShareUrl}
            onSubmitEditing={handleSearch}
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={isSearching || !shareUrl.trim()}
        >
          <Ionicons name="arrow-forward" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Create Poll CTA */}
      <View style={styles.createSection}>
        <View style={styles.createCard}>
          <View style={styles.createCardContent}>
            <View style={styles.createIconContainer}>
              <Ionicons name="add-circle" size={48} color={colors.primary[500]} />
            </View>
            <Text style={styles.createTitle}>Create a Poll</Text>
            <Text style={styles.createDescription}>
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

      {/* Features */}
      <View style={styles.features}>
        <Text style={styles.featuresTitle}>Why PollStraw?</Text>
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primary[50] }]}>
              <Ionicons name="flash" size={20} color={colors.primary[500]} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Real-time Results</Text>
              <Text style={styles.featureDescription}>Watch votes come in live</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.secondary[50] }]}>
              <Ionicons name="share-social" size={20} color={colors.secondary[500]} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Easy Sharing</Text>
              <Text style={styles.featureDescription}>Share via link or QR code</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="shield-checkmark" size={20} color={colors.success} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Vote Protection</Text>
              <Text style={styles.featureDescription}>Prevent duplicate votes</Text>
            </View>
          </View>
        </View>
      </View>
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
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.gray[900],
  },
  searchButton: {
    width: 50,
    height: 50,
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  createCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  createCardContent: {
    padding: 24,
    alignItems: 'center',
  },
  createIconContainer: {
    marginBottom: 16,
  },
  createTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 8,
  },
  createDescription: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: 20,
  },
  features: {
    paddingHorizontal: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: colors.gray[500],
  },
});
