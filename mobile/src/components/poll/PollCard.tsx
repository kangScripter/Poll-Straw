import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Poll } from '@/types';
import { colors } from '@/theme/colors';
import { PollOption } from './PollOption';

interface PollCardProps {
  poll: Poll;
  onPress?: () => void;
  onVote?: (optionId: string) => void;
  showVoteButtons?: boolean;
  selectedOptionId?: string;
  realTimeResults?: Poll | null;
}

export const PollCard: React.FC<PollCardProps> = ({
  poll,
  onPress,
  onVote,
  showVoteButtons = false,
  selectedOptionId,
  realTimeResults,
}) => {
  const displayPoll = realTimeResults || poll;
  const isActive = displayPoll.isActive;
  const hasDeadline = displayPoll.deadline;
  
  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff < 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m left`;
  };

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {displayPoll.title}
        </Text>
        <View style={[styles.statusBadge, !isActive && styles.statusInactive]}>
          <View style={[styles.statusDot, !isActive && styles.statusDotInactive]} />
          <Text style={[styles.statusText, !isActive && styles.statusTextInactive]}>
            {isActive ? 'Active' : 'Closed'}
          </Text>
        </View>
      </View>

      {/* Description */}
      {displayPoll.description && (
        <Text style={styles.description} numberOfLines={2}>
          {displayPoll.description}
        </Text>
      )}

      {/* Options */}
      <View style={styles.options}>
        {displayPoll.options.map((option) => (
          <PollOption
            key={option.id}
            option={option}
            showResults={displayPoll.hasVoted || !isActive}
            isSelected={selectedOptionId === option.id}
            onPress={showVoteButtons && isActive ? () => onVote?.(option.id) : undefined}
          />
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="checkmark-circle-outline" size={16} color={colors.gray[500]} />
          <Text style={styles.footerText}>
            {displayPoll.totalVotes} {displayPoll.totalVotes === 1 ? 'vote' : 'votes'}
          </Text>
        </View>

        {hasDeadline && (
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={16} color={colors.gray[500]} />
            <Text style={styles.footerText}>
              {formatDeadline(displayPoll.deadline!)}
            </Text>
          </View>
        )}

        <View style={styles.footerItem}>
          <Ionicons name="eye-outline" size={16} color={colors.gray[500]} />
          <Text style={styles.footerText}>{displayPoll.viewCount}</Text>
        </View>
      </View>
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '15',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusInactive: {
    backgroundColor: colors.gray[200],
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  statusDotInactive: {
    backgroundColor: colors.gray[400],
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  statusTextInactive: {
    color: colors.gray[500],
  },
  description: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 16,
    lineHeight: 20,
  },
  options: {
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    paddingTop: 12,
    gap: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 13,
    color: colors.gray[500],
  },
});
