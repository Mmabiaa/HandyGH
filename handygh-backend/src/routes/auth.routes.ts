import { Router } from 'express';
import { register, login, requestOtp, verifyOtp, refreshTokens, logout } from '../controllers/auth.controller';
import { rateLimit } from '../middleware/rateLimit.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { otpRequestSchema, otpVerifySchema } from '../utils/validation';

const router = Router();

// User registration
router.post('/register', rateLimit(5, 60), register);

// User login
router.post('/login', rateLimit(10, 60), login);

// Request OTP for authentication
router.post('/otp/request', rateLimit(5, 60), validateRequest(otpRequestSchema), requestOtp);

// Verify OTP and authenticate user
router.post('/otp/verify', validateRequest(otpVerifySchema), verifyOtp);

// Refresh JWT tokens
router.post('/refresh', refreshTokens);

// Logout user and invalidate refresh token
router.post('/logout', logout);

export default router;