import apiClient from './client';
import { ApiResponse, User, Poll, PaginatedResponse } from '@/types';

export interface UserProfile extends User {
  pollsCount: number;
  votesCount: number;
  createdAt: string;
}

export interface UpdateProfileInput {
  name?: string;
}

export const userApi = {
  // Get user profile
  async getProfile(): Promise<ApiResponse<{ user: UserProfile }>> {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },

  // Update profile
  async updateProfile(data: UpdateProfileInput): Promise<ApiResponse<{ user: User }>> {
    const response = await apiClient.put('/user/profile', data);
    return response.data;
  },

  // Get user's polls
  async getPolls(page: number = 1, limit: number = 10): Promise<ApiResponse<PaginatedResponse<Poll>>> {
    const response = await apiClient.get('/user/polls', {
      params: { page, limit },
    });
    return response.data;
  },

  // Delete account
  async deleteAccount(): Promise<ApiResponse<null>> {
    const response = await apiClient.delete('/user/account');
    return response.data;
  },
};
