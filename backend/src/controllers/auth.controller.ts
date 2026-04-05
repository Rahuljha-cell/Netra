import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const generateToken = (userId: string, role: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '30d';
  return jwt.sign({ userId, role }, secret, { expiresIn } as jwt.SignOptions);
};

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone } = req.body;

    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ phone });
    }

    const otp = generateOTP();
    user.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    };

    await user.save();

    // In production, send OTP via SMS (Twilio, etc.)
    // For dev, log it
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[OTP] Phone: ${phone}, Code: ${otp}`);
    }

    res.json({ message: 'OTP sent successfully', ...(process.env.NODE_ENV !== 'production' && { otp }) });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone, otp } = req.body;

    const user = await User.findOne({ phone });
    if (!user || !user.otp) {
      throw new AppError('Invalid phone or OTP not requested', 400);
    }

    if (user.otp.code !== otp) {
      throw new AppError('Invalid OTP', 400);
    }

    if (user.otp.expiresAt < new Date()) {
      throw new AppError('OTP expired', 400);
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    await user.save();

    const token = generateToken(user._id.toString(), user.role);

    res.json({
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    res.json({
      id: req.user._id,
      phone: req.user.phone,
      email: req.user.email,
      name: req.user.name,
      avatar: req.user.avatar,
      role: req.user.role,
      reputation: req.user.reputation,
      reportsCount: req.user.reportsCount,
      preferredLanguage: req.user.preferredLanguage,
      alertSettings: req.user.alertSettings,
      location: req.user.location,
    });
  } catch (error) {
    next(error);
  }
};
