import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';

const TAB_CONFIG: Record<string, { icon: string; iconFocused: string; label: string }> = {
  Home: { icon: 'home-outline', iconFocused: 'home', label: 'Home' },
  Create: { icon: 'add-circle-outline', iconFocused: 'add-circle', label: 'Create' },
  Dashboard: { icon: 'grid-outline', iconFocused: 'grid', label: 'Dashboard' },
  Profile: { icon: 'person-outline', iconFocused: 'person', label: 'Profile' },
};

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.tabBarBg,
          borderTopColor: theme.tabBarBorder,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const config = TAB_CONFIG[route.name] || { icon: 'ellipse', iconFocused: 'ellipse', label: route.name };
        const isCreate = route.name === 'Create';

        const onPress = () => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            onPress={onPress}
            activeOpacity={0.7}
          >
            {/* Active dot indicator */}
            <View style={[
              styles.dotIndicator,
              { backgroundColor: isFocused ? theme.primary : 'transparent' },
            ]} />

            {/* Icon */}
            <View style={[
              isCreate && styles.createIconWrapper,
              isCreate && {
                backgroundColor: isFocused ? theme.primary : theme.primarySubtle,
              },
            ]}>
              <Ionicons
                name={(isFocused ? config.iconFocused : config.icon) as keyof typeof Ionicons.glyphMap}
                size={isCreate ? 26 : 22}
                color={
                  isCreate && isFocused
                    ? theme.textOnPrimary
                    : isFocused
                    ? theme.primary
                    : theme.textTertiary
                }
              />
            </View>

            {/* Label */}
            <Text
              style={[
                styles.label,
                { color: isFocused ? theme.primary : theme.textTertiary },
                isFocused && styles.labelActive,
              ]}
            >
              {config.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 6,
    minHeight: 64,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dotIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginBottom: 2,
  },
  createIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -6,
    marginBottom: -4,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
  labelActive: {
    fontWeight: '600',
  },
});
