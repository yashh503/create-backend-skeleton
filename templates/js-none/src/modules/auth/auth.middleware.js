const authService = require('./auth.service');
const ApiError = require('../../utils/ApiError');
const asyncHandler = require('../../utils/asyncHandler');

const authenticate = asyncHandler(async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('No token provided');
  }

  const token = authHeader.split(' ')[1];

  // Verify token
  const decoded = authService.verifyAccessToken(token);

  // Get user from storage
  const user = authService.getUserById(decoded.userId);
  if (!user) {
    throw ApiError.unauthorized('User not found');
  }

  // Attach user to request
  req.user = user;
  next();
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const message = error.details.map((detail) => detail.message).join(', ');
    throw ApiError.badRequest(message);
  }

  next();
};

module.exports = {
  authenticate,
  validate,
};
