import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';

const SCREEN_W = Dimensions.get('window').width;

interface SkeletonItem {
  type: 'rect' | 'circle';
  width: number | string;
  height: number;
  marginBottom?: number;
}

interface SkeletonLoaderProps {
  layout: SkeletonItem[];
}

const ShimmerRow: React.FC<{ item: SkeletonItem }> = ({ item }) => {
  const { theme } = useTheme();
  const translateX = useRef(new Animated.Value(-160)).current;

  useEffect(() => {
    const sweep = Animated.sequence([
      Animated.timing(translateX, {
        toValue: SCREEN_W + 160,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: -160,
        duration: 0,
        useNativeDriver: true,
      }),
    ]);
    const loop = Animated.loop(sweep);
    loop.start();
    return () => loop.stop();
  }, [translateX]);

  const circle = item.type === 'circle';
  const borderRadius = circle ? item.height / 2 : 8;

  return (
    <View
      style={{
        marginBottom: item.marginBottom ?? 12,
        overflow: 'hidden',
        backgroundColor: theme.skeleton,
        height: item.height,
        borderRadius,
        width: item.width as number | `${number}%`,
      }}
    >
      <Animated.View
        style={[StyleSheet.absoluteFillObject, { transform: [{ translateX }] }]}
      >
        <LinearGradient
          colors={[theme.skeleton, theme.skeletonHighlight, theme.skeleton]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ width: 160, height: '100%' }}
        />
      </Animated.View>
    </View>
  );
};

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ layout }) => {
  return (
    <View>
      {layout.map((item, index) => (
        <ShimmerRow key={index} item={item} />
      ))}
    </View>
  );
};

export const PollCardSkeleton: React.FC = () => (
  <SkeletonLoader
    layout={[
      { type: 'rect', width: '70%', height: 18, marginBottom: 8 },
      { type: 'rect', width: '100%', height: 14, marginBottom: 16 },
      { type: 'rect', width: '100%', height: 40, marginBottom: 8 },
      { type: 'rect', width: '100%', height: 40, marginBottom: 8 },
      { type: 'rect', width: '100%', height: 40, marginBottom: 12 },
      { type: 'rect', width: '40%', height: 12 },
    ]}
  />
);

export const ProfileSkeleton: React.FC = () => (
  <SkeletonLoader
    layout={[
      { type: 'circle', width: 80, height: 80, marginBottom: 12 },
      { type: 'rect', width: 160, height: 20, marginBottom: 6 },
      { type: 'rect', width: 200, height: 14, marginBottom: 24 },
      { type: 'rect', width: '100%', height: 48, marginBottom: 8 },
      { type: 'rect', width: '100%', height: 48, marginBottom: 8 },
      { type: 'rect', width: '100%', height: 48 },
    ]}
  />
);

export const PollDetailSkeleton: React.FC = () => (
  <SkeletonLoader
    layout={[
      { type: 'rect', width: '90%', height: 24, marginBottom: 12 },
      { type: 'rect', width: '100%', height: 14, marginBottom: 20 },
      { type: 'rect', width: 120, height: 28, marginBottom: 16 },
      { type: 'rect', width: '100%', height: 48, marginBottom: 8 },
      { type: 'rect', width: '100%', height: 48, marginBottom: 8 },
      { type: 'rect', width: '100%', height: 48, marginBottom: 8 },
      { type: 'rect', width: '100%', height: 48, marginBottom: 16 },
      { type: 'rect', width: '100%', height: 52 },
    ]}
  />
);

export const ResultsChartSkeleton: React.FC = () => (
  <SkeletonLoader
    layout={[
      { type: 'rect', width: '80%', height: 22, marginBottom: 16 },
      { type: 'rect', width: '100%', height: 220, marginBottom: 20 },
      { type: 'rect', width: '100%', height: 44, marginBottom: 8 },
      { type: 'rect', width: '100%', height: 44, marginBottom: 8 },
      { type: 'rect', width: '100%', height: 44 },
    ]}
  />
);

export const AdminStatsSkeleton: React.FC = () => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
    {[0, 1, 2, 3].map((i) => (
      <View key={i} style={{ width: '47%' }}>
        <SkeletonLoader layout={[{ type: 'rect', width: '100%', height: 100, marginBottom: 0 }]} />
      </View>
    ))}
  </View>
);

export const HomeRecentSkeleton: React.FC = () => (
  <View style={{ gap: 12 }}>
    <SkeletonLoader layout={[{ type: 'rect', width: 140, height: 20, marginBottom: 0 }]} />
    <PollCardSkeleton />
    <PollCardSkeleton />
  </View>
);

export const AdminListSkeleton: React.FC = () => (
  <View style={{ gap: 12 }}>
    {[0, 1, 2, 3].map((i) => (
      <SkeletonLoader key={i} layout={[{ type: 'rect', width: '100%', height: 88, marginBottom: 0 }]} />
    ))}
  </View>
);
