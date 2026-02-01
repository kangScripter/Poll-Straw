import { prisma } from '../config/database.js';
import { redis, redisHelpers } from '../config/redis.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateShareUrl, calculatePercentage, isDeadlinePassed } from '../utils/helpers.js';
import { ResultVisibility } from '@prisma/client';

export interface CreatePollInput {
  title: string;
  description?: string;
  options: { text: string; emoji?: string }[];
  settings?: {
    allowMultiple?: boolean;
    requireAuth?: boolean;
    showResults?: ResultVisibility;
    deadline?: Date;
    ipRestriction?: boolean;
    captchaRequired?: boolean;
  };
  creatorId?: string;
}

export interface PollWithResults {
  id: string;
  title: string;
  description: string | null;
  options: {
    id: string;
    text: string;
    emoji: string | null;
    voteCount: number;
    percentage: number;
  }[];
  totalVotes: number;
  viewCount: number;
  shareUrl: string;
  deadline: Date | null;
  isActive: boolean;
  showResults: ResultVisibility;
  allowMultiple: boolean;
  requireAuth: boolean;
  ipRestriction: boolean;
  createdAt: Date;
  hasVoted?: boolean;
}

export const pollService = {
  // Create a new poll
  async create(input: CreatePollInput): Promise<PollWithResults> {
    const { title, description, options, settings, creatorId } = input;

    if (options.length < 2) {
      throw new AppError('Poll must have at least 2 options', 400);
    }

    if (options.length > 20) {
      throw new AppError('Poll cannot have more than 20 options', 400);
    }

    // Generate unique share URL
    let shareUrl = generateShareUrl();
    let attempts = 0;
    
    while (attempts < 5) {
      const existing = await prisma.poll.findUnique({ where: { shareUrl } });
      if (!existing) break;
      shareUrl = generateShareUrl();
      attempts++;
    }

    const poll = await prisma.poll.create({
      data: {
        title,
        description,
        shareUrl,
        creatorId,
        allowMultiple: settings?.allowMultiple ?? false,
        requireAuth: settings?.requireAuth ?? false,
        showResults: settings?.showResults ?? ResultVisibility.ALWAYS,
        deadline: settings?.deadline,
        ipRestriction: settings?.ipRestriction ?? true,
        captchaRequired: settings?.captchaRequired ?? false,
        options: {
          create: options.map((opt, index) => ({
            text: opt.text,
            emoji: opt.emoji,
            order: index,
          })),
        },
      },
      include: {
        options: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return this.formatPollWithResults(poll);
  },

  // Resolve identifier (poll id or shareUrl) to the poll's actual id (for voting, etc.)
  async resolveIdentifierToPollId(identifier: string): Promise<string> {
    const byId = await prisma.poll.findUnique({
      where: { id: identifier },
      select: { id: true },
    });
    if (byId) return byId.id;
    const byShareUrl = await prisma.poll.findUnique({
      where: { shareUrl: identifier },
      select: { id: true },
    });
    if (byShareUrl) return byShareUrl.id;
    throw new AppError('Poll not found', 404);
  },

  // Get poll by ID or shareUrl (so /api/polls/zPjlp3UW works with share URL)
  async getById(idOrShareUrl: string, viewerIdentifier?: string): Promise<PollWithResults> {
    const id = await this.resolveIdentifierToPollId(idOrShareUrl);
    const poll = await prisma.poll.findUnique({
      where: { id },
      include: {
        options: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!poll) {
      throw new AppError('Poll not found', 404);
    }

    // Increment view count
    await prisma.poll.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    const result = this.formatPollWithResults(poll);

    // Check if viewer has voted
    if (viewerIdentifier) {
      const hasVoted = await redisHelpers.hasVoted(id, viewerIdentifier, 'ip');
      result.hasVoted = hasVoted;
    }

    return result;
  },

  // Get poll by share URL
  async getByShareUrl(shareUrl: string, viewerIdentifier?: string): Promise<PollWithResults> {
    const poll = await prisma.poll.findUnique({
      where: { shareUrl },
      include: {
        options: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!poll) {
      throw new AppError('Poll not found', 404);
    }

    // Increment view count
    await prisma.poll.update({
      where: { shareUrl },
      data: { viewCount: { increment: 1 } },
    });

    const result = this.formatPollWithResults(poll);

    // Check if viewer has voted
    if (viewerIdentifier) {
      const hasVoted = await redisHelpers.hasVoted(poll.id, viewerIdentifier, 'ip');
      result.hasVoted = hasVoted;
    }

    return result;
  },

  // Get user's polls
  async getUserPolls(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [polls, total] = await Promise.all([
      prisma.poll.findMany({
        where: { creatorId: userId },
        include: {
          options: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.poll.count({ where: { creatorId: userId } }),
    ]);

    return {
      data: polls.map(this.formatPollWithResults),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  },

  // Update poll
  async update(id: string, userId: string, updates: Partial<CreatePollInput>): Promise<PollWithResults> {
    const poll = await prisma.poll.findUnique({ where: { id } });

    if (!poll) {
      throw new AppError('Poll not found', 404);
    }

    if (poll.creatorId !== userId) {
      throw new AppError('Not authorized to update this poll', 403);
    }

    if (poll.totalVotes > 0) {
      throw new AppError('Cannot modify poll with existing votes', 400);
    }

    const updated = await prisma.poll.update({
      where: { id },
      data: {
        title: updates.title,
        description: updates.description,
        allowMultiple: updates.settings?.allowMultiple,
        requireAuth: updates.settings?.requireAuth,
        showResults: updates.settings?.showResults,
        deadline: updates.settings?.deadline,
        ipRestriction: updates.settings?.ipRestriction,
      },
      include: {
        options: {
          orderBy: { order: 'asc' },
        },
      },
    });

    // Invalidate cache
    await redisHelpers.invalidateResults(id);

    return this.formatPollWithResults(updated);
  },

  // Delete poll
  async delete(id: string, userId: string, isAdmin: boolean = false): Promise<void> {
    const poll = await prisma.poll.findUnique({ where: { id } });

    if (!poll) {
      throw new AppError('Poll not found', 404);
    }

    if (!isAdmin && poll.creatorId !== userId) {
      throw new AppError('Not authorized to delete this poll', 403);
    }

    await prisma.poll.delete({ where: { id } });

    // Invalidate cache
    await redisHelpers.invalidateResults(id);
  },

  // Close poll
  async closePoll(id: string, userId: string): Promise<PollWithResults> {
    const poll = await prisma.poll.findUnique({ where: { id } });

    if (!poll) {
      throw new AppError('Poll not found', 404);
    }

    if (poll.creatorId !== userId) {
      throw new AppError('Not authorized to close this poll', 403);
    }

    const updated = await prisma.poll.update({
      where: { id },
      data: { isActive: false },
      include: {
        options: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return this.formatPollWithResults(updated);
  },

  // Get poll results (cached)
  async getResults(pollId: string): Promise<PollWithResults> {
    // Try cache first
    const cached = await redisHelpers.getCachedResults(pollId);
    if (cached) {
      return JSON.parse(cached);
    }

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!poll) {
      throw new AppError('Poll not found', 404);
    }

    const results = this.formatPollWithResults(poll);

    // Cache results for 5 seconds
    await redisHelpers.cacheResults(pollId, results, 5);

    return results;
  },

  // Helper: Format poll with calculated results
  formatPollWithResults(poll: any): PollWithResults {
    const totalVotes = poll.totalVotes || poll.options.reduce((sum: number, opt: any) => sum + opt.voteCount, 0);

    return {
      id: poll.id,
      title: poll.title,
      description: poll.description,
      options: poll.options.map((opt: any) => ({
        id: opt.id,
        text: opt.text,
        emoji: opt.emoji,
        voteCount: opt.voteCount,
        percentage: calculatePercentage(opt.voteCount, totalVotes),
      })),
      totalVotes,
      viewCount: poll.viewCount,
      shareUrl: poll.shareUrl,
      deadline: poll.deadline,
      isActive: poll.isActive && !isDeadlinePassed(poll.deadline),
      showResults: poll.showResults,
      allowMultiple: poll.allowMultiple,
      requireAuth: poll.requireAuth,
      ipRestriction: poll.ipRestriction,
      createdAt: poll.createdAt,
    };
  },
};
