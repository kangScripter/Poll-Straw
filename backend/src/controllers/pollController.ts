import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pollService } from '../services/pollService.js';
import { AuthRequest } from '../middleware/auth.js';
import { getClientIp } from '../middleware/rateLimiter.js';
import { ResultVisibility } from '@prisma/client';

// Validation schemas
const createPollSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(1000).optional(),
  options: z
    .array(
      z.object({
        text: z.string().min(1, 'Option text is required').max(200),
        emoji: z.string().max(10).optional(),
      })
    )
    .min(2, 'Poll must have at least 2 options')
    .max(20, 'Poll cannot have more than 20 options'),
  settings: z
    .object({
      allowMultiple: z.boolean().optional(),
      requireAuth: z.boolean().optional(),
      showResults: z.nativeEnum(ResultVisibility).optional(),
      deadline: z.string().datetime().optional(),
      ipRestriction: z.boolean().optional(),
      captchaRequired: z.boolean().optional(),
    })
    .optional(),
});

const updatePollSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(1000).optional(),
  settings: z
    .object({
      allowMultiple: z.boolean().optional(),
      requireAuth: z.boolean().optional(),
      showResults: z.nativeEnum(ResultVisibility).optional(),
      deadline: z.string().datetime().optional(),
      ipRestriction: z.boolean().optional(),
    })
    .optional(),
});

export const pollController = {
  // POST /api/polls
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createPollSchema.parse(req.body);
      
      const poll = await pollService.create({
        ...data,
        settings: data.settings
          ? {
              ...data.settings,
              deadline: data.settings.deadline ? new Date(data.settings.deadline) : undefined,
            }
          : undefined,
        creatorId: req.user?.userId,
      });

      res.status(201).json({
        success: true,
        message: 'Poll created successfully',
        data: { poll },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/polls/:id
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const clientIp = getClientIp(req);
      
      const poll = await pollService.getById(id, clientIp);

      res.json({
        success: true,
        data: { poll },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/polls/share/:shareUrl
  async getByShareUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { shareUrl } = req.params;
      const clientIp = getClientIp(req);
      
      const poll = await pollService.getByShareUrl(shareUrl, clientIp);

      res.json({
        success: true,
        data: { poll },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/polls/:id/results (id can be poll id or shareUrl)
  async getResults(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idOrShareUrl = req.params.id;
      const id = await pollService.resolveIdentifierToPollId(idOrShareUrl);
      const results = await pollService.getResults(id);

      res.json({
        success: true,
        data: { results },
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/polls/:id
  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const idOrShareUrl = req.params.id;
      const id = await pollService.resolveIdentifierToPollId(idOrShareUrl);
      const data = updatePollSchema.parse(req.body);

      const poll = await pollService.update(id, req.user.userId, {
        ...data,
        settings: data.settings
          ? {
              ...data.settings,
              deadline: data.settings.deadline ? new Date(data.settings.deadline) : undefined,
            }
          : undefined,
      });

      res.json({
        success: true,
        message: 'Poll updated successfully',
        data: { poll },
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/polls/:id
  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const idOrShareUrl = req.params.id;
      const id = await pollService.resolveIdentifierToPollId(idOrShareUrl);
      const isAdmin = req.user.role === 'ADMIN';

      await pollService.delete(id, req.user.userId, isAdmin);

      res.json({
        success: true,
        message: 'Poll deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/polls/:id/close
  async close(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const idOrShareUrl = req.params.id;
      const id = await pollService.resolveIdentifierToPollId(idOrShareUrl);
      const poll = await pollService.closePoll(id, req.user.userId);

      res.json({
        success: true,
        message: 'Poll closed successfully',
        data: { poll },
      });
    } catch (error) {
      next(error);
    }
  },
};
