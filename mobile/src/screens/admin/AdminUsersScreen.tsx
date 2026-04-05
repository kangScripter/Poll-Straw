import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { adminApi, AdminUser } from '@/services/api/adminApi';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/common/Button';
import { AdminListSkeleton } from '@/components/common/SkeletonLoader';
import { useTheme } from '@/theme';
import { ThemeColors } from '@/theme/types';
import { RootStackParamList } from '@/types';

type AdminUsersScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

type UserRole = 'GUEST' | 'USER' | 'ADMIN';

export const AdminUsersScreen: React.FC<AdminUsersScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { user } = useAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    loadUsers();
  }, [searchQuery]);

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return theme.primary;
      case 'USER':
        return theme.info;
      default:
        return theme.textTertiary;
    }
  };

  const loadUsers = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await adminApi.getUsers(page, searchQuery || undefined);
      if (response.success && response.data) {
        const usersData = response.data.users || [];
        setUsers(page === 1 ? usersData : [...users, ...usersData]);
        setPagination(response.data.pagination);
      } else {
        if (page === 1) {
          setUsers([]);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load users');
      if (page === 1) {
        setUsers([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers(1);
    setRefreshing(false);
  };

  const handleUpdateUser = async (
    userId: string,
    updates: { role?: UserRole; isActive?: boolean }
  ) => {
    try {
      const response = await adminApi.updateUser(userId, updates);
      if (response.success) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, ...updates } : u)));
        Alert.alert('Success', 'User updated successfully');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update user');
    }
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
          <Text style={styles.title}>User Management</Text>
          <Text style={styles.subtitle}>{pagination?.total || 0} total users</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchInputContainer,
            { backgroundColor: theme.inputBg, borderColor: theme.border },
          ]}
        >
          <Ionicons name="search-outline" size={20} color={theme.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search users..."
            placeholderTextColor={theme.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading && (!users || users.length === 0) ? (
        <View style={styles.loadingContainer}>
          <AdminListSkeleton />
        </View>
      ) : !users || users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color={theme.textTertiary} />
          <Text style={styles.emptyTitle}>No Users Found</Text>
          <Text style={styles.emptyText}>
            {searchQuery ? 'Try a different search term' : 'No users in the system'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const roleColor = getRoleColor(item.role);
            return (
              <View style={styles.userCard}>
                <View style={styles.userHeader}>
                  <View style={styles.userInfo}>
                    <View style={[styles.avatar, { backgroundColor: theme.primarySubtle }]}>
                      <Ionicons name="person" size={24} color={theme.primary} />
                    </View>
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{item.name || 'No name'}</Text>
                      <Text style={styles.userEmail}>{item.email}</Text>
                      <View style={styles.userMeta}>
                        <View
                          style={[
                            styles.roleBadge,
                            { backgroundColor: roleColor + '22' },
                          ]}
                        >
                          <Text style={[styles.roleText, { color: roleColor }]}>{item.role}</Text>
                        </View>
                        {!item.isActive && (
                          <View style={[styles.statusBadge, { backgroundColor: theme.errorSubtle }]}>
                            <Text style={[styles.statusText, { color: theme.error }]}>Inactive</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.userStats}>
                  <View style={styles.statItem}>
                    <Ionicons name="document-text" size={16} color={theme.textTertiary} />
                    <Text style={styles.statText}>{item.pollsCount || 0} polls</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.textTertiary} />
                    <Text style={styles.statText}>{item.votesCount || 0} votes</Text>
                  </View>
                  <Text style={styles.userDate}>
                    Joined {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                {item.id !== user.id && (
                  <View style={styles.actionsContainer}>
                    {item.role !== 'ADMIN' && (
                      <Button
                        title="Make Admin"
                        onPress={() => handleUpdateUser(item.id, { role: 'ADMIN' })}
                        variant="outline"
                        size="sm"
                      />
                    )}
                    {item.isActive ? (
                      <Button
                        title="Deactivate"
                        onPress={() => handleUpdateUser(item.id, { isActive: false })}
                        variant="outline"
                        size="sm"
                      />
                    ) : (
                      <Button
                        title="Activate"
                        onPress={() => handleUpdateUser(item.id, { isActive: true })}
                        size="sm"
                      />
                    )}
                  </View>
                )}
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
              loadUsers((pagination.page || 1) + 1);
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
    searchContainer: {
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      paddingHorizontal: 16,
      gap: 12,
      borderWidth: 1,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 16,
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
    userCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      gap: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    userHeader: {
      marginBottom: 8,
    },
    userInfo: {
      flexDirection: 'row',
      gap: 12,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    userDetails: {
      flex: 1,
    },
    userName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textPrimary,
      marginBottom: 2,
    },
    userEmail: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 8,
    },
    userMeta: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    roleBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    roleText: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    userStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    statText: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    userDate: {
      fontSize: 11,
      color: theme.textTertiary,
      marginLeft: 'auto',
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },
  });
