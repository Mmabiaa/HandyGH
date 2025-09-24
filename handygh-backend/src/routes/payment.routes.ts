import { Router } from 'express';
import { 
  initiateMomoPayment, 
  confirmManualPayment,
  updatePaymentStatus,
  getPaymentHistory
} from '../controllers/payment.controller';
import { authenticateJWT, requireCustomer } from '../middleware/auth.middleware';
import { rateLimitMiddleware } from '../middleware/rateLimit.middleware';

const router = Router();

// Initiate MTN MoMo payment - FR-11
router.post('/momo/charge', authenticateJWT, requireCustomer, rateLimitMiddleware, initiateMomoPayment);

// Manual payment confirmation - FR-14
router.post('/manual/confirm', authenticateJWT, requireCustomer, confirmManualPayment);

// Update payment status (webhook or admin)
router.patch('/status', updatePaymentStatus);

// Get payment history for authenticated user
router.get('/history', authenticateJWT, getPaymentHistory);

export default router;