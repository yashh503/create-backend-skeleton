import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';

const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
};

export default notFoundMiddleware;
