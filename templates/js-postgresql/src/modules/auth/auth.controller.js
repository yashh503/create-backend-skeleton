const authService = require('./auth.service');
const asyncHandler = require('../../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.register(email, password);

  res.status(201).json({
    message: 'User registered successfully',
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  res.json({
    message: 'Login successful',
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  const result = await authService.refreshToken(token);

  res.json({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

module.exports = {
  register,
  login,
  refreshToken,
};
