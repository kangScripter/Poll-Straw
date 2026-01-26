// User types
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'GUEST' | 'USER' | 'ADMIN';
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Poll types
export interface PollOption {
  id: string;
  text: string;
  emoji: string | null;
  voteCount: number;
  percentage: number;
}

export interface Poll {
  id: string;
  title: string;
  description: string | null;
  options: PollOption[];
  totalVotes: number;
  viewCount: number;
  shareUrl: string;
  deadline: string | null;
  isActive: boolean;
  showResults: 'ALWAYS' | 'AFTER_VOTE' | 'AFTER_DEADLINE' | 'NEVER';
  allowMultiple: boolean;
  requireAuth: boolean;
  ipRestriction: boolean;
  createdAt: string;
  hasVoted?: boolean;
}

export interface CreatePollInput {
  title: string;
  description?: string;
  options: { text: string; emoji?: string }[];
  settings?: {
    allowMultiple?: boolean;
    requireAuth?: boolean;
    showResults?: Poll['showResults'];
    deadline?: string;
    ipRestriction?: boolean;
  };
}

// API types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: { field: string; message: string }[];
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

// Vote types
export interface VoteResult {
  success: boolean;
  vote: {
    id: string;
    pollId: string;
    optionId: string;
    createdAt: string;
  };
  results: Poll;
}

// Navigation types
export type RootStackParamList = {
  // Auth screens
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string } | undefined;
  
  // Main screens
  MainTabs: undefined;
  PollDetail: { pollId: string };
  CreatePoll: undefined;
  Vote: { pollId: string };
  Results: { pollId: string };
  Share: { pollId: string; shareUrl: string };
  
  // User screens
  Profile: undefined;
  EditProfile: undefined;
  MyPolls: undefined;
  
  // Admin screens
  AdminDashboard: undefined;
  AdminModeration: { filter?: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED' } | undefined;
  AdminUsers: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Create: undefined;
  Dashboard: undefined;
  Profile: undefined;
};
