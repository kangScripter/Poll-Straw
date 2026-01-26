import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PollOption as PollOptionType } from '@/types';
import { colors } from '@/theme/colors';

interface PollOptionProps {
  option: PollOptionType;
  showResults: boolean;
  isSelected?: boolean;
  onPress?: () => void;
}

export const PollOption: React.FC<PollOptionProps> = ({
  option,
  showResults,
  isSelected = false,
  onPress,
}) => {
  const isInteractive = !!onPress;

  const OptionWrapper = isInteractive ? TouchableOpacity : View;

  return (
    <OptionWrapper
      style={[
        styles.container,
        isSelected && styles.containerSelected,
        !isInteractive && styles.containerDisabled,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Progress bar background */}
      {showResults && (
        <View
          style={[
            styles.progressBar,
            { width: `${option.percentage}%` },
            isSelected && styles.progressBarSelected,
          ]}
        />
      )}

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.leftContent}>
          {/* Selection indicator */}
          {isInteractive && (
            <View style={[styles.radio, isSelected && styles.radioSelected]}>
              {isSelected && (
                <View style={styles.radioInner} />
              )}
            </View>
          )}

          {/* Emoji */}
          {option.emoji && (
            <Text style={styles.emoji}>{option.emoji}</Text>
          )}

          {/* Text */}
          <Text style={[styles.text, isSelected && styles.textSelected]} numberOfLines={2}>
            {option.text}
          </Text>
        </View>

        {/* Results */}
        {showResults && (
          <View style={styles.results}>
            <Text style={[styles.percentage, isSelected && styles.percentageSelected]}>
              {option.percentage}%
            </Text>
            <Text style={styles.voteCount}>
              {option.voteCount}
            </Text>
          </View>
        )}
      </View>
    </OptionWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  containerSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  containerDisabled: {
    opacity: 1,
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: colors.gray[200],
    borderRadius: 10,
  },
  progressBarSelected: {
    backgroundColor: colors.primary[200],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    zIndex: 1,
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary[500],
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary[500],
  },
  emoji: {
    fontSize: 20,
  },
  text: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.gray[800],
  },
  textSelected: {
    color: colors.primary[700],
    fontWeight: '600',
  },
  results: {
    alignItems: 'flex-end',
  },
  percentage: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.gray[700],
  },
  percentageSelected: {
    color: colors.primary[600],
  },
  voteCount: {
    fontSize: 12,
    color: colors.gray[500],
  },
});
