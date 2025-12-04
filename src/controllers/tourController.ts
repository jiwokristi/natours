import type { NextFunction, Request, Response } from 'express';

import Tour from 'models/tourModel.js';
import AppError from 'utils/appError.js';

import catchAsync from 'utils/catchAsync.js';

export const getAllTours = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tours = await Tour.find();

    res.status(200).json({
      message: 'success',
      data: {
        tours,
      },
    });
  },
);

export const getTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tour = await Tour.findById(req.params.tourId);

    if (!tour) {
      return next(new AppError('No tour found with that ID!', 404));
    }

    res.status(200).json({
      message: 'success',
      data: {
        tour,
      },
    });
  },
);

export const createTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newTour = await Tour.create(req.body);
    res.status(200).json({
      message: 'success',
      data: {
        tour: newTour,
      },
    });
  },
);

export const updateTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.tourId);

    if (!updatedTour) {
      return next(new AppError('No tour found with that ID!', 404));
    }

    res.status(200).json({
      message: 'success',
      data: {
        tour: updatedTour,
      },
    });
  },
);

export const deleteTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const deletedTour = await Tour.findByIdAndDelete(req.params.tourId);

    if (!deletedTour) {
      return next(new AppError('No tour found with that ID!', 404));
    }

    res.status(204).json({
      message: 'success',
      data: null,
    });
  },
);
