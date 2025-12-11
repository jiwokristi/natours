import type { NextFunction, Request, Response } from 'express';

import User from 'models/userModel.js';

import AppError from 'utils/appError.js';
import catchAsync from 'utils/catchAsync.js';

export const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find();

    res.status(200).json({
      message: 'success',
      data: {
        users,
      },
    });
  },
);

export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.userId);

    res.status(200).json({
      message: 'success',
      data: {
        user,
      },
    });
  },
);

// Do NOT update passwords with this!
export const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
      message: 'success',
      data: {
        user: updatedUser,
      },
    });
  },
);

export const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const deletedUser = await User.findByIdAndDelete(req.params.userId);

    if (!deletedUser) {
      next(new AppError('No user found with that ID', 404));
    }

    res.status(204).json({
      message: 'success',
      data: null,
    });
  },
);
