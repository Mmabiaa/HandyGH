import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validateSchema = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
  };
};

// Example schemas for different routes can be defined here
export const createUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(15),
  password: z.string().min(6),
});

export const createProviderSchema = z.object({
  businessName: z.string().optional(),
  categories: z.array(z.string()).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
});

// Additional schemas can be added as needed for other routes and validations.