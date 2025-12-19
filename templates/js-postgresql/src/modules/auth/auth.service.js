const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../../config');
const { prisma } = require('../../loaders/db.loader');
const ApiError = require('../../utils/ApiError');

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

const excludePassword = (user) => {
  const { password, refreshToken, ...userWithoutSensitive } = user;
  return userWithoutSensitive;
};

const register = async (email, password) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw ApiError.conflict('Email already registered');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Generate tokens
  const accessToken = generateAccessToken(email);
  const refreshToken = generateRefreshToken(email);

  // Create new user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      refreshToken,
    },
  });

  // Update access token with actual user id
  const newAccessToken = generateAccessToken(user.id);
  const newRefreshToken = generateRefreshToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: newRefreshToken },
  });

  return {
    user: excludePassword(user),
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

const login = async (email, password) => {
  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Check password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Update refresh token in database
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return {
    user: excludePassword(user),
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token) => {
  try {
    // Verify refresh token
    const decoded = jwt.verify(token, config.jwt.refreshSecret);

    // Find user and check if refresh token matches
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user || user.refreshToken !== token) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    // Generate new tokens
    const accessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    // Update refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.unauthorized('Invalid refresh token');
  }
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.accessSecret);
  } catch (error) {
    throw ApiError.unauthorized('Invalid or expired access token');
  }
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? excludePassword(user) : null;
};

module.exports = {
  register,
  login,
  refreshToken,
  verifyAccessToken,
  getUserById,
};
