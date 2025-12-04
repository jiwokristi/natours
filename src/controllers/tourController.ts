import type { NextFunction, Request, Response } from 'express';

import Tour from 'models/tourModel.js';

import catchAsync from 'utils/catchAsync.js';

export const getAllTours = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

export const getTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
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
  async (req: Request, res: Response, next: NextFunction) => {},
);

export const deleteTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);
