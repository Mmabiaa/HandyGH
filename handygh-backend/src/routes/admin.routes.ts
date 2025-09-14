import { Router } from 'express';
import { 
  getUsers, 
  verifyProvider, 
  getDisputes, 
  resolveDispute, 
  getTransactionReports 
} from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminRoleMiddleware } from '../middleware/adminRole.middleware';

const router = Router();

// Middleware to protect admin routes
router.use(authMiddleware);
router.use(adminRoleMiddleware);

// Get list of users with filters
router.get('/users', getUsers);

// Verify a provider
router.post('/users/:id/verify', verifyProvider);

// Get list of disputes
router.get('/disputes', getDisputes);

// Resolve a dispute
router.post('/disputes/:id/resolve', resolveDispute);

// Get transaction reports
router.get('/reports/transactions', getTransactionReports);

export default router;