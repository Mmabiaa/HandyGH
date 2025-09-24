import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import { ZodError } from 'zod';
import { otpRequestSchema, otpVerifySchema } from '../utils/validation';
import { prisma } from '../models/prismaClient';
import bcrypt from 'bcrypt';
import { createAccessToken, createRefreshToken } from '../utils/jwt';

export const register = async (req: Request, res: Response) => {
    try {
        const { userType, firstName, lastName, email, phone, password, businessName, serviceCategory, description } = req.body;
        
        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { phone: phone }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ 
                error: { message: 'User with this email or phone already exists' }
            });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                role: userType.toUpperCase(),
                name: `${firstName} ${lastName}`,
                email,
                phone,
                password_hash,
                is_active: true
            }
        });

        // Create provider profile if user is a provider
        if (userType === 'provider') {
            await prisma.provider.create({
                data: {
                    user_id: user.id,
                    business_name: businessName,
                    categories: serviceCategory ? [serviceCategory] : [],
                    address: '', // Will be updated later
                    verified: false
                }
            });
        }

        // Generate tokens
        const accessToken = createAccessToken(user.id);
        const refreshToken = createRefreshToken(user.id);

        // Store refresh token
        await prisma.refreshToken.create({
            data: {
                user_id: user.id,
                token: refreshToken,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });

        // Remove password from response
        const { password_hash: _, ...userWithoutPassword } = user;

        return res.status(201).json({
            user: userWithoutPassword,
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ 
            error: { message: 'Registration failed. Please try again.' }
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                provider: true
            }
        });

        if (!user) {
            return res.status(401).json({ 
                error: { message: 'Invalid email or password' }
            });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ 
                error: { message: 'Invalid email or password' }
            });
        }

        // Check if user is active
        if (!user.is_active) {
            return res.status(401).json({ 
                error: { message: 'Account is deactivated' }
            });
        }

        // Generate tokens
        const accessToken = createAccessToken(user.id);
        const refreshToken = createRefreshToken(user.id);

        // Store refresh token
        await prisma.refreshToken.create({
            data: {
                user_id: user.id,
                token: refreshToken,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });

        // Remove password from response
        const { password_hash: _, ...userWithoutPassword } = user;

        return res.status(200).json({
            user: userWithoutPassword,
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ 
            error: { message: 'Login failed. Please try again.' }
        });
    }
};

export const requestOtp = async (req: Request, res: Response) => {
    try {
        const { phone } = otpRequestSchema.parse(req.body);
        await authService.requestOTP(phone);
        return res.status(200).json({ 
            success: true,
            message: 'OTP sent successfully',
            data: null,
            errors: null
        });
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ 
                success: false,
                data: null,
                errors: error.errors,
                meta: null
            });
        }
        return res.status(500).json({ 
            success: false,
            data: null,
            errors: { message: 'Internal server error' },
            meta: null
        });
    }
};

export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { phone, otp } = otpVerifySchema.parse(req.body);
        const result = await authService.verifyOTP(phone, otp);
        return res.status(200).json({ 
            success: true,
            data: result,
            errors: null,
            meta: null
        });
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ 
                success: false,
                data: null,
                errors: error.errors,
                meta: null
            });
        }
        return res.status(500).json({ 
            success: false,
            data: null,
            errors: { message: 'Internal server error' },
            meta: null
        });
    }
};

export const refreshTokens = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        const { accessToken, refreshToken: newRefreshToken } = await authService.refreshTokens(refreshToken);
        return res.status(200).json({ accessToken, refreshToken: newRefreshToken });
    } catch (error) {
        return res.status(500).json({ error: { message: 'Internal server error' } });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        await authService.logout(refreshToken);
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: { message: 'Internal server error' } });
    }
};