import { randomBytes } from 'crypto';
import { Redis } from 'ioredis';

const redisClient = new Redis();

const OTP_LENGTH = 6;
const OTP_EXPIRY = 5 * 60; // 5 minutes in seconds

export const generateOTP = async (phone: string): Promise<string> => {
    const otp = randomBytes(OTP_LENGTH).toString('hex').slice(0, OTP_LENGTH);
    await redisClient.setex(`otp:${phone}`, OTP_EXPIRY, otp);
    return otp;
};

export const validateOTP = async (phone: string, otp: string): Promise<boolean> => {
    const storedOtp = await redisClient.get(`otp:${phone}`);
    if (storedOtp === otp) {
        await redisClient.del(`otp:${phone}`);
        return true;
    }
    return false;
};