import express, { Application } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import routes from '../routes';
import errorMiddleware from '../middlewares/error.middleware';
import notFoundMiddleware from '../middlewares/notFound.middleware';

const expressLoader = (app: Application): void => {
  app.set('trust proxy', 1);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  app.use('/api', routes);
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);
};

export default expressLoader;
