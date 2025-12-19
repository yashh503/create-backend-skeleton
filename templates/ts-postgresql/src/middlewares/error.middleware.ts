import { Request, Response, NextFunction } from 'express';
import config from '../config';
import logger from '../utils/logger';
import ApiError from '../utils/ApiError';

interface ErrorResponse {
  error: {
    message: string;
    stack?: string;
  };
}

const errorMiddleware = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = err as ApiError;

  if (!(err instanceof ApiError)) {
    const statusCode = (err as any).statusCode || 500;
    const message = err.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false);
  }

  const response: ErrorResponse = {
    error: {
      message: error.message,
      ...(config.env === 'development' && { stack: error.stack }),
    },
  };

  if (error.statusCode >= 500) {
    logger.error(error);
  } else {
    logger.warn(error.message);
  }

  res.status(error.statusCode).json(response);
};

export default errorMiddleware;
