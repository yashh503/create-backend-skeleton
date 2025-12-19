import express from 'express';
import expressLoader from './loaders/express.loader';

const app = express();

expressLoader(app);

export default app;
