import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { adminApi, AdminUser } from '@/services/api/adminApi';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/common/Button';
import { colors } from '@/theme/colors';
import { RootStackParamList } from '@/types';

type AdminUsersScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export const AdminUsersScreen: React.FC<AdminUsersScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    loadUsers();
  }, [searchQuery]);

  const loadUsers = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await adminApi.getUsers(page, searchQuery || undefined);
      if (response.success && response.data) {
        // Backend returns { users: [...], pagination: {...} }
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

  const handleUpdateUser = async (userId: string, updates: { role?: string; isActive?: boolean }) => {
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return colors.primary[500];
      case 'USER':
        return colors.secondary[500];
      default:
        return colors.gray[400];
    }
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
          <Text style={styles.title}>User Management</Text>
          <Text style={styles.subtitle}>
            {pagination?.total || 0} total users
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color={colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={colors.gray[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.gray[400]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Users List */}
      {isLoading && (!users || users.length === 0) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : !users || users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color={colors.gray[400]} />
          <Text style={styles.emptyTitle}>No Users Found</Text>
          <Text style={styles.emptyText}>
            {searchQuery ? 'Try a different search term' : 'No users in the system'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.userCard}>
              <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={24} color={colors.primary[500]} />
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{item.name || 'No name'}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    <View style={styles.userMeta}>
                      <View
                        style={[
                          styles.roleBadge,
                          { backgroundColor: getRoleColor(item.role) + '15' },
                        ]}
                      >
                        <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>
                          {item.role}
                        </Text>
                      </View>
                      {!item.isActive && (
                        <View style={[styles.statusBadge, { backgroundColor: colors.error + '15' }]}>
                          <Text style={[styles.statusText, { color: colors.error }]}>
                            Inactive
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.userStats}>
                <View style={styles.statItem}>
                  <Ionicons name="document-text" size={16} color={colors.gray[500]} />
                  <Text style={styles.statText}>
                    {item.pollsCount || 0} polls
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.gray[500]} />
                  <Text style={styles.statText}>
                    {item.votesCount || 0} votes
                  </Text>
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
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.gray[900],
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
  userCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
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
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    gap: 8,
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
    borderTopColor: colors.gray[100],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  userDate: {
    fontSize: 11,
    color: colors.gray[500],
    marginLeft: 'auto',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
});
