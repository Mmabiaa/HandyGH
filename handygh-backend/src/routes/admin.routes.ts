import { Router } from 'express';
import { 
  getDashboardStats,
  getUsers,
  suspendUser,
  getTransactions,
  adjustTransaction,
  updateCommissionConfig,
  exportReports
} from '../controllers/admin.controller';
import { authenticateJWT, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// All admin routes require admin role
router.use(authenticateJWT, requireAdmin);

// Dashboard statistics - FR-20
router.get('/dashboard', getDashboardStats);

// User management - FR-20
router.get('/users', getUsers);
router.patch('/users/:userId/suspend', suspendUser);

// Transaction management - FR-20, FR-21
router.get('/transactions', getTransactions);
router.post('/transactions/:transactionId/adjust', adjustTransaction);

// Commission configuration - FR-20
router.patch('/commission', updateCommissionConfig);

// Reports export - FR-26
router.get('/reports/export', exportReports);

export default router;