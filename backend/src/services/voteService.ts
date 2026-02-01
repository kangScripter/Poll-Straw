import { prisma } from '../config/database.js';
import { redis, redisHelpers } from '../config/redis.js';
import { AppError } from '../middleware/errorHandler.js';
import { isDeadlinePassed, calculatePercentage } from '../utils/helpers.js';
import { pollService, PollWithResults } from './pollService.js';

export interface CastVoteInput {
  pollId: string;
  optionId: string;
  userId?: string;
  ipAddress?: string;
  sessionId?: string;
  deviceId?: string;
}

export interface VoteResult {
  success: boolean;
  vote: {
    id: string;
    pollId: string;
    optionId: string;
    createdAt: Date;
  };
  results: PollWithResults;
}

export const voteService = {
  // Cast a vote
  async castVote(input: CastVoteInput): Promise<VoteResult> {
    const { pollId, optionId, userId, ipAddress, sessionId, deviceId } = input;

    // Get poll with options
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: true,
      },
    });

    if (!poll) {
      throw new AppError('Poll not found', 404);
    }

    // Check if poll is active
    if (!poll.isActive) {
      throw new AppError('Poll is closed', 400);
    }

    // Check deadline
    if (isDeadlinePassed(poll.deadline)) {
      throw new AppError('Poll deadline has passed', 400);
    }

    // Check if option exists
    const option = poll.options.find((opt) => opt.id === optionId);
    if (!option) {
      throw new AppError('Invalid option', 400);
    }

    // Check authentication requirement
    if (poll.requireAuth && !userId) {
      throw new AppError('Authentication required to vote', 401);
    }

    // Check for duplicate votes (only if allowMultiple is false)
    if (!poll.allowMultiple) {
      await this.checkDuplicateVote(poll, { userId, ipAddress, sessionId, deviceId });
    }

    // Create vote in transaction
    const vote = await prisma.$transaction(async (tx) => {
      // Create vote record
      const newVote = await tx.vote.create({
        data: {
          pollId,
          optionId,
          userId,
          ipAddress,
          sessionId,
          deviceId,
        },
      });

      // Increment option vote count
      await tx.pollOption.update({
        where: { id: optionId },
        data: {
          voteCount: { increment: 1 },
        },
      });

      // Increment poll total votes
      await tx.poll.update({
        where: { id: pollId },
        data: {
          totalVotes: { increment: 1 },
        },
      });

      return newVote;
    });

    // Mark as voted in Redis for duplicate prevention
    if (ipAddress && poll.ipRestriction) {
      await redisHelpers.markVoted(pollId, ipAddress, 'ip', 86400); // 24 hours
    }
    if (sessionId) {
      await redisHelpers.markVoted(pollId, sessionId, 'session', 86400);
    }
    if (deviceId) {
      await redisHelpers.markVoted(pollId, deviceId, 'device', 86400);
    }

    // Invalidate cache
    await redisHelpers.invalidateResults(pollId);

    // Get updated results
    const results = await pollService.getResults(pollId);

    // Publish real-time update
    await redisHelpers.publishVoteUpdate(pollId, results);

    return {
      success: true,
      vote: {
        id: vote.id,
        pollId: vote.pollId,
        optionId: vote.optionId,
        createdAt: vote.createdAt,
      },
      results,
    };
  },

  // Check for duplicate votes
  async checkDuplicateVote(
    poll: any,
    identifiers: {
      userId?: string;
      ipAddress?: string;
      sessionId?: string;
      deviceId?: string;
    }
  ): Promise<void> {
    const { userId, ipAddress, sessionId, deviceId } = identifiers;

    // Check user-based restriction
    if (userId) {
      const existingUserVote = await prisma.vote.findFirst({
        where: { pollId: poll.id, userId },
      });

      if (existingUserVote) {
        throw new AppError('You already voted this', 400);
      }
    }

    // Check IP-based restriction
    if (poll.ipRestriction && ipAddress) {
      // Check Redis cache first (faster)
      const hasVotedRedis = await redisHelpers.hasVoted(poll.id, ipAddress, 'ip');
      if (hasVotedRedis) {
        throw new AppError('You already voted this', 400);
      }

      // Check database as fallback
      const existingIpVote = await prisma.vote.findFirst({
        where: { pollId: poll.id, ipAddress },
      });

      if (existingIpVote) {
        throw new AppError('You already voted this', 400);
      }
    }

    // Check session-based restriction
    if (sessionId) {
      const hasVotedSession = await redisHelpers.hasVoted(poll.id, sessionId, 'session');
      if (hasVotedSession) {
        throw new AppError('You already voted this', 400);
      }
    }

    // Check device-based restriction
    if (deviceId) {
      const hasVotedDevice = await redisHelpers.hasVoted(poll.id, deviceId, 'device');
      if (hasVotedDevice) {
        throw new AppError('You already voted this', 400);
      }
    }
  },

  // Get votes for a poll (admin only)
  async getPollVotes(pollId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [votes, total] = await Promise.all([
      prisma.vote.findMany({
        where: { pollId },
        include: {
          option: {
            select: { id: true, text: true },
          },
          user: {
            select: { id: true, email: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.vote.count({ where: { pollId } }),
    ]);

    return {
      data: votes,
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

  // Delete a vote (admin only)
  async deleteVote(voteId: string, pollId: string): Promise<void> {
    const vote = await prisma.vote.findUnique({
      where: { id: voteId },
    });

    if (!vote) {
      throw new AppError('Vote not found', 404);
    }

    if (vote.pollId !== pollId) {
      throw new AppError('Vote does not belong to this poll', 400);
    }

    await prisma.$transaction(async (tx) => {
      // Delete vote
      await tx.vote.delete({
        where: { id: voteId },
      });

      // Decrement option vote count
      await tx.pollOption.update({
        where: { id: vote.optionId },
        data: {
          voteCount: { decrement: 1 },
        },
      });

      // Decrement poll total votes
      await tx.poll.update({
        where: { id: pollId },
        data: {
          totalVotes: { decrement: 1 },
        },
      });
    });

    // Invalidate cache
    await redisHelpers.invalidateResults(pollId);
  },
};
