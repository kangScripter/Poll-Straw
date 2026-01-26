import apiClient from './client';
import { ApiResponse, Poll, User } from '@/types';

export interface AdminAnalytics {
  overview: {
    totalPolls: number;
    totalVotes: number;
    totalUsers: number;
    activePolls: number;
    pendingReports: number;
  };
  today: {
    polls: number;
    votes: number;
    users: number;
  };
  recentPolls: Poll[];
  topPolls: Poll[];
}

export interface Report {
  id: string;
  reason: 'SPAM' | 'INAPPROPRIATE' | 'FRAUD' | 'OTHER';
  details: string | null;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  pollId: string;
  poll: Poll;
  reporterIp: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser extends User {
  isActive: boolean;
  pollsCount: number;
  votesCount: number;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const adminApi = {
  // Get analytics
  async getAnalytics(): Promise<ApiResponse<AdminAnalytics>> {
    const response = await apiClient.get('/admin/analytics');
    return response.data;
  },

  // Get reports
  async getReports(
    status?: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED',
    page: number = 1
  ): Promise<ApiResponse<{ reports: Report[]; pagination: PaginatedResponse<Report>['pagination'] }>> {
    const response = await apiClient.get('/admin/reports', {
      params: { status, page },
    });
    return response.data;
  },

  // Update report status
  async updateReport(
    reportId: string,
    status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED'
  ): Promise<ApiResponse<{ report: Report }>> {
    const response = await apiClient.put(`/admin/reports/${reportId}`, { status });
    return response.data;
  },

  // Delete poll (admin)
  async deletePoll(pollId: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete(`/admin/polls/${pollId}`);
    return response.data;
  },

  // Get users
  async getUsers(page: number = 1, search?: string): Promise<ApiResponse<{ users: AdminUser[]; pagination: PaginatedResponse<AdminUser>['pagination'] }>> {
    const response = await apiClient.get('/admin/users', {
      params: { page, search },
    });
    return response.data;
  },

  // Update user
  async updateUser(
    userId: string,
    data: { role?: 'GUEST' | 'USER' | 'ADMIN'; isActive?: boolean }
  ): Promise<ApiResponse<{ user: AdminUser }>> {
    const response = await apiClient.put(`/admin/users/${userId}`, data);
    return response.data;
  },
};
