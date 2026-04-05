import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { adminApi, Report } from '@/services/api/adminApi';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/common/Button';
import { AdminListSkeleton } from '@/components/common/SkeletonLoader';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/types';
import { RootStackParamList } from '@/types';

type ReportStatus = 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';

export const AdminModerationScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'AdminModeration'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { user } = useAuthStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>(
    route.params?.filter ?? 'PENDING'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    loadReports();
  }, [selectedStatus]);

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'PENDING':
        return theme.warning;
      case 'REVIEWED':
        return theme.primary;
      case 'RESOLVED':
        return theme.success;
      case 'DISMISSED':
        return theme.textTertiary;
      default:
        return theme.textTertiary;
    }
  };

  const loadReports = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await adminApi.getReports(selectedStatus, page);
      if (response.success && response.data) {
        const reportsData = response.data.reports || [];
        setReports(page === 1 ? reportsData : [...reports, ...reportsData]);
        setPagination(response.data.pagination);
      } else {
        if (page === 1) {
          setReports([]);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load reports');
      if (page === 1) {
        setReports([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReports(1);
    setRefreshing(false);
  };

  const handleUpdateStatus = async (reportId: string, status: ReportStatus) => {
    try {
      const response = await adminApi.updateReport(reportId, status);
      if (response.success) {
        setReports(reports.map((r) => (r.id === reportId ? { ...r, status } : r)));
        Alert.alert('Success', 'Report status updated');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update report');
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    Alert.alert(
      'Delete Poll',
      'Are you sure you want to delete this poll? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminApi.deletePoll(pollId);
              setReports(reports.filter((r) => r.pollId !== pollId));
              Alert.alert('Success', 'Poll deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete poll');
            }
          },
        },
      ]
    );
  };

  const getReasonLabel = (reason: string) => {
    return reason.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="lock-closed" size={64} color={theme.error} />
          <Text style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorText}>You need admin privileges to access this screen</Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="outline"
            size="md"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Moderation</Text>
          <Text style={styles.subtitle}>{pagination?.total || 0} total reports</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        {(['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'] as ReportStatus[]).map((status) => {
          const active = selectedStatus === status;
          return (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                {
                  backgroundColor: active ? theme.primary : theme.surface,
                  borderColor: active ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setSelectedStatus(status)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: active ? theme.textOnPrimary : theme.textSecondary },
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading && (!reports || reports.length === 0) ? (
        <View style={styles.loadingContainer}>
          <AdminListSkeleton />
        </View>
      ) : !reports || reports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle-outline" size={64} color={theme.textTertiary} />
          <Text style={styles.emptyTitle}>No Reports</Text>
          <Text style={styles.emptyText}>
            {selectedStatus === 'PENDING'
              ? 'No pending reports to review'
              : `No ${selectedStatus.toLowerCase()} reports`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const statusColor = getStatusColor(item.status);
            return (
              <View style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View style={styles.reportHeaderLeft}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusColor + '22' },
                      ]}
                    >
                      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                      <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
                    </View>
                    <Text style={styles.reasonBadge}>{getReasonLabel(item.reason)}</Text>
                  </View>
                  <Text style={styles.reportTime}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.pollInfo}
                  onPress={() => {
                    const parent = navigation.getParent();
                    if (parent) {
                      parent.navigate('PollDetail', { pollId: item.poll.id });
                    } else {
                      navigation.navigate('PollDetail', { pollId: item.poll.id });
                    }
                  }}
                >
                  <Text style={styles.pollTitle} numberOfLines={2}>
                    {item.poll.title}
                  </Text>
                  <View style={styles.pollMeta}>
                    <View style={styles.pollMetaItem}>
                      <Ionicons name="checkmark-circle" size={14} color={theme.textTertiary} />
                      <Text style={styles.pollMetaText}>{item.poll.totalVotes} votes</Text>
                    </View>
                    <View style={styles.pollMetaItem}>
                      <Ionicons name="eye" size={14} color={theme.textTertiary} />
                      <Text style={styles.pollMetaText}>{item.poll.viewCount} views</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {item.details && (
                  <View style={styles.detailsContainer}>
                    <Text style={styles.detailsLabel}>Details:</Text>
                    <Text style={styles.detailsText}>{item.details}</Text>
                  </View>
                )}

                <View style={styles.actionsContainer}>
                  {item.status === 'PENDING' && (
                    <>
                      <Button
                        title="Review"
                        onPress={() => handleUpdateStatus(item.id, 'REVIEWED')}
                        variant="outline"
                        size="sm"
                      />
                      <Button
                        title="Resolve"
                        onPress={() => handleUpdateStatus(item.id, 'RESOLVED')}
                        size="sm"
                      />
                      <Button
                        title="Dismiss"
                        onPress={() => handleUpdateStatus(item.id, 'DISMISSED')}
                        variant="ghost"
                        size="sm"
                      />
                    </>
                  )}
                  {item.status === 'REVIEWED' && (
                    <>
                      <Button
                        title="Resolve"
                        onPress={() => handleUpdateStatus(item.id, 'RESOLVED')}
                        size="sm"
                      />
                      <Button
                        title="Dismiss"
                        onPress={() => handleUpdateStatus(item.id, 'DISMISSED')}
                        variant="ghost"
                        size="sm"
                      />
                    </>
                  )}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeletePoll(item.poll.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color={theme.error} />
                    <Text style={styles.deleteButtonText}>Delete Poll</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
          onEndReached={() => {
            if (pagination?.hasNext && !isLoading) {
              loadReports((pagination.page || 1) + 1);
            }
          }}
          onEndReachedThreshold={0.5}
        />
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.textPrimary,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textTertiary,
    },
    filterContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 20,
      marginBottom: 16,
      gap: 8,
    },
    filterButton: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
    },
    filterText: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
    },
    loadingText: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      gap: 16,
    },
    errorTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    errorText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      gap: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    emptyText: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    listContent: {
      padding: 20,
      paddingTop: 0,
    },
    reportCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      gap: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    reportHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    reportHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
      flexWrap: 'wrap',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    reasonBadge: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.textSecondary,
      backgroundColor: theme.surfaceSubtle,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    reportTime: {
      fontSize: 12,
      color: theme.textTertiary,
    },
    pollInfo: {
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },
    pollTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textPrimary,
      marginBottom: 8,
    },
    pollMeta: {
      flexDirection: 'row',
      gap: 16,
    },
    pollMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    pollMetaText: {
      fontSize: 12,
      color: theme.textTertiary,
    },
    detailsContainer: {
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },
    detailsLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.textSecondary,
      marginBottom: 4,
    },
    detailsText: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    actionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 6,
    },
    deleteButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.error,
    },
  });
