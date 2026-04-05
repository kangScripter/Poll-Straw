import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Poll } from '@/types';
import { useTheme } from '@/theme';
import { PollOption } from './PollOption';

interface PollCardProps {
  poll: Poll;
  onPress?: () => void;
  onVote?: (optionId: string) => void;
  showVoteButtons?: boolean;
  selectedOptionId?: string;
  selectedOptionIds?: string[];
  realTimeResults?: Poll | null;
}

export const PollCard: React.FC<PollCardProps> = ({
  poll,
  onPress,
  onVote,
  showVoteButtons = false,
  selectedOptionId,
  selectedOptionIds,
  realTimeResults,
}) => {
  const { theme, isDark } = useTheme();
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

  const cardStyle = [
    styles.container,
    {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderLeftColor: isActive ? theme.primary : theme.border,
    },
    !isDark
      ? {
          shadowColor: theme.cardShadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 1,
          shadowRadius: 2,
          elevation: 1,
        }
      : {},
  ];

  const body = (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={2}>
          {displayPoll.title}
        </Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: isActive ? theme.successSubtle : theme.surfaceSubtle },
        ]}>
          <View style={[
            styles.statusDot,
            { backgroundColor: isActive ? theme.success : theme.textTertiary },
          ]} />
          <Text style={[
            styles.statusText,
            { color: isActive ? theme.success : theme.textTertiary },
          ]}>
            {isActive ? 'Active' : 'Closed'}
          </Text>
        </View>
      </View>

      {/* Description */}
      {displayPoll.description && (
        <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
          {displayPoll.description}
        </Text>
      )}

      {/* Options */}
      <View style={styles.options}>
        {displayPoll.options.map((option) => {
          const isSelected = selectedOptionIds
            ? selectedOptionIds.includes(option.id)
            : selectedOptionId === option.id;
          return (
            <PollOption
              key={option.id}
              option={option}
              showResults={displayPoll.hasVoted || !isActive}
              isSelected={isSelected}
              isCheckbox={!!selectedOptionIds}
              onPress={showVoteButtons && isActive ? () => onVote?.(option.id) : undefined}
            />
          );
        })}
      </View>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: theme.divider }]}>
        <View style={styles.footerItem}>
          <Ionicons name="checkmark-circle-outline" size={16} color={theme.textTertiary} />
          <Text style={[styles.footerText, { color: theme.textTertiary }]}>
            {displayPoll.totalVotes} {displayPoll.totalVotes === 1 ? 'vote' : 'votes'}
          </Text>
        </View>

        {hasDeadline && (
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={16} color={theme.textTertiary} />
            <Text style={[styles.footerText, { color: theme.textTertiary }]}>
              {formatDeadline(displayPoll.deadline!)}
            </Text>
          </View>
        )}

        <View style={styles.footerItem}>
          <Ionicons name="eye-outline" size={16} color={theme.textTertiary} />
          <Text style={[styles.footerText, { color: theme.textTertiary }]}>
            {displayPoll.viewCount}
          </Text>
        </View>
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.9}>
        {body}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{body}</View>;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  options: {
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
  },
});
