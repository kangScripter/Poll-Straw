import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(adminOnly);

// Analytics
router.get('/analytics', adminController.getAnalytics);

// Reports
router.get('/reports', adminController.getReports);
router.put('/reports/:id', adminController.updateReport);

// Polls
router.delete('/polls/:id', adminController.deletePoll);

// Users
router.get('/users', adminController.getUsers);
router.put('/users/:id', adminController.updateUser);

export default router;
