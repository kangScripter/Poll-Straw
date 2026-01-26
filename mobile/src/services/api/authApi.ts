import apiClient from './client';
import { ApiResponse, User } from '@/types';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const authApi = {
  // Register new user
  async register(data: RegisterInput): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  // Login user
  async login(data: LoginInput): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  // Refresh tokens
  async refresh(refreshToken: string): Promise<ApiResponse<{ tokens: AuthResponse['tokens'] }>> {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // Logout
  async logout(refreshToken?: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post('/auth/logout', { refreshToken });
    return response.data;
  },

  // Get current user
  async me(): Promise<ApiResponse<{ user: User }>> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Forgot password
  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },
};
