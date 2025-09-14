import { Router } from 'express';
import { 
  createProviderProfile, 
  getProviders, 
  getProviderDetails, 
  updateProviderProfile, 
  addProviderService, 
  updateProviderService 
} from '../controllers/provider.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { createProviderSchema, updateProviderSchema, createServiceSchema, updateServiceSchema } from '../utils/validation';

const router = Router();

// Create provider profile
router.post('/', authMiddleware, validationMiddleware(createProviderSchema), createProviderProfile);

// Get providers with filters
router.get('/', getProviders);

// Get provider details
router.get('/:id', getProviderDetails);

// Update provider profile
router.put('/:id', authMiddleware, validationMiddleware(updateProviderSchema), updateProviderProfile);

// Add service to provider
router.post('/:id/services', authMiddleware, validationMiddleware(createServiceSchema), addProviderService);

// Update provider service
router.put('/:id/services/:serviceId', authMiddleware, validationMiddleware(updateServiceSchema), updateProviderService);

export default router;