import apiClient from './client';
import { ApiResponse, Poll, CreatePollInput, PaginatedResponse, VoteResult } from '@/types';

export const pollApi = {
  // Create a new poll
  async create(data: CreatePollInput): Promise<ApiResponse<{ poll: Poll }>> {
    const response = await apiClient.post('/polls', data);
    return response.data;
  },

  // Get poll by ID
  async getById(id: string): Promise<ApiResponse<{ poll: Poll }>> {
    const response = await apiClient.get(`/polls/${id}`);
    return response.data;
  },

  // Get poll by share URL
  async getByShareUrl(shareUrl: string): Promise<ApiResponse<{ poll: Poll }>> {
    const response = await apiClient.get(`/polls/share/${shareUrl}`);
    return response.data;
  },

  // Get poll results
  async getResults(id: string): Promise<ApiResponse<{ results: Poll }>> {
    const response = await apiClient.get(`/polls/${id}/results`);
    return response.data;
  },

  // Update poll
  async update(id: string, data: Partial<CreatePollInput>): Promise<ApiResponse<{ poll: Poll }>> {
    const response = await apiClient.put(`/polls/${id}`, data);
    return response.data;
  },

  // Delete poll
  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete(`/polls/${id}`);
    return response.data;
  },

  // Close poll
  async close(id: string): Promise<ApiResponse<{ poll: Poll }>> {
    const response = await apiClient.post(`/polls/${id}/close`);
    return response.data;
  },

  // Cast vote
  async vote(pollId: string, optionId: string, sessionId?: string, deviceId?: string): Promise<ApiResponse<VoteResult>> {
    const response = await apiClient.post(`/polls/${pollId}/vote`, {
      optionId,
      sessionId,
      deviceId,
    });
    return response.data;
  },
};
