import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database.js';
import { pollService } from '../services/pollService.js';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
});

export const userController = {
  // GET /api/user/profile
  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              polls: true,
              votes: true,
            },
          },
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({
        success: true,
        data: {
          user: {
            ...user,
            pollsCount: user._count.polls,
            votesCount: user._count.votes,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/user/profile
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const data = updateProfileSchema.parse(req.body);

      const user = await prisma.user.update({
        where: { id: req.user.userId },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/user/polls
  async getPolls(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

      const result = await pollService.getUserPolls(req.user.userId, page, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/user/account
  async deleteAccount(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      // Anonymize votes (GDPR: remove PII from vote records)
      await prisma.vote.updateMany({
        where: { userId: req.user.userId },
        data: { userId: null, ipAddress: null, sessionId: null, deviceId: null },
      });

      // Delete password reset tokens
      await prisma.passwordResetToken.deleteMany({
        where: { userId: req.user.userId },
      });

      // Delete refresh tokens
      await prisma.refreshToken.deleteMany({
        where: { userId: req.user.userId },
      });

      // Soft delete - mark as inactive and clear personal data
      await prisma.user.update({
        where: { id: req.user.userId },
        data: { isActive: false, name: null, email: `deleted_${req.user.userId}@removed.local` },
      });

      res.json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};
