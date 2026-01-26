import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { adminApi, Report } from '@/services/api/adminApi';
import { useAuthStore } from '@/store/authStore';
import { usePollStore } from '@/store/pollStore';
import { Button } from '@/components/common/Button';
import { colors } from '@/theme/colors';
import { RootStackParamList } from '@/types';

type ReportStatus = 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';

export const AdminModerationScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'AdminModeration'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const { user } = useAuthStore();
  const { deletePoll } = usePollStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | undefined>(
    route.params?.filter || 'PENDING'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    loadReports();
  }, [selectedStatus]);

  const loadReports = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await adminApi.getReports(selectedStatus, page);
      if (response.success && response.data) {
        // Backend returns { reports: [...], pagination: {...} }
        const reportsData = response.data.reports || [];
        setReports(page === 1 ? reportsData : [...reports, ...reportsData]);
        setPagination(response.data.pagination);
      } else {
        // If no data, ensure reports is an empty array
        if (page === 1) {
          setReports([]);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load reports');
      // On error, ensure reports is still an array
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

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'PENDING':
        return colors.warning;
      case 'REVIEWED':
        return colors.primary[500];
      case 'RESOLVED':
        return colors.success;
      case 'DISMISSED':
        return colors.gray[400];
      default:
        return colors.gray[400];
    }
  };

  const getReasonLabel = (reason: string) => {
    return reason.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="lock-closed" size={64} color={colors.error} />
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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Moderation</Text>
          <Text style={styles.subtitle}>
            {pagination?.total || 0} total reports
          </Text>
        </View>
      </View>

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        {(['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'] as ReportStatus[]).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              selectedStatus === status && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text
              style={[
                styles.filterText,
                selectedStatus === status && styles.filterTextActive,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reports List */}
      {isLoading && (!reports || reports.length === 0) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      ) : !reports || reports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle-outline" size={64} color={colors.gray[400]} />
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
          renderItem={({ item }) => (
            <View style={styles.reportCard}>
              {/* Report Header */}
              <View style={styles.reportHeader}>
                <View style={styles.reportHeaderLeft}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(item.status) + '15' },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(item.status) },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(item.status) },
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                  <Text style={styles.reasonBadge}>
                    {getReasonLabel(item.reason)}
                  </Text>
                </View>
                <Text style={styles.reportTime}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>

              {/* Poll Info */}
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
                    <Ionicons name="checkmark-circle" size={14} color={colors.gray[500]} />
                    <Text style={styles.pollMetaText}>
                      {item.poll.totalVotes} votes
                    </Text>
                  </View>
                  <View style={styles.pollMetaItem}>
                    <Ionicons name="eye" size={14} color={colors.gray[500]} />
                    <Text style={styles.pollMetaText}>
                      {item.poll.viewCount} views
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Report Details */}
              {item.details && (
                <View style={styles.detailsContainer}>
                  <Text style={styles.detailsLabel}>Details:</Text>
                  <Text style={styles.detailsText}>{item.details}</Text>
                </View>
              )}

              {/* Actions */}
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
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                  <Text style={styles.deleteButtonText}>Delete Poll</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[500],
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  filterButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[600],
    textTransform: 'uppercase',
  },
  filterTextActive: {
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray[600],
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
    color: colors.gray[900],
  },
  errorText: {
    fontSize: 16,
    color: colors.gray[600],
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
    color: colors.gray[900],
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  reportCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
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
    color: colors.gray[600],
    backgroundColor: colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reportTime: {
    fontSize: 12,
    color: colors.gray[500],
  },
  pollInfo: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  pollTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
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
    color: colors.gray[500],
  },
  detailsContainer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  detailsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
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
    color: colors.error,
  },
});
