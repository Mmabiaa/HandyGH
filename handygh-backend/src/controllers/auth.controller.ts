import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ZodError } from 'zod';
import { otpRequestSchema, otpVerifySchema } from '../utils/validation';

const authService = new AuthService();

export const requestOtp = async (req: Request, res: Response) => {
    try {
        const { phone } = otpRequestSchema.parse(req.body);
        await authService.sendOtp(phone);
        return res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { phone, otp } = otpVerifySchema.parse(req.body);
        const { user, accessToken, refreshToken } = await authService.verifyOtp(phone, otp);
        return res.status(200).json({ user, accessToken, refreshToken });
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const refreshTokens = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        const { accessToken, newRefreshToken } = await authService.refreshTokens(refreshToken);
        return res.status(200).json({ accessToken, refreshToken: newRefreshToken });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        await authService.logout(refreshToken);
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};