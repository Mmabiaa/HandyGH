import { Router } from 'express';
import { 
  createReview, 
  getProviderReviews 
} from '../controllers/review.controller';
import { validateReview } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Route to create a review for a completed booking
router.post('/:id/reviews', authenticate, validateReview, createReview);

// Route to get reviews for a specific provider
router.get('/:id/reviews', getProviderReviews);

export default router;