import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share as RNShare,
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { QRCode } from '@/components/common/QRCode';
import { usePollStore } from '@/store/pollStore';
import { Button } from '@/components/common/Button';
import { useTheme } from '@/theme';
import { RootStackParamList } from '@/types';

type ShareScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'Share'>;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const QR_SIZE = SCREEN_WIDTH * 0.6;


export const ShareScreen: React.FC<ShareScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { pollId, shareUrl } = route.params;
  const { currentPoll, fetchPoll } = usePollStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!currentPoll || currentPoll.id !== pollId) {
      fetchPoll(pollId);
    }
  }, [pollId]);

  // Always use canonical production URL for sharing
  const fullUrl = `https://pollstraw.com/poll/${shareUrl}`;
  const poll = currentPoll;

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(fullUrl);
      setCopied(true);
      Alert.alert('Copied!', 'Poll link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy link');
    }
  };

  const handleShare = async () => {
    try {
      const result = await RNShare.share({
        message: `Check out this poll: ${poll?.title || 'Poll'}\n${fullUrl}`,
        title: poll?.title || 'Poll',
      });

      if (result.action === RNShare.sharedAction) {
        Alert.alert('Shared!', 'Poll shared successfully');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to share');
    }
  };

  const shareOptions = [
    {
      id: 'copy',
      label: 'Copy Link',
      icon: 'copy-outline' as const,
      color: theme.primary,
      onPress: handleCopyLink,
    },
    {
      id: 'share',
      label: 'Share',
      icon: 'share-social-outline' as const,
      color: theme.accent,
      onPress: handleShare,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: 'logo-whatsapp' as const,
      color: '#25D366',
      onPress: async () => {
        const message = `Check out this poll: ${poll?.title || 'Poll'}\n${fullUrl}`;
        const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;

        try {
          const canOpen = await Linking.canOpenURL(whatsappUrl);
          if (canOpen) {
            await Linking.openURL(whatsappUrl);
          } else {
            // Fallback to web WhatsApp
            await Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`);
          }
        } catch (error) {
          Alert.alert('Error', 'Could not open WhatsApp');
        }
      },
    },
    {
      id: 'twitter',
      label: 'Twitter/X',
      icon: 'logo-twitter' as const,
      color: '#1DA1F2',
      onPress: async () => {
        const message = `Check out this poll: ${poll?.title || 'Poll'}\n${fullUrl}`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;

        try {
          await Linking.openURL(twitterUrl);
        } catch (error) {
          Alert.alert('Error', 'Could not open Twitter');
        }
      },
    },
  ];

  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Share Poll</Text>
          {poll && (
            <Text style={styles.subtitle} numberOfLines={2}>
              {poll.title}
            </Text>
          )}
        </View>

        {/* QR Code */}
        <View style={styles.qrSection}>
          <Text style={styles.sectionTitle}>Scan to Vote</Text>
          <View style={styles.qrContainer}>
            <QRCode value={fullUrl} size={QR_SIZE} />
          </View>
          <Text style={styles.qrHint}>
            Scan this QR code to quickly access the poll
          </Text>
        </View>

        {/* Share Link */}
        <View style={styles.linkSection}>
          <Text style={styles.sectionTitle}>Poll Link</Text>
          <View style={styles.linkContainer}>
            <Text style={styles.linkText} numberOfLines={2}>
              {fullUrl}
            </Text>
            <TouchableOpacity
              style={[styles.copyButton, copied && styles.copyButtonActive]}
              onPress={handleCopyLink}
            >
              <Ionicons
                name={copied ? 'checkmark' : 'copy-outline'}
                size={20}
                color={copied ? theme.textOnPrimary : theme.primary}
              />
              <Text
                style={[styles.copyButtonText, copied && styles.copyButtonTextActive]}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Share Options */}
        <View style={styles.shareSection}>
          <Text style={styles.sectionTitle}>Share Via</Text>
          <View style={styles.shareGrid}>
            {shareOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.shareOption}
                onPress={option.onPress}
              >
                <View style={[styles.shareIcon, { backgroundColor: option.color + '15' }]}>
                  <Ionicons name={option.icon} size={28} color={option.color} />
                </View>
                <Text style={styles.shareLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Poll Stats */}
        {poll && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Poll Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                <Text style={styles.statValue}>{poll.totalVotes}</Text>
                <Text style={styles.statLabel}>Votes</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="eye" size={20} color={theme.accent} />
                <Text style={styles.statValue}>{poll.viewCount}</Text>
                <Text style={styles.statLabel}>Views</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="options" size={20} color={theme.success} />
                <Text style={styles.statValue}>{poll.options.length}</Text>
                <Text style={styles.statLabel}>Options</Text>
              </View>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="View Poll"
            onPress={() => navigation.navigate('PollDetail', { pollId })}
            size="lg"
          />
          <Button
            title="View Results"
            onPress={() => navigation.navigate('Results', { pollId })}
            variant="outline"
            size="lg"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
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
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.textPrimary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      lineHeight: 22,
    },
    qrSection: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: 24,
      alignItems: 'center',
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.textPrimary,
      marginBottom: 16,
    },
    qrContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    qrCode: {
      width: QR_SIZE,
      height: QR_SIZE,
      backgroundColor: theme.background,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.border,
      gap: 8,
    },
    qrText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    qrUrl: {
      fontSize: 10,
      color: theme.textTertiary,
      maxWidth: QR_SIZE - 20,
    },
    qrErrorText: {
      fontSize: 12,
      color: theme.error,
      marginTop: 8,
      textAlign: 'center',
    },
    qrHint: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    linkSection: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
    },
    linkContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    linkText: {
      flex: 1,
      fontSize: 14,
      color: theme.textPrimary,
      padding: 12,
      backgroundColor: theme.background,
      borderRadius: 8,
    },
    copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.primary,
      gap: 6,
    },
    copyButtonActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    copyButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.primary,
    },
    copyButtonTextActive: {
      color: theme.textOnPrimary,
    },
    shareSection: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
    },
    shareGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    shareOption: {
      width: (SCREEN_WIDTH - 80) / 2,
      alignItems: 'center',
      gap: 8,
    },
    shareIcon: {
      width: 64,
      height: 64,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    shareLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    statsSection: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
      gap: 8,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    statLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      textTransform: 'uppercase',
    },
    actions: {
      gap: 12,
    },
  });
