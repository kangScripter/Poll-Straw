import { customAlphabet } from 'nanoid';

// Generate unique share URL (8 characters, URL-safe)
const nanoidUrl = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

export const generateShareUrl = (): string => {
  return nanoidUrl();
};

// Generate session ID (16 characters)
const nanoidSession = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 16);

export const generateSessionId = (): string => {
  return nanoidSession();
};

// Format date for display
export const formatDate = (date: Date): string => {
  return date.toISOString();
};

// Check if deadline has passed
export const isDeadlinePassed = (deadline: Date | null): boolean => {
  if (!deadline) return false;
  return new Date() > deadline;
};

// Calculate vote percentage
export const calculatePercentage = (voteCount: number, totalVotes: number): number => {
  if (totalVotes === 0) return 0;
  return Math.round((voteCount / totalVotes) * 100);
};

// Paginate results
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
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

export const paginate = <T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResult<T> => {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

// Sleep utility for rate limiting
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
