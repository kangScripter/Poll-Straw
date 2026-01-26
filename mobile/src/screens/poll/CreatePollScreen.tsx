import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { usePollStore } from '@/store/pollStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { colors } from '@/theme/colors';
import { RootStackParamList, CreatePollInput, Poll } from '@/types';

type CreatePollScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

interface PollOption {
  id: string;
  text: string;
  emoji: string;
}

const EMOJI_OPTIONS = ['👍', '❤️', '😊', '🎉', '🔥', '⭐', '💯', '🚀', '🎯', '✨'];

export const CreatePollScreen: React.FC<CreatePollScreenProps> = ({ navigation }) => {
  const { createPoll, isLoading } = usePollStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<PollOption[]>([
    { id: '1', text: '', emoji: '' },
    { id: '2', text: '', emoji: '' },
  ]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [requireAuth, setRequireAuth] = useState(false);
  const [showResults, setShowResults] = useState<'ALWAYS' | 'AFTER_VOTE' | 'AFTER_DEADLINE' | 'NEVER'>('ALWAYS');
  const [deadline, setDeadline] = useState<string>('');
  const [ipRestriction, setIpRestriction] = useState(true);

  const addOption = () => {
    if (options.length >= 10) {
      Alert.alert('Limit Reached', 'You can add up to 10 options');
      return;
    }
    setOptions([...options, { id: Date.now().toString(), text: '', emoji: '' }]);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) {
      Alert.alert('Minimum Required', 'A poll must have at least 2 options');
      return;
    }
    setOptions(options.filter((opt) => opt.id !== id));
  };

  const updateOption = (id: string, field: 'text' | 'emoji', value: string) => {
    setOptions(options.map((opt) => (opt.id === id ? { ...opt, [field]: value } : opt)));
  };

  const selectEmoji = (optionId: string, emoji: string) => {
    updateOption(optionId, 'emoji', emoji);
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a poll question');
      return false;
    }

    if (title.length < 3) {
      Alert.alert('Validation Error', 'Poll question must be at least 3 characters');
      return false;
    }

    const validOptions = options.filter((opt) => opt.text.trim().length > 0);
    if (validOptions.length < 2) {
      Alert.alert('Validation Error', 'Please add at least 2 options');
      return false;
    }

    // Check for duplicate options
    const optionTexts = validOptions.map((opt) => opt.text.trim().toLowerCase());
    const uniqueTexts = new Set(optionTexts);
    if (optionTexts.length !== uniqueTexts.size) {
      Alert.alert('Validation Error', 'Options must be unique');
      return false;
    }

    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      const validOptions = options
        .filter((opt) => opt.text.trim().length > 0)
        .map((opt) => ({
          text: opt.text.trim(),
          emoji: opt.emoji || undefined,
        }));

      const pollData: CreatePollInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        options: validOptions,
        settings: {
          allowMultiple,
          requireAuth,
          showResults,
          deadline: deadline || undefined,
          ipRestriction,
        },
      };

      const poll = await createPoll(pollData);
      
      // Helper to navigate to stack screens (works from both tab and stack contexts)
      const navigateToStack = (screen: string, params?: any) => {
        const parent = navigation.getParent();
        if (parent) {
          // We're in a tab navigator, use parent
          parent.navigate(screen as any, params);
        } else {
          // We're already in stack navigator
          navigation.navigate(screen as any, params);
        }
      };

      Alert.alert(
        'Poll Created!',
        'Your poll has been created successfully',
        [
          {
            text: 'Share Poll',
            onPress: () => navigateToStack('Share', { pollId: poll.id, shareUrl: poll.shareUrl }),
          },
          {
            text: 'View Poll',
            onPress: () => navigateToStack('PollDetail', { pollId: poll.id }),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create poll');
    }
  };

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
          {/* Poll Question */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Poll Question *</Text>
            <Input
              placeholder="What would you like to ask?"
              value={title}
              onChangeText={setTitle}
              maxLength={200}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description (Optional)</Text>
            <Input
              placeholder="Add more context about your poll..."
              value={description}
              onChangeText={setDescription}
              maxLength={500}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Options */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Options *</Text>
              <TouchableOpacity onPress={addOption} style={styles.addButton}>
                <Ionicons name="add-circle" size={24} color={colors.primary[500]} />
                <Text style={styles.addButtonText}>Add Option</Text>
              </TouchableOpacity>
            </View>

            {options.map((option, index) => (
              <View key={option.id} style={styles.optionContainer}>
                <View style={styles.optionHeader}>
                  <Text style={styles.optionNumber}>{index + 1}</Text>
                  {options.length > 2 && (
                    <TouchableOpacity
                      onPress={() => removeOption(option.id)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close-circle" size={20} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Emoji Picker */}
                <View style={styles.emojiContainer}>
                  {EMOJI_OPTIONS.map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      onPress={() => selectEmoji(option.id, emoji)}
                      style={[
                        styles.emojiButton,
                        option.emoji === emoji && styles.emojiButtonSelected,
                      ]}
                    >
                      <Text style={styles.emojiText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    onPress={() => selectEmoji(option.id, '')}
                    style={[styles.emojiButton, !option.emoji && styles.emojiButtonSelected]}
                  >
                    <Text style={styles.emojiText}>None</Text>
                  </TouchableOpacity>
                </View>

                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option.text}
                  onChangeText={(text) => updateOption(option.id, 'text', text)}
                  maxLength={100}
                />
              </View>
            ))}
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>

            {/* Allow Multiple Votes */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setAllowMultiple(!allowMultiple)}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Allow Multiple Votes</Text>
                <Text style={styles.settingDescription}>
                  Users can vote for multiple options
                </Text>
              </View>
              <View style={[styles.toggle, allowMultiple && styles.toggleActive]}>
                {allowMultiple && <View style={styles.toggleThumb} />}
              </View>
            </TouchableOpacity>

            {/* Require Authentication */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setRequireAuth(!requireAuth)}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Require Login</Text>
                <Text style={styles.settingDescription}>
                  Only logged-in users can vote
                </Text>
              </View>
              <View style={[styles.toggle, requireAuth && styles.toggleActive]}>
                {requireAuth && <View style={styles.toggleThumb} />}
              </View>
            </TouchableOpacity>

            {/* IP Restriction */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setIpRestriction(!ipRestriction)}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Prevent Duplicate Votes</Text>
                <Text style={styles.settingDescription}>
                  One vote per IP address
                </Text>
              </View>
              <View style={[styles.toggle, ipRestriction && styles.toggleActive]}>
                {ipRestriction && <View style={styles.toggleThumb} />}
              </View>
            </TouchableOpacity>

            {/* Show Results */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Show Results</Text>
                <Text style={styles.settingDescription}>
                  When to display poll results
                </Text>
              </View>
            </View>
            <View style={styles.radioGroup}>
              {(['ALWAYS', 'AFTER_VOTE', 'AFTER_DEADLINE', 'NEVER'] as const).map((value) => (
                <TouchableOpacity
                  key={value}
                  style={styles.radioOption}
                  onPress={() => setShowResults(value)}
                >
                  <View style={styles.radio}>
                    {showResults === value && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={styles.radioLabel}>
                    {value.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Deadline */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Deadline (Optional)</Text>
              <Input
                placeholder="YYYY-MM-DD HH:MM (e.g., 2026-02-01 18:00)"
                value={deadline}
                onChangeText={setDeadline}
              />
            </View>
          </View>

          {/* Create Button */}
          <View style={styles.buttonContainer}>
            <Button
              title={isLoading ? 'Creating...' : 'Create Poll'}
              onPress={handleCreate}
              disabled={isLoading}
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
  section: {
    marginBottom: 24,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[500],
  },
  optionContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[500],
    textTransform: 'uppercase',
  },
  removeButton: {
    padding: 4,
  },
  emojiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    paddingVertical: 8,
  },
  emojiButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  emojiButtonSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  emojiText: {
    fontSize: 18,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: colors.gray[500],
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gray[300],
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: colors.primary[500],
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignSelf: 'flex-end',
  },
  radioGroup: {
    marginTop: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray[300],
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary[500],
  },
  radioLabel: {
    fontSize: 14,
    color: colors.gray[700],
  },
  buttonContainer: {
    marginTop: 8,
  },
});
