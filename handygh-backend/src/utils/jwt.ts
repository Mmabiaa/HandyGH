import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import envConfig from '../config/env.config';

const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

const JWT_SECRET = envConfig.JWT_SECRET;
const JWT_EXPIRATION = envConfig.JWT_EXPIRATION || '15m';

export const generateToken = async (payload: object): Promise<string> => {
  return await signAsync(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

export const verifyToken = async (token: string): Promise<object | null> => {
  try {
    return await verifyAsync(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};