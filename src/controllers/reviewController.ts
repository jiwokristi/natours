import { Request, Response, NextFunction } from 'express';

import Review from 'models/reviewModel.js';

import * as factory from './factoryController.js';

export const setTourUserIds = (
  req: Request<{ tourId: string }>,
  res: Response,
  next: NextFunction,
) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

export const getAllReviews = factory.getAll(Review);
export const getReview = factory.getOne(Review);
export const createReview = factory.createOne(Review);
export const updateReview = factory.updateOne(Review);
export const deleteReview = factory.deleteOne(Review);
