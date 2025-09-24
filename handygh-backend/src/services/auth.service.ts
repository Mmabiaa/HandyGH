import { sendOTPNotification } from '../utils/notification';
import { generateOTP, validateOTP } from '../utils/otp';
import { createAccessToken, createRefreshToken } from '../utils/jwt';
import { prisma } from '../models/prismaClient';
import { RedisClient } from '../config/redis.config';

class AuthService {
  async requestOTP(phone: string): Promise<void> {
    const otp = await generateOTP(phone);
    await sendOTPNotification(phone, otp);
  }

  async verifyOTP(phone: string, otp: string): Promise<any> {
    const isValid = await validateOTP(phone, otp);
    if (!isValid) {
      throw new Error('Invalid or expired OTP');
    }

    let user = await prisma.user.findUnique({ 
      where: { phone },
      include: { provider: true }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: { 
          phone,
          role: 'CUSTOMER', // Default role, can be updated during profile completion
          is_active: true
        },
        include: { provider: true }
      });
    }

    const accessToken = createAccessToken(user.id);
    const refreshToken = createRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token: refreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Remove password from response
    const { password_hash: _, ...userWithoutPassword } = user;

    return { 
      user: userWithoutPassword, 
      accessToken, 
      refreshToken 
    };
  }

  async refreshTokens(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = await prisma.refreshToken.findUnique({ where: { token } });
    if (!refreshToken) {
      throw new Error('Invalid refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: refreshToken.user_id } });
    const newAccessToken = createAccessToken(user.id);
    const newRefreshToken = createRefreshToken(user.id);

    await prisma.refreshToken.update({
      where: { id: refreshToken.id },
      data: { token: newRefreshToken, expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { token } });
    await RedisClient.set(`blacklist:${token}`, 'true', 'EX', 900); // Blacklist access token for 15 min
  }
}

export const authService = new AuthService();