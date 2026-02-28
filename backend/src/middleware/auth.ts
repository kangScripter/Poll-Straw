import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/database.js';
import { Role } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Verify JWT token
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false, 
        error: 'Access token required' 
      });
      return;
    }

    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, isActive: true },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ 
        success: false, 
        error: 'User not found or inactive' 
      });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ 
        success: false, 
        error: 'Token expired' 
      });
      return;
    }
    
    res.status(401).json({ 
      success: false, 
      error: 'Invalid token' 
    });
  }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      req.user = decoded;
    }
    
    next();
  } catch {
    // Ignore token errors for optional auth
    next();
  }
};

// Role-based authorization
export const authorize = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions' 
      });
      return;
    }

    next();
  };
};

// Admin only middleware
export const adminOnly = authorize(Role.ADMIN);

// Poll creator or admin — verifies the requesting user is either an admin or the creator of the poll
export const creatorOrAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (req.user.role === Role.ADMIN) {
      return next();
    }

    const pollId = req.params.id || req.params.pollId;
    const poll = await prisma.poll.findFirst({
      where: {
        OR: [{ id: pollId }, { shareUrl: pollId }],
      },
      select: { creatorId: true },
    });

    if (!poll) {
      res.status(404).json({ success: false, error: 'Poll not found' });
      return;
    }

    if (poll.creatorId !== req.user.userId) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
