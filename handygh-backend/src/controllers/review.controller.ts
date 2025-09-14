import { Request, Response } from 'express';
import { ReviewService } from '../services/review.service';
import { ZodError } from 'zod';
import { createReviewSchema } from '../utils/validation';

const reviewService = new ReviewService();

// Create a review for a provider
export const createReview = async (req: Request, res: Response) => {
  try {
    const validatedData = createReviewSchema.parse(req.body);
    const review = await reviewService.createReview(validatedData, req.user.id);
    res.status(201).json(review);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: error.errors });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get reviews for a provider
export const getProviderReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await reviewService.getProviderReviews(req.params.id);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};