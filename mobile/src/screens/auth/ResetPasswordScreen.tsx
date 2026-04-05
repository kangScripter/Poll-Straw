import React, { useState, useEffect } from 'react';
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
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '@/services/api/authApi';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useTheme } from '@/theme';
import { RootStackParamList } from '@/types';

type ResetPasswordScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = () => {
  const { theme } = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, 'ResetPassword'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const token = route.params?.token || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      Alert.alert('Invalid Link', 'The reset link is invalid or has expired.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    }
  }, [token]);

  const handleSubmit = async () => {
    if (!password.trim()) {
      Alert.alert('Validation Error', 'Please enter a new password');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Validation Error', 'Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      const response = await authApi.resetPassword(token, password);

      if (response.success) {
        Alert.alert(
          'Success',
          'Your password has been reset successfully. Please login with your new password.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reset password');
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
              Reset Password
            </Text>
            <Text style={{ fontSize: 16, color: theme.textSecondary, lineHeight: 22 }}>
              Enter your new password below
            </Text>
          </View>

          {/* Form */}
          <View style={{ gap: 16 }}>
            <Input
              label="New Password"
              placeholder="Enter new password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.textTertiary} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={theme.textTertiary}
                  />
                </TouchableOpacity>
              }
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.textTertiary} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={theme.textTertiary}
                  />
                </TouchableOpacity>
              }
            />

            <Text style={{ fontSize: 12, color: theme.textTertiary, marginTop: -8 }}>
              Password must be at least 8 characters long
            </Text>

            <Button
              title={isLoading ? 'Resetting...' : 'Reset Password'}
              onPress={handleSubmit}
              disabled={isLoading || !password.trim() || !confirmPassword.trim()}
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
