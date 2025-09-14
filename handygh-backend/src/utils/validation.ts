import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(15),
  password: z.string().min(8),
});

export const providerSchema = z.object({
  businessName: z.string().optional(),
  categories: z.array(z.string()).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
});

export const bookingSchema = z.object({
  providerId: z.string(),
  providerServiceId: z.string(),
  scheduledStart: z.date(),
  scheduledEnd: z.date().optional(),
  address: z.string(),
});

export const reviewSchema = z.object({
  bookingId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export const messageSchema = z.object({
  bookingId: z.string(),
  content: z.string().min(1),
  attachments: z.array(z.string()).optional(),
});

export const disputeSchema = z.object({
  bookingId: z.string(),
  reason: z.string(),
  description: z.string(),
  evidence: z.array(z.string()).optional(),
});

export const otpRequestSchema = z.object({
  phone: z.string().min(10).max(15),
});

export const otpVerifySchema = z.object({
  phone: z.string().min(10).max(15),
  otp: z.string().min(4).max(6),
});