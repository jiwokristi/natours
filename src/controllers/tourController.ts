import type { NextFunction, Request, Response } from 'express';

import Tour from 'models/tourModel.js';

import * as factory from 'controllers/factoryController.js';

import AppError from 'utils/appError.js';
import catchAsync from 'utils/catchAsync.js';

export const getAllTours = factory.getAll(Tour);
export const getTour = factory.getOne(Tour);
export const createTour = factory.createOne(Tour);
export const deleteTour = factory.deleteOne(Tour);

export const updateTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    const updatedTour = await Tour.findByIdAndUpdate(
      req.params.tourId,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

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
