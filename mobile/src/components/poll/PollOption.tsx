import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { PollOption as PollOptionType } from '@/types';
import { useTheme } from '@/theme';
import { AnimatedNumber } from '@/components/common/AnimatedNumber';

interface PollOptionProps {
  option: PollOptionType;
  showResults: boolean;
  isSelected?: boolean;
  isCheckbox?: boolean;
  onPress?: () => void;
  colorIndex?: number;
}

export const PollOption: React.FC<PollOptionProps> = ({
  option,
  showResults,
  isSelected = false,
  isCheckbox = false,
  onPress,
  colorIndex = 0,
}) => {
  const { theme } = useTheme();
  const isInteractive = !!onPress;

  const optionColor = theme.pollOptionColors[colorIndex % theme.pollOptionColors.length];

  const progressPct = useSharedValue(showResults ? option.percentage : 0);

  useEffect(() => {
    if (showResults) {
      progressPct.value = withSpring(option.percentage, { damping: 18, stiffness: 180 });
    } else {
      progressPct.value = 0;
    }
  }, [option.percentage, showResults]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${progressPct.value}%`,
  }));

  const rowStyle = [
    styles.container,
    {
      backgroundColor: isSelected ? theme.primarySubtle : theme.surfaceSubtle,
      borderColor: isSelected ? theme.primary : 'transparent',
    },
  ];

  const inner = (
    <>
      {/* Progress bar background */}
      {showResults && (
        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor: isSelected
                ? theme.primary + '25'
                : optionColor + '20',
            },
            animatedBarStyle,
          ]}
        />
      )}

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.leftContent}>
          {/* Selection indicator */}
          {isInteractive && (
            isCheckbox ? (
              <View style={[
                styles.checkbox,
                {
                  borderColor: isSelected ? theme.primary : theme.inputBorder,
                  backgroundColor: isSelected ? theme.primary : 'transparent',
                },
              ]}>
                {isSelected && (
                  <Ionicons name="checkmark" size={14} color={theme.textOnPrimary} />
                )}
              </View>
            ) : (
              <View style={[
                styles.radio,
                { borderColor: isSelected ? theme.primary : theme.inputBorder },
              ]}>
                {isSelected && (
                  <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
                )}
              </View>
            )
          )}

          {/* Emoji */}
          {option.emoji && <Text style={styles.emoji}>{option.emoji}</Text>}

          {/* Text */}
          <Text
            style={[
              styles.text,
              { color: isSelected ? theme.primary : theme.textPrimary },
            ]}
            numberOfLines={2}
          >
            {option.text}
          </Text>
        </View>

        {/* Results */}
        {showResults && (
          <View style={styles.results}>
            <Text style={[
              styles.percentage,
              { color: isSelected ? theme.primary : theme.textPrimary },
            ]}>
              {option.percentage}%
            </Text>
            <AnimatedNumber style={[styles.voteCount, { color: theme.textTertiary }]} value={option.voteCount} />
          </View>
        )}
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={rowStyle} onPress={onPress} activeOpacity={0.7}>
        {inner}
      </TouchableOpacity>
    );
  }

  return <View style={rowStyle}>{inner}</View>;
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 20,
  },
  text: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  results: {
    alignItems: 'flex-end',
  },
  percentage: {
    fontSize: 15,
    fontWeight: '700',
  },
  voteCount: {
    fontSize: 11,
  },
});
