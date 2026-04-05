import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { hapticSelection } from '@/utils/haptics';

interface ThemeToggleProps {
  size?: 'sm' | 'md';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ size = 'md' }) => {
  const { theme, isDark, toggleTheme } = useTheme();

  const isMd = size === 'md';
  const trackWidth = isMd ? 64 : 52;
  const trackHeight = isMd ? 32 : 28;
  const thumbSize = isMd ? 26 : 22;
  const iconSize = isMd ? 16 : 14;
  const padding = (trackHeight - thumbSize) / 2;

  return (
    <TouchableOpacity
      onPress={() => {
        hapticSelection();
        toggleTheme();
      }}
      activeOpacity={0.85}
      style={[
        styles.track,
        {
          width: trackWidth,
          height: trackHeight,
          borderRadius: trackHeight / 2,
          backgroundColor: isDark ? theme.primarySubtle : theme.surfaceSubtle,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={[styles.iconsRow, { paddingHorizontal: padding + 2 }]}>
        <Ionicons name="sunny" size={iconSize} color={isDark ? theme.textTertiary : theme.accent} />
        <Ionicons name="moon" size={iconSize} color={isDark ? theme.primary : theme.textTertiary} />
      </View>
      <View
        style={[
          styles.thumb,
          {
            width: thumbSize,
            height: thumbSize,
            borderRadius: thumbSize / 2,
            backgroundColor: isDark ? theme.primary : theme.textOnPrimary,
            left: isDark ? trackWidth - thumbSize - padding : padding,
            top: padding,
          },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    position: 'relative',
    borderWidth: 1,
    justifyContent: 'center',
  },
  iconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  thumb: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
});
