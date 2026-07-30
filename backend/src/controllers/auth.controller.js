import * as User from '../models/user.model.js';
import * as RefreshToken from '../models/refreshToken.model.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../config/token.js';

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/auth',
  maxAge: SEVEN_DAYS,
}

function refreshExpiryDate() {
  return new Date(Date.now() + SEVEN_DAYS);
}

export async function register(req, res, next) {
  try {
    const { email, password, role } = req.body;
    
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email already taken' });
    }
    
    const passwordHash = await hashPassword(password);
    const user = await User.create({ email, passwordHash, role });
    
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    await RefreshToken.create({ userId: user.id, token: refreshToken, expiresAt: refreshExpiryDate() });
    
    res
    .cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)
    .status(201)
    .json({ accessToken, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    await RefreshToken.create({ userId: user.id, token: refreshToken, expiresAt: refreshExpiryDate() });

    res
      .cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)
      .json({ accessToken });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: 'Missing refresh token' });
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const stored = await RefreshToken.findByToken(token);
    if (!stored) {
      return res.status(401).json({ message: 'Refresh token not recognized' });
    }

    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    await RefreshToken.remove(token);
    const newRefreshToken = signRefreshToken(user);
    await RefreshToken.create({ userId: user.id, token: newRefreshToken, expiresAt: refreshExpiryDate() });

    const accessToken = signAccessToken(user);

    res
      .cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS)
      .json({ accessToken });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await RefreshToken.remove(token);
    }
    res.clearCookie('refreshCookie', { path: '/api/auth', }).json({ message: 'Logged out sucessfully' });
  } catch (err) {
    next(err);
  }
}