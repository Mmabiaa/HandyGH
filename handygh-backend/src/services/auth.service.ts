import { User } from '../models/user.model';
import { RefreshToken } from '../models/refreshToken.model';
import { sendOTPNotification } from '../utils/notification';
import { generateOTP, validateOTP } from '../utils/otp';
import { createAccessToken, createRefreshToken } from '../utils/jwt';
import { prisma } from '../models/prismaClient';
import { RedisClient } from '../config/redis.config';

class AuthService {
  async requestOTP(phone: string): Promise<void> {
    const otp = generateOTP();
    await RedisClient.setex(`otp:${phone}`, 300, otp); // Store OTP in Redis with 5 min TTL
    await sendSMS(phone, `Your OTP is: ${otp}`);
  }

  async verifyOTP(phone: string, otp: string): Promise<User> {
    const storedOTP = await RedisClient.get(`otp:${phone}`);
    if (!storedOTP || storedOTP !== otp) {
      throw new Error('Invalid or expired OTP');
    }

    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: { phone },
      });
    }

    const accessToken = createAccessToken(user.id);
    const refreshToken = createRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return { ...user, accessToken, refreshToken };
  }

  async refreshTokens(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = await prisma.refreshToken.findUnique({ where: { token } });
    if (!refreshToken) {
      throw new Error('Invalid refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: refreshToken.userId } });
    const newAccessToken = createAccessToken(user.id);
    const newRefreshToken = createRefreshToken(user.id);

    await prisma.refreshToken.update({
      where: { id: refreshToken.id },
      data: { token: newRefreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { token } });
    await RedisClient.set(`blacklist:${token}`, 'true', 'EX', 900); // Blacklist access token for 15 min
  }
}

export const authService = new AuthService();