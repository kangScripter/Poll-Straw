import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { ReportStatus } from '@prisma/client';

export const adminController = {
  // GET /api/admin/analytics
  async getAnalytics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const [
        totalPolls,
        totalVotes,
        totalUsers,
        activePolls,
        pendingReports,
        pollsToday,
        votesToday,
        usersToday,
      ] = await Promise.all([
        prisma.poll.count(),
        prisma.vote.count(),
        prisma.user.count(),
        prisma.poll.count({ where: { isActive: true } }),
        prisma.report.count({ where: { status: 'PENDING' } }),
        prisma.poll.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        prisma.vote.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
      ]);

      // Get recent polls
      const recentPolls = await prisma.poll.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { id: true, email: true, name: true },
          },
          options: {
            select: {
              id: true,
              text: true,
              emoji: true,
              voteCount: true,
            },
          },
          _count: {
            select: { votes: true, reports: true },
          },
        },
      });

      // Get top polls by votes
      const topPolls = await prisma.poll.findMany({
        take: 5,
        orderBy: { totalVotes: 'desc' },
        include: {
          creator: {
            select: { id: true, email: true, name: true },
          },
          options: {
            select: {
              id: true,
              text: true,
              emoji: true,
              voteCount: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: {
          overview: {
            totalPolls,
            totalVotes,
            totalUsers,
            activePolls,
            pendingReports,
          },
          today: {
            polls: pollsToday,
            votes: votesToday,
            users: usersToday,
          },
          recentPolls,
          topPolls,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/admin/reports
  async getReports(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as ReportStatus | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const skip = (page - 1) * limit;

      const where = status ? { status } : {};

      const [reports, total] = await Promise.all([
        prisma.report.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            poll: {
              include: {
                creator: {
                  select: { id: true, email: true, name: true },
                },
                options: {
                  select: {
                    id: true,
                    text: true,
                    emoji: true,
                    voteCount: true,
                  },
                },
                _count: {
                  select: { votes: true },
                },
              },
            },
          },
        }),
        prisma.report.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          reports,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/admin/reports/:id
  async updateReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = z.object({
        status: z.enum(['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED']),
      }).parse(req.body);

      const report = await prisma.report.findUnique({
        where: { id },
      });

      if (!report) {
        throw new AppError('Report not found', 404);
      }

      const updatedReport = await prisma.report.update({
        where: { id },
        data: { status },
        include: {
          poll: {
            include: {
              creator: {
                select: { id: true, email: true, name: true },
              },
              options: {
                select: {
                  id: true,
                  text: true,
                  emoji: true,
                  voteCount: true,
                },
              },
            },
          },
        },
      });

      res.json({
        success: true,
        message: 'Report updated successfully',
        data: { report: updatedReport },
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/admin/polls/:id
  async deletePoll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const poll = await prisma.poll.findUnique({
        where: { id },
      });

      if (!poll) {
        throw new AppError('Poll not found', 404);
      }

      await prisma.poll.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Poll deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/admin/users
  async getUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const skip = (page - 1) * limit;
      const search = req.query.search as string | undefined;

      const where = search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' as const } },
              { name: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            createdAt: true,
            _count: {
              select: {
                polls: true,
                votes: true,
              },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/admin/users/:id
  async updateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { role, isActive } = z.object({
        role: z.enum(['GUEST', 'USER', 'ADMIN']).optional(),
        isActive: z.boolean().optional(),
      }).parse(req.body);

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Prevent self-deactivation or role change
      if (req.user?.userId === id && (isActive === false || role !== user.role)) {
        throw new AppError('Cannot modify your own account', 400);
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...(role !== undefined && { role }),
          ...(isActive !== undefined && { isActive }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user: updatedUser },
      });
    } catch (error) {
      next(error);
    }
  },
};
