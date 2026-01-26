import { create } from 'zustand';
import { Poll, CreatePollInput, PaginatedResponse } from '@/types';
import { pollApi } from '@/services/api/pollApi';

interface PollState {
  currentPoll: Poll | null;
  userPolls: Poll[];
  userPollsPagination: PaginatedResponse<Poll>['pagination'] | null;
  isLoading: boolean;
  error: string | null;
}

interface PollStore extends PollState {
  // Actions
  createPoll: (data: CreatePollInput) => Promise<Poll>;
  fetchPoll: (id: string) => Promise<void>;
  fetchPollByShareUrl: (shareUrl: string) => Promise<void>;
  fetchUserPolls: (page?: number) => Promise<void>;
  updatePoll: (id: string, data: Partial<CreatePollInput>) => Promise<void>;
  deletePoll: (id: string) => Promise<void>;
  closePoll: (id: string) => Promise<void>;
  castVote: (pollId: string, optionId: string) => Promise<void>;
  setCurrentPoll: (poll: Poll | null) => void;
  clearError: () => void;
}

export const usePollStore = create<PollStore>((set, get) => ({
  currentPoll: null,
  userPolls: [],
  userPollsPagination: null,
  isLoading: false,
  error: null,

  createPoll: async (data: CreatePollInput) => {
    set({ isLoading: true, error: null });
    try {
      const response = await pollApi.create(data);
      if (response.success && response.data) {
        const poll = response.data.poll;
        set({ currentPoll: poll, isLoading: false });
        return poll;
      }
      throw new Error('Failed to create poll');
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to create poll';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  fetchPoll: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await pollApi.getById(id);
      if (response.success && response.data) {
        set({ currentPoll: response.data.poll, isLoading: false });
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to fetch poll';
      set({ error: errorMsg, isLoading: false });
    }
  },

  fetchPollByShareUrl: async (shareUrl: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await pollApi.getByShareUrl(shareUrl);
      if (response.success && response.data) {
        set({ currentPoll: response.data.poll, isLoading: false });
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Poll not found';
      set({ error: errorMsg, isLoading: false });
    }
  },

  fetchUserPolls: async (page: number = 1) => {
    set({ isLoading: true, error: null });
    try {
      // Use userApi instead of pollApi for user polls
      const { userApi } = await import('@/services/api/userApi');
      const response = await userApi.getPolls(page);
      if (response.success && response.data) {
        const { data, pagination } = response.data;
        set({
          userPolls: page === 1 ? data : [...get().userPolls, ...data],
          userPollsPagination: pagination,
          isLoading: false,
        });
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to fetch polls';
      set({ error: errorMsg, isLoading: false });
    }
  },

  updatePoll: async (id: string, data: Partial<CreatePollInput>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await pollApi.update(id, data);
      if (response.success && response.data) {
        set({ currentPoll: response.data.poll, isLoading: false });
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to update poll';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  deletePoll: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await pollApi.delete(id);
      set({
        userPolls: get().userPolls.filter((p) => p.id !== id),
        currentPoll: null,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to delete poll';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  closePoll: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await pollApi.close(id);
      if (response.success && response.data) {
        set({ currentPoll: response.data.poll, isLoading: false });
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to close poll';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  castVote: async (pollId: string, optionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await pollApi.vote(pollId, optionId);
      if (response.success && response.data) {
        set({ currentPoll: response.data.results, isLoading: false });
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to cast vote';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  setCurrentPoll: (poll: Poll | null) => {
    set({ currentPoll: poll });
  },

  clearError: () => {
    set({ error: null });
  },
}));
