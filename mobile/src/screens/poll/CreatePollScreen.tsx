import React, { useState, useCallback } from 'react';
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
  Switch,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePollStore } from '@/store/pollStore';
import { Button } from '@/components/common/Button';
import { AccentCard } from '@/components/common/AccentCard';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { useTheme } from '@/theme';
import { hapticSelection, hapticSuccess } from '@/utils/haptics';
import { CreatePollScreenNavigationProp, CreatePollInput, RootStackParamList } from '@/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type CreatePollScreenProps = {
  navigation: CreatePollScreenNavigationProp;
};

interface PollOptionItem {
  id: string;
  text: string;
  emoji: string;
}

const EMOJI_OPTIONS = ['👍', '❤️', '😊', '🎉', '🔥', '⭐', '💯', '🚀', '🎯', '✨'];
const SHOW_RESULTS_OPTIONS = ['Always', 'After Vote', 'After Close', 'Never'];
const SHOW_RESULTS_VALUES = ['ALWAYS', 'AFTER_VOTE', 'AFTER_DEADLINE', 'NEVER'] as const;

function formatDeadline(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export const CreatePollScreen: React.FC<CreatePollScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { createPoll, isLoading } = usePollStore();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<PollOptionItem[]>([
    { id: '1', text: '', emoji: '' },
    { id: '2', text: '', emoji: '' },
  ]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [requireAuth, setRequireAuth] = useState(false);
  const [ipRestriction, setIpRestriction] = useState(true);
  const [showResultsIndex, setShowResultsIndex] = useState(0);
  const [deadlineDate, setDeadlineDate] = useState<Date | null>(null);

  // UI state
  const [showDescription, setShowDescription] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [emojiPickerOptionId, setEmojiPickerOptionId] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState('');
  const [tempTime, setTempTime] = useState('');

  // ── Option management ────────────────────────────────────────────────────
  const addOption = useCallback(() => {
    if (options.length >= 10) {
      Alert.alert('Limit Reached', 'You can add up to 10 options');
      return;
    }
    hapticSelection();
    setOptions((prev) => [...prev, { id: Date.now().toString(), text: '', emoji: '' }]);
  }, [options.length]);

  const removeOption = useCallback((id: string) => {
    if (options.length <= 2) {
      Alert.alert('Minimum Required', 'A poll must have at least 2 options');
      return;
    }
    hapticSelection();
    setOptions((prev) => prev.filter((opt) => opt.id !== id));
  }, [options.length]);

  const updateOptionText = useCallback((id: string, text: string) => {
    setOptions((prev) => prev.map((opt) => (opt.id === id ? { ...opt, text } : opt)));
  }, []);

  const selectEmoji = useCallback((optionId: string, emoji: string) => {
    hapticSelection();
    setOptions((prev) => prev.map((opt) => (opt.id === optionId ? { ...opt, emoji } : opt)));
    setEmojiPickerOptionId(null);
  }, []);

  // ── Deadline ─────────────────────────────────────────────────────────────
  const applyDeadline = () => {
    const dateStr = tempDate.trim();
    const timeStr = tempTime.trim() || '23:59';
    if (!dateStr) {
      Alert.alert('Invalid Date', 'Please enter a date (YYYY-MM-DD)');
      return;
    }
    const parsed = new Date(`${dateStr}T${timeStr}`);
    if (isNaN(parsed.getTime())) {
      Alert.alert('Invalid Date', 'Use format YYYY-MM-DD and HH:MM');
      return;
    }
    if (parsed <= new Date()) {
      Alert.alert('Invalid Deadline', 'Deadline must be in the future');
      return;
    }
    setDeadlineDate(parsed);
    setShowDatePicker(false);
    setTempDate('');
    setTempTime('');
  };

  const clearDeadline = () => {
    hapticSelection();
    setDeadlineDate(null);
  };

  // ── Validation & Submit ───────────────────────────────────────────────────
  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Missing Question', 'Please enter a poll question');
      return false;
    }
    if (title.trim().length < 3) {
      Alert.alert('Too Short', 'Poll question must be at least 3 characters');
      return false;
    }
    const validOptions = options.filter((opt) => opt.text.trim().length > 0);
    if (validOptions.length < 2) {
      Alert.alert('Not Enough Options', 'Please add at least 2 answer options');
      return false;
    }
    const texts = validOptions.map((opt) => opt.text.trim().toLowerCase());
    if (new Set(texts).size !== texts.length) {
      Alert.alert('Duplicate Options', 'All options must be unique');
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setOptions([
      { id: '1', text: '', emoji: '' },
      { id: '2', text: '', emoji: '' },
    ]);
    setAllowMultiple(false);
    setRequireAuth(false);
    setIpRestriction(true);
    setShowResultsIndex(0);
    setDeadlineDate(null);
    setShowDescription(false);
    setShowSettings(false);
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    const pollData: CreatePollInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      options: options
        .filter((opt) => opt.text.trim().length > 0)
        .map((opt) => ({ text: opt.text.trim(), emoji: opt.emoji || undefined })),
      settings: {
        allowMultiple,
        requireAuth,
        ipRestriction,
        showResults: SHOW_RESULTS_VALUES[showResultsIndex],
        deadline: deadlineDate ? deadlineDate.toISOString() : undefined,
      },
    };

    try {
      const poll = await createPoll(pollData);
      hapticSuccess();
      resetForm();

      const stackNav = (navigation.getParent() ?? navigation) as NativeStackNavigationProp<RootStackParamList>;
      Alert.alert('Poll Created! 🎉', 'Your poll is ready to share', [
        { text: 'Share', onPress: () => stackNav.navigate('Share', { pollId: poll.id, shareUrl: poll.shareUrl }) },
        { text: 'View Poll', onPress: () => stackNav.navigate('PollDetail', { pollId: poll.id }) },
        { text: 'Create Another', style: 'cancel' },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create poll');
    }
  };

  // ── Character count color ─────────────────────────────────────────────────
  const titleCountColor =
    title.length >= 480 ? theme.error : title.length >= 400 ? theme.warning : theme.textTertiary;
  const descCountColor =
    description.length >= 480 ? theme.error : description.length >= 400 ? theme.warning : theme.textTertiary;

  const bottomBarHeight = 80 + insets.bottom;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* ── Screen Header ── */}
        <View style={[styles.screenHeader, { borderBottomColor: theme.border }]}>
          <Text style={[styles.screenTitle, { color: theme.textPrimary }]}>Create Poll</Text>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomBarHeight + 16 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Section 1: Question ── */}
          <AccentCard accentPosition="top" accentColor={theme.borderAccent} style={styles.card}>
            <View style={styles.stepRow}>
              <View style={[styles.stepBadge, { backgroundColor: theme.primary }]}>
                <Text style={[styles.stepNum, { color: theme.textOnPrimary }]}>1</Text>
              </View>
              <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>Your Question</Text>
            </View>

            <TextInput
              style={[styles.questionInput, { color: theme.textPrimary }]}
              placeholder="What would you like to ask?"
              placeholderTextColor={theme.textTertiary}
              value={title}
              onChangeText={setTitle}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={[styles.charCount, { color: titleCountColor }]}>
              {title.length}/500
            </Text>
          </AccentCard>

          {/* ── Section 2: Description (collapsible) ── */}
          {!showDescription ? (
            <TouchableOpacity
              style={styles.addDescRow}
              onPress={() => { hapticSelection(); setShowDescription(true); }}
            >
              <Ionicons name="add-circle-outline" size={18} color={theme.primary} />
              <Text style={[styles.addDescText, { color: theme.primary }]}>Add description</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.card, styles.descCard, {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            }]}>
              <View style={styles.descHeader}>
                <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>Description</Text>
                <TouchableOpacity
                  onPress={() => { hapticSelection(); setShowDescription(false); setDescription(''); }}
                >
                  <Text style={[styles.removeLink, { color: theme.textTertiary }]}>Remove</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.descInput, { color: theme.textPrimary }]}
                placeholder="Add more context about your poll..."
                placeholderTextColor={theme.textTertiary}
                value={description}
                onChangeText={setDescription}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={[styles.charCount, { color: descCountColor }]}>
                {description.length}/500
              </Text>
            </View>
          )}

          {/* ── Section 3: Options ── */}
          <AccentCard accentPosition="left" accentColor={theme.primary} style={styles.card}>
            <View style={styles.stepRow}>
              <View style={[styles.stepBadge, { backgroundColor: theme.primary }]}>
                <Text style={[styles.stepNum, { color: theme.textOnPrimary }]}>2</Text>
              </View>
              <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>Answer Options</Text>
            </View>

            {options.map((option, index) => (
              <View key={option.id} style={[styles.optionRow, { borderBottomColor: theme.borderSubtle }]}>
                {/* Number pill */}
                <View style={[styles.numPill, { backgroundColor: theme.surfaceSubtle }]}>
                  <Text style={[styles.numText, { color: theme.textSecondary }]}>{index + 1}</Text>
                </View>

                {/* Text input */}
                <TextInput
                  style={[styles.optionInput, {
                    color: theme.textPrimary,
                    borderColor: theme.inputBorder,
                    backgroundColor: theme.inputBg,
                  }]}
                  placeholder={`Option ${index + 1}`}
                  placeholderTextColor={theme.textTertiary}
                  value={option.text}
                  onChangeText={(text) => updateOptionText(option.id, text)}
                  maxLength={100}
                />

                {/* Emoji button */}
                <TouchableOpacity
                  style={[styles.emojiBtn, {
                    borderColor: option.emoji ? theme.primary : theme.border,
                    backgroundColor: option.emoji ? theme.primarySubtle : theme.surfaceSubtle,
                  }]}
                  onPress={() => { hapticSelection(); setEmojiPickerOptionId(option.id); }}
                >
                  {option.emoji ? (
                    <Text style={styles.emojiBtnText}>{option.emoji}</Text>
                  ) : (
                    <Ionicons name="happy-outline" size={16} color={theme.textTertiary} />
                  )}
                </TouchableOpacity>

                {/* Remove button */}
                {options.length > 2 && (
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeOption(option.id)}
                  >
                    <Ionicons name="close-circle" size={20} color={theme.textTertiary} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {/* Add option row */}
            <View style={styles.addOptionRow}>
              <TouchableOpacity
                style={[styles.addOptionBtn, { borderColor: theme.primary }]}
                onPress={addOption}
                disabled={options.length >= 10}
              >
                <Ionicons name="add" size={18} color={theme.primary} />
                <Text style={[styles.addOptionText, { color: theme.primary }]}>Add Option</Text>
              </TouchableOpacity>
              <Text style={[styles.optionCount, { color: theme.textTertiary }]}>
                {options.length}/10
              </Text>
            </View>
          </AccentCard>

          {/* ── Section 4: Advanced Settings (collapsible) ── */}
          <TouchableOpacity
            style={[styles.settingsHeader, {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            }]}
            onPress={() => { hapticSelection(); setShowSettings(!showSettings); }}
            activeOpacity={0.7}
          >
            <View style={styles.settingsHeaderLeft}>
              <Ionicons name="settings-outline" size={18} color={theme.textSecondary} />
              <Text style={[styles.settingsHeaderText, { color: theme.textSecondary }]}>
                Advanced Settings
              </Text>
            </View>
            <Ionicons
              name={showSettings ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={theme.textTertiary}
            />
          </TouchableOpacity>

          {showSettings && (
            <View style={[styles.settingsBody, {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            }]}>
              {/* Toggle rows */}
              {([
                { label: 'Allow Multiple Votes', desc: 'Users can select more than one option', value: allowMultiple, onChange: setAllowMultiple },
                { label: 'Require Login', desc: 'Only logged-in users can vote', value: requireAuth, onChange: setRequireAuth },
                { label: 'Prevent Duplicate Votes', desc: 'One vote per IP address', value: ipRestriction, onChange: setIpRestriction },
              ] as const).map((item) => (
                <View key={item.label} style={[styles.toggleRow, { borderBottomColor: theme.borderSubtle }]}>
                  <View style={styles.toggleInfo}>
                    <Text style={[styles.toggleLabel, { color: theme.textPrimary }]}>{item.label}</Text>
                    <Text style={[styles.toggleDesc, { color: theme.textSecondary }]}>{item.desc}</Text>
                  </View>
                  <Switch
                    value={item.value}
                    onValueChange={(v) => { hapticSelection(); item.onChange(v as any); }}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor={theme.surface}
                    ios_backgroundColor={theme.border}
                  />
                </View>
              ))}

              {/* Show Results */}
              <View style={[styles.settingSection, { borderBottomColor: theme.borderSubtle }]}>
                <Text style={[styles.toggleLabel, { color: theme.textPrimary }]}>Show Results</Text>
                <Text style={[styles.toggleDesc, { color: theme.textSecondary }]}>
                  When voters can see the results
                </Text>
                <View style={styles.segmentedWrapper}>
                  <SegmentedControl
                    options={SHOW_RESULTS_OPTIONS}
                    selectedIndex={showResultsIndex}
                    onSelect={(i) => { hapticSelection(); setShowResultsIndex(i); }}
                  />
                </View>
              </View>

              {/* Deadline */}
              <View style={styles.settingSection}>
                <Text style={[styles.toggleLabel, { color: theme.textPrimary }]}>Deadline</Text>
                <Text style={[styles.toggleDesc, { color: theme.textSecondary }]}>
                  Automatically close the poll at this time
                </Text>
                {deadlineDate ? (
                  <View style={styles.deadlineSet}>
                    <View style={[styles.deadlinePill, {
                      backgroundColor: theme.primarySubtle,
                      borderColor: theme.primary,
                    }]}>
                      <Ionicons name="time-outline" size={14} color={theme.primary} />
                      <Text style={[styles.deadlineText, { color: theme.primary }]}>
                        {formatDeadline(deadlineDate)}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={clearDeadline}>
                      <Text style={[styles.clearLink, { color: theme.error }]}>Clear</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.setDeadlineBtn, { borderColor: theme.border }]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
                    <Text style={[styles.setDeadlineText, { color: theme.textSecondary }]}>
                      Set deadline
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

        </ScrollView>

        {/* ── Fixed Bottom Bar ── */}
        <View style={[styles.bottomBar, {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          paddingBottom: Math.max(insets.bottom, 12),
        }]}>
          <Button
            title={isLoading ? 'Creating...' : 'Create Poll'}
            onPress={handleCreate}
            loading={isLoading}
            fullWidth
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>

      {/* ── Emoji Picker Modal ── */}
      <Modal
        visible={emojiPickerOptionId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEmojiPickerOptionId(null)}
      >
        <TouchableOpacity
          style={[styles.emojiOverlay, { backgroundColor: theme.overlay }]}
          activeOpacity={1}
          onPress={() => setEmojiPickerOptionId(null)}
        >
          <View style={[styles.emojiSheet, {
            backgroundColor: theme.surface,
            borderTopWidth: 3,
            borderTopColor: theme.borderAccent,
          }]}>
            <Text style={[styles.emojiSheetTitle, { color: theme.textPrimary }]}>
              Pick an Emoji
            </Text>
            <View style={styles.emojiGrid}>
              {EMOJI_OPTIONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[styles.emojiGridBtn, { backgroundColor: theme.surfaceSubtle }]}
                  onPress={() => selectEmoji(emojiPickerOptionId!, emoji)}
                >
                  <Text style={styles.emojiGridText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.emojiNoneBtn, { borderColor: theme.border }]}
              onPress={() => selectEmoji(emojiPickerOptionId!, '')}
            >
              <Text style={[styles.emojiNoneText, { color: theme.textSecondary }]}>
                No Emoji
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Deadline Input Modal ── */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity
          style={[styles.emojiOverlay, { backgroundColor: theme.overlay }]}
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={[styles.deadlineSheet, {
            backgroundColor: theme.surface,
            borderTopWidth: 3,
            borderTopColor: theme.borderAccent,
          }]}>
            <Text style={[styles.emojiSheetTitle, { color: theme.textPrimary }]}>
              Set Deadline
            </Text>

            <Text style={[styles.dateInputLabel, { color: theme.textSecondary }]}>
              Date (YYYY-MM-DD)
            </Text>
            <TextInput
              style={[styles.dateInput, {
                color: theme.textPrimary,
                borderColor: theme.inputBorder,
                backgroundColor: theme.inputBg,
              }]}
              placeholder="e.g. 2026-12-31"
              placeholderTextColor={theme.textTertiary}
              value={tempDate}
              onChangeText={setTempDate}
              keyboardType="numeric"
            />

            <Text style={[styles.dateInputLabel, { color: theme.textSecondary }]}>
              Time (HH:MM, optional — defaults to 23:59)
            </Text>
            <TextInput
              style={[styles.dateInput, {
                color: theme.textPrimary,
                borderColor: theme.inputBorder,
                backgroundColor: theme.inputBg,
              }]}
              placeholder="e.g. 18:00"
              placeholderTextColor={theme.textTertiary}
              value={tempTime}
              onChangeText={setTempTime}
              keyboardType="numeric"
            />

            <View style={styles.deadlineActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => { setShowDatePicker(false); setTempDate(''); setTempTime(''); }}
                style={styles.deadlineActionBtn}
              />
              <Button
                title="Set Deadline"
                onPress={applyDeadline}
                style={styles.deadlineActionBtn}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },

  screenHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
  },

  scrollContent: {
    padding: 16,
    gap: 12,
  },

  card: {
    marginBottom: 0,
  },

  // Step badge
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Question input
  questionInput: {
    fontSize: 18,
    fontWeight: '500',
    minHeight: 72,
    lineHeight: 26,
    textAlignVertical: 'top',
    paddingVertical: 4,
  },
  charCount: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'right',
    marginTop: 6,
  },

  // Description
  addDescRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  addDescText: {
    fontSize: 14,
    fontWeight: '500',
  },
  descCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  descHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  removeLink: {
    fontSize: 13,
    fontWeight: '500',
  },
  descInput: {
    fontSize: 14,
    minHeight: 60,
    lineHeight: 20,
    textAlignVertical: 'top',
  },

  // Option rows
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  numPill: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {
    fontSize: 12,
    fontWeight: '600',
  },
  optionInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  emojiBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBtnText: {
    fontSize: 18,
  },
  removeBtn: {
    padding: 2,
  },

  // Add option
  addOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  addOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  addOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  optionCount: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Settings
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsHeaderText: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingsBody: {
    borderRadius: 12,
    borderWidth: 1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 0,
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  toggleDesc: {
    fontSize: 12,
  },
  settingSection: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 8,
  },
  segmentedWrapper: {
    marginTop: 4,
  },

  // Deadline
  deadlineSet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  deadlinePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  deadlineText: {
    fontSize: 13,
    fontWeight: '500',
  },
  clearLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  setDeadlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  setDeadlineText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Fixed bottom bar
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
  },

  // Emoji modal
  emojiOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  emojiSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  emojiSheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 16,
  },
  emojiGridBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiGridText: {
    fontSize: 24,
  },
  emojiNoneBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  emojiNoneText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Deadline modal
  deadlineSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    gap: 8,
  },
  dateInputLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  dateInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  deadlineActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  deadlineActionBtn: {
    flex: 1,
  },
});
