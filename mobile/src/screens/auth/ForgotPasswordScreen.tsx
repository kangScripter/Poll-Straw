import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '@/services/api/authApi';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useTheme } from '@/theme';
import { RootStackParamList } from '@/types';

type ForgotPasswordScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      const response = await authApi.forgotPassword(email.trim());

      if (response.success) {
        Alert.alert(
          'Check Your Email',
          'If an account exists with this email, a password reset link has been sent. Please check your inbox and follow the instructions.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ marginTop: 20, marginBottom: 32 }}>
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: theme.surfaceSubtle,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text style={{ fontSize: 28, fontWeight: '700', color: theme.textPrimary, marginBottom: 8 }}>
              Forgot Password
            </Text>
            <Text style={{ fontSize: 16, color: theme.textSecondary, lineHeight: 22 }}>
              Enter your email address and we'll send you a link to reset your password
            </Text>
          </View>

          {/* Form */}
          <View style={{ gap: 20 }}>
            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              leftIcon={<Ionicons name="mail-outline" size={20} color={theme.textTertiary} />}
            />

            <Button
              title={isLoading ? 'Sending...' : 'Send Reset Link'}
              onPress={handleSubmit}
              disabled={isLoading || !email.trim()}
              size="lg"
            />

            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <Text style={{ fontSize: 14, color: theme.textSecondary }}>Remember your password?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.primary }}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
