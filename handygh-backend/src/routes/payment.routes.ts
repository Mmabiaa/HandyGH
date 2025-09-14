import { Router } from 'express';
import { 
  initiateMoMoPayment, 
  handleMoMoWebhook, 
  confirmManualPayment 
} from '../controllers/payment.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimitMiddleware } from '../middleware/rateLimit.middleware';

const router = Router();

// Initiate MoMo payment
router.post('/momo/charge', authMiddleware, rateLimitMiddleware, initiateMoMoPayment);

// Handle MoMo webhook
router.post('/webhook/momo', handleMoMoWebhook);

// Manual payment confirmation
router.post('/manual/confirm', authMiddleware, confirmManualPayment);

export default router;