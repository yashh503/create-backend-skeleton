import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../../config';
import ApiError from '../../utils/ApiError';

interface User {
  id: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

interface SafeUser {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface TokenPayload {
  userId: string;
}

interface AuthResult {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

interface TokenResult {
  accessToken: string;
  refreshToken: string;
}

// In-memory storage
const users = new Map<string, User>();
const refreshTokens = new Map<string, string>();

let userIdCounter = 1;

const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });
};

const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

const excludePassword = (user: User): SafeUser => {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const register = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  // Check if user already exists
  for (const user of users.values()) {
    if (user.email === email) {
      throw ApiError.conflict('Email already registered');
    }
  }

  const hashedPassword = await hashPassword(password);

  const userId = String(userIdCounter++);
  const user: User = {
    id: userId,
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.set(userId, user);

  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  refreshTokens.set(userId, refreshToken);

  return {
    user: excludePassword(user),
    accessToken,
    refreshToken,
  };
};

export const login = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  let foundUser: User | null = null;
  for (const user of users.values()) {
    if (user.email === email) {
      foundUser = user;
      break;
    }
  }

  if (!foundUser) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isPasswordValid = await comparePassword(password, foundUser.password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const accessToken = generateAccessToken(foundUser.id);
  const refreshToken = generateRefreshToken(foundUser.id);

  refreshTokens.set(foundUser.id, refreshToken);

  return {
    user: excludePassword(foundUser),
    accessToken,
    refreshToken,
  };
};

export const refreshToken = async (token: string): Promise<TokenResult> => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;

    const storedToken = refreshTokens.get(decoded.userId);
    if (!storedToken || storedToken !== token) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const user = users.get(decoded.userId);
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    const accessToken = generateAccessToken(decoded.userId);
    const newRefreshToken = generateRefreshToken(decoded.userId);

    refreshTokens.set(decoded.userId, newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.unauthorized('Invalid refresh token');
  }
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
  } catch (error) {
    throw ApiError.unauthorized('Invalid or expired access token');
  }
};

export const getUserById = (id: string): SafeUser | null => {
  const user = users.get(id);
  return user ? excludePassword(user) : null;
};
