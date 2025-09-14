import { Router } from 'express';
import { 
  createUserProfile, 
  getUserProfile, 
  updateUserProfile, 
  deleteUserProfile 
} from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { createUserSchema, updateUserSchema } from '../utils/validation';

const router = Router();

// Create user profile
router.post('/', 
  authMiddleware, 
  validationMiddleware(createUserSchema), 
  createUserProfile
);

// Get user profile
router.get('/:id', 
  authMiddleware, 
  getUserProfile
);

// Update user profile
router.put('/:id', 
  authMiddleware, 
  validationMiddleware(updateUserSchema), 
  updateUserProfile
);

// Delete user profile
router.delete('/:id', 
  authMiddleware, 
  deleteUserProfile
);

export default router;