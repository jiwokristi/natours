import type { NextFunction, Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';

import User, { UserData } from 'models/userModel.js';

import * as factory from 'controllers/factoryController.js';

import AppError from 'utils/appError.js';
import catchAsync from 'utils/catchAsync.js';
import { filterObj } from 'utils/helpers/filter.js';

import { processImage } from 'services/fileService.js';
import { deactivateUser, updateUserWithCleanup } from 'services/userService.js';

const multerStorage = multer.memoryStorage();

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export const uploadUserPhoto = upload.single('photo');

export const resizeUserPhoto = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    // Process user photo with optimized pipeline
    await processImage(
      req.file.buffer,
      `public/img/users/${req.file.filename}`,
      { width: 500, height: 500, quality: 90 },
    );

    next();
  },
);

export const getMe = (req: Request, res: Response, next: NextFunction) => {
  req.params.id = req.user.id;
  next();
};

export const updateMe = catchAsync(
  async (req: Request<{}, {}, UserData>, res: Response, next: NextFunction) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password updates. Please use /updateMyPassword.',
          400,
        ),
      );
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody: Partial<UserData> = filterObj(
      req.body,
      'name',
      'email',
    );
    if (req.file) filteredBody.photo = req.file.filename;

    // 3) Update user document with file cleanup
    const updatedUser = await updateUserWithCleanup(req.user.id, filteredBody);

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  },
);

export const deleteMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await deactivateUser(req.user.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  },
);

export const getAllUsers = factory.getAll(User);
export const getUser = factory.getOne(User);

// Do NOT update passwords with this!
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);
