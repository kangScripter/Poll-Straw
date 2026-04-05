import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { userApi } from '@/services/api/userApi';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { AccentCard } from '@/components/common/AccentCard';
import { useTheme } from '@/theme';
import { RootStackParamList } from '@/types';

type EditProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name cannot be empty');
      return;
    }

    try {
      setIsLoading(true);
      const response = await userApi.updateProfile({ name: name.trim() });
      if (response.success && response.data) {
        setUser(response.data.user);
        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: theme.surfaceSubtle }]}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          </TouchableOpacity>

          <AccentCard style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Profile Information</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
              <View
                style={[
                  styles.readOnlyInput,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text style={[styles.readOnlyText, { color: theme.textTertiary }]}>{user?.email}</Text>
              </View>
              <Text style={[styles.hint, { color: theme.textTertiary }]}>Email cannot be changed</Text>
            </View>

            <View style={styles.inputGroup}>
              <Input
                label="Name"
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                maxLength={50}
                autoCapitalize="words"
              />
            </View>
          </AccentCard>

          <View style={styles.actions}>
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              size="lg"
              fullWidth
            />
            <Button
              title={isLoading ? 'Saving...' : 'Save Changes'}
              onPress={handleSave}
              disabled={isLoading}
              size="lg"
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  card: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  readOnlyInput: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  readOnlyText: {
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    gap: 12,
  },
});
