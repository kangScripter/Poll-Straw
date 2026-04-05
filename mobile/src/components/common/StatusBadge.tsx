import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';

type BadgeVariant = 'active' | 'closed' | 'warning' | 'error' | 'info';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'active',
}) => {
  const { theme } = useTheme();

  const colors: Record<BadgeVariant, { bg: string; dot: string; text: string }> = {
    active: { bg: theme.successSubtle, dot: theme.success, text: theme.success },
    closed: { bg: theme.surfaceSubtle, dot: theme.textTertiary, text: theme.textTertiary },
    warning: { bg: theme.warningSubtle, dot: theme.warning, text: theme.warning },
    error: { bg: theme.errorSubtle, dot: theme.error, text: theme.error },
    info: { bg: theme.infoSubtle, dot: theme.info, text: theme.info },
  };

  const c = colors[variant];

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <View style={[styles.dot, { backgroundColor: c.dot }]} />
      <Text style={[styles.text, { color: c.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
