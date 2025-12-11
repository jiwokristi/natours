import type { Request, Response, NextFunction } from 'express';

import User, { UserData } from 'models/userModel.js';

import { createSendToken } from 'services/authServices.js';

import catchAsync from 'utils/catchAsync.js';

export const signup = catchAsync(
  async (req: Request<{}, {}, UserData>, res: Response, next: NextFunction) => {
    const newUser = await User.create(req.body);

    createSendToken(newUser, 201, res);
  },
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

export const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
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
