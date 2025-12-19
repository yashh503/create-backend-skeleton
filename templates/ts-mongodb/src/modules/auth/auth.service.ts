import jwt from 'jsonwebtoken';
import config from '../../config';
import User, { IUser } from './user.model';
import ApiError from '../../utils/ApiError';

interface TokenPayload {
  userId: string;
}

interface AuthResult {
  user: IUser;
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

export const register = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('Email already registered');
  }

  const user = await User.create({ email, password });

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  user.refreshToken = refreshToken;
  await user.save();

  return { user, accessToken, refreshToken };
};

export const login = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  const user = await User.findOne({ email });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  user.refreshToken = refreshToken;
  await user.save();

  return { user, accessToken, refreshToken };
};

export const refreshToken = async (token: string): Promise<TokenResult> => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;

    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== token) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const accessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = newRefreshToken;
    await user.save();

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
