import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getUserById } from '../services/user.service';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return next(new UnauthorizedError('Access token is missing'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    const user = await getUserById(decoded.id);

    if (!user || !user.is_active) {
      return next(new UnauthorizedError('User not found or inactive'));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new UnauthorizedError('Invalid access token'));
  }
};

// Role-based authorization middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
};

// Specific role middlewares for convenience
export const requireCustomer = requireRole(['CUSTOMER']);
export const requireProvider = requireRole(['PROVIDER']);
export const requireAdmin = requireRole(['ADMIN']);
export const requireProviderOrAdmin = requireRole(['PROVIDER', 'ADMIN']);
export const requireCustomerOrAdmin = requireRole(['CUSTOMER', 'ADMIN']);