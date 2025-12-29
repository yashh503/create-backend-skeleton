import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../../config/index.js';
import ApiError from '../../utils/ApiError.js';

// In-memory storage
const users = new Map();
const refreshTokens = new Map();

let userIdCounter = 1;

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
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const register = async (email, password) => {
  // Check if user already exists
  for (const user of users.values()) {
    if (user.email === email) {
      throw ApiError.conflict('Email already registered');
    }
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create new user
  const userId = String(userIdCounter++);
  const user = {
    id: userId,
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.set(userId, user);

  // Generate tokens
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  // Store refresh token
  refreshTokens.set(userId, refreshToken);

  return {
    user: excludePassword(user),
    accessToken,
    refreshToken,
  };
};

export const login = async (email, password) => {
  // Find user by email
  let foundUser = null;
  for (const user of users.values()) {
    if (user.email === email) {
      foundUser = user;
      break;
    }
  }

  if (!foundUser) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Check password
  const isPasswordValid = await comparePassword(password, foundUser.password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Generate tokens
  const accessToken = generateAccessToken(foundUser.id);
  const refreshToken = generateRefreshToken(foundUser.id);

  // Store refresh token
  refreshTokens.set(foundUser.id, refreshToken);

  return {
    user: excludePassword(foundUser),
    accessToken,
    refreshToken,
  };
};

export const refreshToken = async (token) => {
  try {
    // Verify refresh token
    const decoded = jwt.verify(token, config.jwt.refreshSecret);

    // Check if refresh token matches stored one
    const storedToken = refreshTokens.get(decoded.userId);
    if (!storedToken || storedToken !== token) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    // Check if user still exists
    const user = users.get(decoded.userId);
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    // Generate new tokens
    const accessToken = generateAccessToken(decoded.userId);
    const newRefreshToken = generateRefreshToken(decoded.userId);

    // Update stored refresh token
    refreshTokens.set(decoded.userId, newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.unauthorized('Invalid refresh token');
  }
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.accessSecret);
  } catch (error) {
    throw ApiError.unauthorized('Invalid or expired access token');
  }
};

export const getUserById = (id) => {
  const user = users.get(id);
  return user ? excludePassword(user) : null;
};
