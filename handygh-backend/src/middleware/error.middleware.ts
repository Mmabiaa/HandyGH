import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err); // Log the error for debugging

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation error',
      errors: err.errors,
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    status: 'error',
    message,
  });
};

export default errorHandler;