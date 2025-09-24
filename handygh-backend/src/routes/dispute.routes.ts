import { Router } from 'express';
import { 
  createDispute,
  getDisputes,
  getDisputeDetails,
  resolveDispute,
  closeDispute
} from '../controllers/dispute.controller';
import { authenticateJWT, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Create dispute (customers and providers)
router.post('/', authenticateJWT, createDispute);

// Get disputes (admin only)
router.get('/', authenticateJWT, requireAdmin, getDisputes);

// Get dispute details (admin only)
router.get('/:disputeId', authenticateJWT, requireAdmin, getDisputeDetails);

// Resolve dispute (admin only)
router.patch('/:disputeId/resolve', authenticateJWT, requireAdmin, resolveDispute);

// Close dispute (admin only)
router.patch('/:disputeId/close', authenticateJWT, requireAdmin, closeDispute);

export default router;
