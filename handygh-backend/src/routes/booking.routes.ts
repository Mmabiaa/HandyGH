import { Router } from 'express';
import {
  createBooking,
  getUserBookings,
  getBookingDetails,
  acceptBooking,
  updateBookingStatus,
  cancelBooking,
} from '../controllers/booking.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { createBookingSchema, updateBookingStatusSchema } from '../utils/validation';

const router = Router();

// Create a new booking
router.post('/', authMiddleware, validationMiddleware(createBookingSchema), createBooking);

// Get all bookings for a user (customer or provider)
router.get('/', authMiddleware, getUserBookings);

// Get details of a specific booking
router.get('/:id', authMiddleware, getBookingDetails);

// Provider accepts a booking
router.patch('/:id/accept', authMiddleware, acceptBooking);

// Update booking status
router.patch('/:id/status', authMiddleware, validationMiddleware(updateBookingStatusSchema), updateBookingStatus);

// Cancel a booking
router.post('/:id/cancel', authMiddleware, cancelBooking);

export default router;