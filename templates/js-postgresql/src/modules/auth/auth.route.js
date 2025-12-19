const express = require('express');
const authController = require('./auth.controller');
const { validate, authenticate } = require('./auth.middleware');
const { registerSchema, loginSchema, refreshTokenSchema } = require('./auth.schema');

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);

// Protected route example
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
