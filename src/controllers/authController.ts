import type { Request, Response, NextFunction } from 'express';

import User, { UserData } from 'models/userModel.js';

import { createSendToken } from 'services/authServices.js';

import AppError from 'utils/appError.js';
import catchAsync from 'utils/catchAsync.js';

export const signup = catchAsync(
  async (req: Request<{}, {}, UserData>, res: Response, next: NextFunction) => {
    const newUser = await User.create(req.body);

    createSendToken(newUser, 201, res);
  },
);

export const login = catchAsync(
  async (
    req: Request<{}, {}, Pick<UserData, 'email' | 'password'>>,
    res: Response,
    next: NextFunction,
  ) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password!', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password!', 401));
    }

    createSendToken(user, 200, res);
  },
);

export const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie('jwt');
    res.status(200).json({ status: 'success' });
  },
);

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

export const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

export const restrictTo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);
