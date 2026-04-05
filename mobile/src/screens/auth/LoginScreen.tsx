import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useTheme } from '@/theme';
import { RootStackParamList } from '@/types';
import { handleApiError } from '@/services/api/client';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const { theme } = useTheme();
  const login = useAuthStore((state) => state.login);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
    } catch (error) {
      Alert.alert('Login Failed', handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 24,
            justifyContent: 'center',
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo / Header */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                backgroundColor: theme.primarySubtle,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              <Ionicons name="checkbox" size={48} color={theme.primary} />
            </View>
            <Text
              style={{
                fontSize: 28,
                fontWeight: '700',
                color: theme.textPrimary,
                marginBottom: 8,
              }}
            >
              Welcome Back
            </Text>
            <Text style={{ fontSize: 16, color: theme.textSecondary }}>
              Sign in to continue to PollStraw
            </Text>
          </View>

          {/* Card wrapper */}
          <View
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderWidth: 1,
              borderTopWidth: 3,
              borderTopColor: theme.borderAccent,
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
            }}
          >
            {/* Form */}
            <View style={{ marginBottom: 24 }}>
              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={errors.email}
                leftIcon={
                  <Ionicons name="mail-outline" size={20} color={theme.textTertiary} />
                }
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                isPassword
                error={errors.password}
                leftIcon={
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={theme.textTertiary}
                  />
                }
              />

              <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 24 }}>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: theme.primary,
                      fontWeight: '500',
                    }}
                  >
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={isLoading}
                fullWidth
                size="lg"
              />
            </View>

            {/* Divider with "or" */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <View
                style={{ flex: 1, height: 1, backgroundColor: theme.divider }}
              />
              <Text
                style={{
                  marginHorizontal: 16,
                  fontSize: 13,
                  color: theme.textTertiary,
                }}
              >
                or
              </Text>
              <View
                style={{ flex: 1, height: 1, backgroundColor: theme.divider }}
              />
            </View>

            {/* Skip for guests */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 12,
              }}
              onPress={() => navigation.navigate('MainTabs')}
            >
              <Text style={{ fontSize: 14, color: theme.textTertiary }}>
                Continue as Guest
              </Text>
              <Ionicons name="arrow-forward" size={16} color={theme.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 4,
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 14, color: theme.textSecondary }}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.primary,
                  fontWeight: '600',
                }}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
