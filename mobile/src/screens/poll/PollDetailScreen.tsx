import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePollStore } from '@/store/pollStore';
import { useAuthStore } from '@/store/authStore';
import { useRealTimeVotes } from '@/hooks/useRealTimeVotes';
import { PollCard } from '@/components/poll/PollCard';
import { Button } from '@/components/common/Button';
import { colors } from '@/theme/colors';
import { RootStackParamList, Poll } from '@/types';

type PollDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'PollDetail'>;
};

export const PollDetailScreen: React.FC<PollDetailScreenProps> = ({ navigation, route }) => {
  const { pollId } = route.params;
  const { currentPoll, fetchPoll, castVote, isLoading, error } = usePollStore();
  const { isAuthenticated } = useAuthStore();
  const { results: realTimeResults, isConnected } = useRealTimeVotes(pollId);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    fetchPoll(pollId);
  }, [pollId]);

  useEffect(() => {
    if (currentPoll) {
      setHasVoted(currentPoll.hasVoted || false);
    }
  }, [currentPoll]);

  // Tapping an option only selects it; use "Cast Your Vote" to submit
  const handleSelectOption = (optionId: string) => {
    if (hasVoted && !currentPoll?.allowMultiple) return;
    setSelectedOptionId(optionId);
  };

  const handleSubmitVote = async (optionId: string) => {
    if (hasVoted && !currentPoll?.allowMultiple) {
      Alert.alert('Already Voted', 'You already voted');
      return;
    }

    if (currentPoll?.requireAuth && !isAuthenticated) {
      Alert.alert(
        'Login Required',
        'You need to be logged in to vote on this poll',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    try {
      await castVote(pollId, optionId);
      setHasVoted(true);
      setSelectedOptionId(null);
      Alert.alert('Vote Cast!', 'Your vote has been recorded');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to cast vote';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleShare = () => {
    if (currentPoll) {
      navigation.navigate('Share', { pollId: currentPoll.id, shareUrl: currentPoll.shareUrl });
    }
  };

  const handleViewResults = () => {
    if (currentPoll) {
      navigation.navigate('Results', { pollId: currentPoll.id });
    }
  };

  const displayPoll = realTimeResults || currentPoll;

  if (isLoading && !currentPoll) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Loading poll...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !currentPoll) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="outline"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!displayPoll) {
    return null;
  }

  const canVote = displayPoll.isActive && (!hasVoted || displayPoll.allowMultiple);
  const showResults = hasVoted || !displayPoll.isActive || displayPoll.showResults === 'ALWAYS';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Connection Status */}
        {isConnected && (
          <View style={styles.connectionBadge}>
            <View style={styles.connectionDot} />
            <Text style={styles.connectionText}>Live updates</Text>
          </View>
        )}

        {/* Poll Card */}
        <PollCard
          poll={displayPoll}
          showVoteButtons={canVote}
          selectedOptionId={selectedOptionId || undefined}
          realTimeResults={realTimeResults}
          onVote={handleSelectOption}
        />

        {/* Action Buttons */}
        <View style={styles.actions}>
          {canVote && !hasVoted && (
            <Button
              title="Cast Your Vote"
              onPress={() => {
                if (selectedOptionId) {
                  handleSubmitVote(selectedOptionId);
                } else {
                  Alert.alert('Select Option', 'Please select an option first');
                }
              }}
              disabled={!selectedOptionId}
              size="lg"
            />
          )}

          {showResults && (
            <Button
              title="View Detailed Results"
              onPress={handleViewResults}
              variant="outline"
              size="lg"
            />
          )}

          <Button
            title="Share Poll"
            onPress={handleShare}
            variant="ghost"
            size="lg"
            leftIcon={<Ionicons name="share-outline" size={20} color={colors.primary[500]} />}
          />
        </View>

        {/* Poll Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Poll Information</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.gray[500]} />
            <Text style={styles.infoText}>
              Created {new Date(displayPoll.createdAt).toLocaleDateString()}
            </Text>
          </View>

          {displayPoll.deadline && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color={colors.gray[500]} />
              <Text style={styles.infoText}>
                Deadline: {new Date(displayPoll.deadline).toLocaleString()}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="eye-outline" size={20} color={colors.gray[500]} />
            <Text style={styles.infoText}>
              {displayPoll.viewCount} {displayPoll.viewCount === 1 ? 'view' : 'views'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.gray[500]} />
            <Text style={styles.infoText}>
              {displayPoll.totalVotes} {displayPoll.totalVotes === 1 ? 'vote' : 'votes'}
            </Text>
          </View>
        </View>
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
    padding: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
    gap: 6,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.gray[600],
  },
});
