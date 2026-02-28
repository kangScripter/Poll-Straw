import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { usePollStore } from '@/store/pollStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { colors } from '@/theme/colors';
import { RootStackParamList, CreatePollInput } from '@/types';

type EditPollScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'EditPoll'>;
};

export const EditPollScreen: React.FC<EditPollScreenProps> = ({ navigation, route }) => {
  const { pollId } = route.params;
  const { currentPoll, fetchPoll, updatePoll, isLoading } = usePollStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [requireAuth, setRequireAuth] = useState(false);
  const [ipRestriction, setIpRestriction] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    fetchPoll(pollId);
  }, [pollId]);

  useEffect(() => {
    if (currentPoll && !initialized) {
      setTitle(currentPoll.title);
      setDescription(currentPoll.description || '');
      setDeadline(
        currentPoll.deadline
          ? new Date(currentPoll.deadline).toLocaleString('sv-SE', { hour12: false }).slice(0, 16).replace('T', ' ')
          : ''
      );
      setRequireAuth(currentPoll.requireAuth);
      setIpRestriction(currentPoll.ipRestriction);
      setInitialized(true);
    }
  }, [currentPoll]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a poll question');
      return;
    }
    if (title.length < 3) {
      Alert.alert('Validation Error', 'Poll question must be at least 3 characters');
      return;
    }

    // Convert deadline to ISO 8601 if provided
    let isoDeadline: string | undefined;
    if (deadline.trim()) {
      const parsed = new Date(deadline.trim());
      if (isNaN(parsed.getTime())) {
        Alert.alert('Invalid Deadline', 'Please use format YYYY-MM-DD HH:MM (e.g., 2026-12-01 18:00)');
        return;
      }
      if (parsed <= new Date()) {
        Alert.alert('Invalid Deadline', 'Deadline must be set in the future');
        return;
      }
      isoDeadline = parsed.toISOString();
    }

    try {
      const updates: Partial<CreatePollInput> = {
        title: title.trim(),
        description: description.trim() || undefined,
        settings: {
          requireAuth,
          ipRestriction,
          deadline: isoDeadline,
        },
      };

      await updatePoll(pollId, updates);
      Alert.alert('Saved', 'Poll updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message || 'Failed to update poll';
      Alert.alert('Error', msg);
    }
  };

  if (!currentPoll && isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const hasVotes = (currentPoll?.totalVotes ?? 0) > 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {hasVotes && (
            <View style={styles.warningCard}>
              <Text style={styles.warningText}>
                This poll already has votes. Only settings can be changed — title, description, and options are locked.
              </Text>
            </View>
          )}

          {/* Poll Question */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Poll Question *</Text>
            <Input
              placeholder="What would you like to ask?"
              value={title}
              onChangeText={setTitle}
              maxLength={500}
              multiline
              numberOfLines={3}
              editable={!hasVotes}
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description (Optional)</Text>
            <Input
              placeholder="Add more context about your poll..."
              value={description}
              onChangeText={setDescription}
              maxLength={1000}
              multiline
              numberOfLines={3}
              editable={!hasVotes}
            />
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Deadline (Optional)</Text>
              <Input
                placeholder="YYYY-MM-DD HH:MM (e.g., 2026-12-01 18:00)"
                value={deadline}
                onChangeText={setDeadline}
              />
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <Button
              title={isLoading ? 'Saving...' : 'Save Changes'}
              onPress={handleSave}
              disabled={isLoading}
              size="lg"
            />
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              size="lg"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray[600],
  },
  warningCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  warningText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 12,
  },
  settingRow: {
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 8,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
});
