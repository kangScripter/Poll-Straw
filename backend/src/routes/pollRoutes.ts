import { Router } from 'express';
import { pollController } from '../controllers/pollController.js';
import { voteController } from '../controllers/voteController.js';
import { authenticate, optionalAuth, adminOnly } from '../middleware/auth.js';
import { pollCreationLimiter, voteLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Poll CRUD
router.post('/', optionalAuth, pollCreationLimiter, pollController.create);
router.get('/:id', pollController.getById);
router.get('/share/:shareUrl', pollController.getByShareUrl);
router.get('/:id/results', pollController.getResults);
router.put('/:id', authenticate, pollController.update);
router.delete('/:id', authenticate, pollController.delete);
router.post('/:id/close', authenticate, pollController.close);

// Voting
router.post('/:id/vote', optionalAuth, voteLimiter, voteController.castVote);

// Admin only - vote management
router.get('/:id/votes', authenticate, adminOnly, voteController.getVotes);
router.delete('/:pollId/votes/:voteId', authenticate, adminOnly, voteController.deleteVote);

export default router;
