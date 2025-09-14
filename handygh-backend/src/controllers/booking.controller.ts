import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';
import { ZodError } from 'zod';
import { createBookingSchema, updateBookingSchema, cancelBookingSchema } from '../utils/validation';

const bookingService = new BookingService();

export const createBooking = async (req: Request, res: Response) => {
    try {
        const validatedData = createBookingSchema.parse(req.body);
        const booking = await bookingService.createBooking(validatedData);
        res.status(201).json(booking);
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const getBookings = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id; // Assuming user ID is stored in req.user
        const bookings = await bookingService.getUserBookings(userId);
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const getBookingDetails = async (req: Request, res: Response) => {
    try {
        const bookingId = req.params.id;
        const booking = await bookingService.getBookingDetails(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const acceptBooking = async (req: Request, res: Response) => {
    try {
        const bookingId = req.params.id;
        const updatedBooking = await bookingService.acceptBooking(bookingId);
        res.status(200).json(updatedBooking);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
    try {
        const bookingId = req.params.id;
        const validatedData = updateBookingSchema.parse(req.body);
        const updatedBooking = await bookingService.updateBookingStatus(bookingId, validatedData);
        res.status(200).json(updatedBooking);
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const cancelBooking = async (req: Request, res: Response) => {
    try {
        const bookingId = req.params.id;
        const validatedData = cancelBookingSchema.parse(req.body);
        await bookingService.cancelBooking(bookingId, validatedData.reason);
        res.status(204).send();
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
};