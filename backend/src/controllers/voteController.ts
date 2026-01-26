import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { voteService } from '../services/voteService.js';
import { AuthRequest } from '../middleware/auth.js';
import { getClientIp } from '../middleware/rateLimiter.js';

// Validation schemas
const castVoteSchema = z.object({
  optionId: z.string().min(1, 'Option ID is required'),
  sessionId: z.string().optional(),
  deviceId: z.string().optional(),
});

export const voteController = {
  // POST /api/polls/:id/vote
  async castVote(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: pollId } = req.params;
      const { optionId, sessionId, deviceId } = castVoteSchema.parse(req.body);
      const clientIp = getClientIp(req);

      const result = await voteService.castVote({
        pollId,
        optionId,
        userId: req.user?.userId,
        ipAddress: clientIp,
        sessionId,
        deviceId,
      });

      res.status(201).json({
        success: true,
        message: 'Vote cast successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/polls/:id/votes (admin only)
  async getVotes(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: pollId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

      const result = await voteService.getPollVotes(pollId, page, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/polls/:pollId/votes/:voteId (admin only)
  async deleteVote(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { pollId, voteId } = req.params;

      await voteService.deleteVote(voteId, pollId);

      res.json({
        success: true,
        message: 'Vote deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};
