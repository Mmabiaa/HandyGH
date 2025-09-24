import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { z } from 'zod';

const paymentService = new PaymentService();

// Schema for MTN MoMo payment initiation
const momoPaymentSchema = z.object({
  bookingId: z.string().nonempty(),
  phoneNumber: z.string().nonempty(),
  amount: z.number().positive(),
  currency: z.string().default('GHS'),
});

// Schema for manual payment confirmation
const manualPaymentSchema = z.object({
  bookingId: z.string().nonempty(),
  transactionReference: z.string().nonempty(),
  amount: z.number().positive(),
  phoneNumber: z.string().nonempty(),
  paymentMethod: z.string().default('MTN_MOMO'),
});

// Schema for payment status update
const paymentStatusSchema = z.object({
  transactionId: z.string().nonempty(),
  status: z.enum(['SUCCESS', 'FAILED', 'PENDING']),
  providerResponse: z.any().optional(),
});

// Initiate MTN MoMo payment - FR-11
export const initiateMomoPayment = async (req: Request, res: Response) => {
  try {
    const validatedData = momoPaymentSchema.parse(req.body);
    const paymentResponse = await paymentService.initiateMomoPayment({
      ...validatedData,
      customerId: req.user.id
    });
    
    res.status(200).json({
      success: true,
      data: paymentResponse,
      errors: null,
      meta: null
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      data: null,
      errors: { message: error.message },
      meta: null
    });
  }
};

// Manual payment confirmation - FR-14
export const confirmManualPayment = async (req: Request, res: Response) => {
  try {
    const validatedData = manualPaymentSchema.parse(req.body);
    const confirmationResponse = await paymentService.confirmManualPayment({
      ...validatedData,
      customerId: req.user.id
    });
    
    res.status(200).json({
      success: true,
      data: confirmationResponse,
      errors: null,
      meta: null
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      data: null,
      errors: { message: error.message },
      meta: null
    });
  }
};

// Update payment status (webhook or manual)
export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const validatedData = paymentStatusSchema.parse(req.body);
    const updateResponse = await paymentService.updatePaymentStatus(
      validatedData.transactionId,
      validatedData.status,
      validatedData.providerResponse
    );
    
    res.status(200).json({
      success: true,
      data: updateResponse,
      errors: null,
      meta: null
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      data: null,
      errors: { message: error.message },
      meta: null
    });
  }
};

// Get payment history for a user
export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const history = await paymentService.getPaymentHistory(req.user.id, {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });
    
    res.status(200).json({
      success: true,
      data: history.payments,
      meta: {
        total: history.total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(history.total / parseInt(limit as string))
      },
      errors: null
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      data: null,
      errors: { message: 'Internal Server Error' },
      meta: null
    });
  }
};