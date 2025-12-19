import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import * as authService from './auth.service';
import ApiError from '../../utils/ApiError';
import asyncHandler from '../../utils/asyncHandler';

interface SafeUser {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}

export const authenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = authService.verifyAccessToken(token);

    const user = await authService.getUserById(decoded.userId);
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    req.user = user;
    next();
  }
);

export const validate =
  (schema: Joi.ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      throw ApiError.badRequest(message);
    }

    next();
  };
