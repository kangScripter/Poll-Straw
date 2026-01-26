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
    data: {
      name: 'PollStraw API',
      version: '1.0.0',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/polls', pollRoutes);
router.use('/user', userRoutes);
router.use('/admin', adminRoutes);

export default router;
