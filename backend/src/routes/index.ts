import { Router } from 'express';
import authRoutes from './authRoutes.js';
import pollRoutes from './pollRoutes.js';
import userRoutes from './userRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/polls', pollRoutes);
router.use('/user', userRoutes);
router.use('/admin', adminRoutes);

export default router;
