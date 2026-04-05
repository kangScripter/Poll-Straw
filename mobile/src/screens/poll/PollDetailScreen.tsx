import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
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
import { PollDetailSkeleton } from '@/components/common/SkeletonLoader';
import { useTheme } from '@/theme';
import { hapticLightImpact, hapticSelection, hapticSuccess } from '@/utils/haptics';
import { RootStackParamList, Poll } from '@/types';

type PollDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'PollDetail'>;
};

export const PollDetailScreen: React.FC<PollDetailScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { pollId } = route.params;
  const { currentPoll, fetchPoll, castVote, deletePoll, closePoll, isLoading, error } = usePollStore();
  const { isAuthenticated, user } = useAuthStore();
  const { results: realTimeResults, isConnected } = useRealTimeVotes(pollId);

  // Single-select state (allowMultiple: false)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  // Multi-select state (allowMultiple: true)
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!pollId) { navigation.goBack(); return; }
    fetchPoll(pollId);
  }, [pollId]);

  useEffect(() => {
    if (currentPoll) {
      setHasVoted(currentPoll.hasVoted || false);
    }
  }, [currentPoll]);

  const displayPoll = realTimeResults || currentPoll;
  const isCreator = !!user && displayPoll?.creatorId === user.id;

  // Single-select handler
  const handleSelectOption = (optionId: string) => {
    if (!displayPoll) return;
    hapticSelection();
    if (displayPoll.allowMultiple) {
      // Toggle multi-select
      setSelectedOptionIds((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
      );
    } else {
      if (hasVoted) return;
      setSelectedOptionId(optionId);
    }
  };

  const handleSubmitVote = async () => {
    if (isSubmitting) return;

    if (displayPoll?.requireAuth && !isAuthenticated) {
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

    setIsSubmitting(true);
    hapticLightImpact();
    try {
      if (displayPoll?.allowMultiple) {
        if (selectedOptionIds.length === 0) {
          Alert.alert('Select Option', 'Please select at least one option');
          return;
        }
        for (const optId of selectedOptionIds) {
          await castVote(pollId, optId);
        }
        setHasVoted(true);
        setSelectedOptionIds([]);
        hapticSuccess();
        Alert.alert('Vote Cast!', 'Your votes have been recorded');
      } else {
        if (!selectedOptionId) {
          Alert.alert('Select Option', 'Please select an option first');
          return;
        }
        if (hasVoted) {
          Alert.alert('Already Voted', 'You already voted');
          return;
        }
        await castVote(pollId, selectedOptionId);
        setHasVoted(true);
        setSelectedOptionId(null);
        hapticSuccess();
        Alert.alert('Vote Cast!', 'Your vote has been recorded');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to cast vote';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
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

  const handleEdit = () => {
    navigation.navigate('EditPoll', { pollId });
  };

  const handleClose = () => {
    Alert.alert(
      'Close Poll',
      'Are you sure you want to close this poll? Voting will be disabled.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close Poll',
          style: 'destructive',
          onPress: async () => {
            try {
              await closePoll(pollId);
              Alert.alert('Poll Closed', 'Voting has been disabled for this poll');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to close poll');
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Poll',
      'Are you sure you want to permanently delete this poll? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePoll(pollId);
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete poll');
            }
          },
        },
      ]
    );
  };

  const styles = useMemo(() => StyleSheet.create({
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
      padding: 20,
      gap: 16,
    },
    errorText: {
      fontSize: 16,
      color: theme.error,
      textAlign: 'center',
    },
    connectionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.successSubtle,
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
      backgroundColor: theme.success,
    },
    connectionText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.success,
    },
    actions: {
      gap: 12,
      marginBottom: 24,
    },
    infoCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      gap: 12,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.textPrimary,
      marginBottom: 4,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    infoText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
  }), [theme]);

  if (isLoading && !currentPoll) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <PollDetailSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error && !currentPoll) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.error} />
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

  // For multi-select: show vote button if any option is selected
  const canSubmitMulti = displayPoll.allowMultiple && selectedOptionIds.length > 0;
  // For single-select: show vote button if not yet voted and option selected
  const canSubmitSingle = !displayPoll.allowMultiple && canVote && !hasVoted && !!selectedOptionId;

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
          selectedOptionId={!displayPoll.allowMultiple ? (selectedOptionId || undefined) : undefined}
          selectedOptionIds={displayPoll.allowMultiple ? selectedOptionIds : undefined}
          realTimeResults={realTimeResults}
          onVote={handleSelectOption}
        />

        {/* Action Buttons */}
        <View style={styles.actions}>
          {/* Vote submit button */}
          {canVote && (canSubmitSingle || canSubmitMulti) && (
            <Button
              title={isSubmitting ? 'Submitting...' : 'Cast Your Vote'}
              onPress={handleSubmitVote}
              disabled={isSubmitting}
              loading={isSubmitting}
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
            leftIcon={<Ionicons name="share-outline" size={20} color={theme.primary} />}
          />

          {/* Creator-only actions */}
          {isCreator && (
            <>
              {displayPoll.totalVotes === 0 && (
                <Button
                  title="Edit Poll"
                  onPress={handleEdit}
                  variant="outline"
                  size="lg"
                  leftIcon={<Ionicons name="create-outline" size={20} color={theme.primary} />}
                />
              )}

              {displayPoll.isActive && (
                <Button
                  title="Close Poll"
                  onPress={handleClose}
                  variant="outline"
                  size="lg"
                  leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.warning} />}
                />
              )}

              <Button
                title="Delete Poll"
                onPress={handleDelete}
                variant="outline"
                size="lg"
                leftIcon={<Ionicons name="trash-outline" size={20} color={theme.error} />}
              />
            </>
          )}
        </View>

        {/* Poll Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Poll Information</Text>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={theme.textSecondary} />
            <Text style={styles.infoText}>
              Created {new Date(displayPoll.createdAt).toLocaleDateString()}
            </Text>
          </View>

          {displayPoll.deadline && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color={theme.textSecondary} />
              <Text style={styles.infoText}>
                Deadline: {new Date(displayPoll.deadline).toLocaleString()}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="eye-outline" size={20} color={theme.textSecondary} />
            <Text style={styles.infoText}>
              {displayPoll.viewCount} {displayPoll.viewCount === 1 ? 'view' : 'views'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle-outline" size={20} color={theme.textSecondary} />
            <Text style={styles.infoText}>
              {displayPoll.totalVotes} {displayPoll.totalVotes === 1 ? 'vote' : 'votes'}
            </Text>
          </View>

          {displayPoll.allowMultiple && (
            <View style={styles.infoRow}>
              <Ionicons name="checkbox-outline" size={20} color={theme.primary} />
              <Text style={styles.infoText}>Multiple options allowed</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
