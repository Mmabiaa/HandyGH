import { Router } from 'express';
import {
  createBooking,
  getBookings,
  getBookingDetails,
  acceptBooking,
  declineBooking,
  proposeNewTime,
  updateBookingStatus,
  cancelBooking,
} from '../controllers/booking.controller';
import { authenticateJWT, requireProvider, requireCustomer } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { createBookingSchema, updateBookingStatusSchema } from '../utils/validation';

const router = Router();

// Create a new booking (customers only)
router.post('/', authenticateJWT, requireCustomer, validationMiddleware(createBookingSchema), createBooking);

// Get all bookings for a user (customer or provider)
router.get('/', authenticateJWT, getBookings);

// Get details of a specific booking
router.get('/:id', authenticateJWT, getBookingDetails);

// Provider accepts a booking
router.patch('/:id/accept', authenticateJWT, requireProvider, acceptBooking);

// Provider declines a booking
router.patch('/:id/decline', authenticateJWT, requireProvider, declineBooking);

// Provider proposes new time
router.patch('/:id/propose-time', authenticateJWT, requireProvider, proposeNewTime);

// Update booking status (provider or admin)
router.patch('/:id/status', authenticateJWT, requireProvider, validationMiddleware(updateBookingStatusSchema), updateBookingStatus);

// Cancel a booking
router.post('/:id/cancel', authenticateJWT, cancelBooking);

export default router;