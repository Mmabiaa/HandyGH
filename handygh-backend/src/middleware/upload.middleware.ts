import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { z } from 'zod';

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const isValid = allowedTypes.test(file.mimetype);
    const isExtValid = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());

    if (isValid && isExtValid) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
  },
});

export const uploadSingle = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  };
};

export const validateFileUpload = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.file);
    if (!result.success) {
      return res.status(400).json({ message: 'File validation failed', errors: result.error.errors });
    }
    next();
  };
};