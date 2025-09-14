import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { z } from 'zod';

const paymentService = new PaymentService();

// Schema for initiating a payment
const initiatePaymentSchema = z.object({
  bookingId: z.string().nonempty(),
  amount: z.number().positive(),
});

// Schema for confirming a payment
const confirmPaymentSchema = z.object({
  transactionId: z.string().nonempty(),
  status: z.enum(['SUCCESS', 'FAILED']),
});

// Initiate payment
export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const validatedData = initiatePaymentSchema.parse(req.body);
    const paymentResponse = await paymentService.initiatePayment(validatedData.bookingId, validatedData.amount);
    res.status(200).json(paymentResponse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Confirm payment
export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const validatedData = confirmPaymentSchema.parse(req.body);
    const confirmationResponse = await paymentService.confirmPayment(validatedData.transactionId, validatedData.status);
    res.status(200).json(confirmationResponse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};