import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

interface AccentCardProps {
  children: React.ReactNode;
  accentColor?: string;
  accentPosition?: 'top' | 'left';
  style?: ViewStyle;
}

export const AccentCard: React.FC<AccentCardProps> = ({
  children,
  accentColor,
  accentPosition = 'top',
  style,
}) => {
  const { theme, isDark } = useTheme();
  const color = accentColor ?? theme.borderAccent;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          ...(accentPosition === 'top'
            ? { borderTopWidth: 3, borderTopColor: color }
            : { borderLeftWidth: 3, borderLeftColor: color }),
        },
        !isDark && {
          shadowColor: theme.cardShadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 1,
          shadowRadius: 2,
          elevation: 1,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
});
