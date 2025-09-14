import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/prisma/schema.prisma';
import { getUserById } from '../services/user.service';
import { UnauthorizedError } from '../utils/errors';

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return next(new UnauthorizedError('Access token is missing'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    const user = await getUserById(decoded.id);

    if (!user || !user.isActive) {
      return next(new UnauthorizedError('User not found or inactive'));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new UnauthorizedError('Invalid access token'));
  }
};