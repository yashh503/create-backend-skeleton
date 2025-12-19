import { Router, Request, Response } from 'express';
import * as authController from './auth.controller';
import { validate, authenticate } from './auth.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.schema';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post(
  '/refresh-token',
  validate(refreshTokenSchema),
  authController.refreshToken
);

router.get('/me', authenticate, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

export default router;
