import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import config from '../../config';
import { prisma } from '../../loaders/db.loader';
import ApiError from '../../utils/ApiError';

interface TokenPayload {
  userId: string;
}

interface SafeUser {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
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
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw ApiError.conflict('Email already registered');
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

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

export const login = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

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

export const refreshToken = async (token: string): Promise<TokenResult> => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user || user.refreshToken !== token) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const accessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

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

export const getUserById = async (id: string): Promise<SafeUser | null> => {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? excludePassword(user) : null;
};
