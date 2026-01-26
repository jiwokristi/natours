import type { NextFunction, Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';

import Tour from 'models/tourModel.js';

import * as factory from 'controllers/factoryController.js';

import AppError from 'utils/appError.js';
import catchAsync from 'utils/catchAsync.js';

import {
  buildTourImagePaths,
  cleanupAsync,
  ImageJob,
  processImages,
  TourImageFiles,
  TourWithImages,
} from 'services/fileService.js';

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

export const uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

export const resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files) return next();

  // Get old tour data for cleanup (single query here, not in update)
  const oldTour = await Tour.findById(req.params.id)
    .select('imageCover images')
    .lean();
  req.oldTourFiles = buildTourImagePaths(oldTour as TourWithImages);

  const timestamp = Date.now();
  const imageJobs: ImageJob[] = [];

  // Process cover image
  if ((req.files as TourImageFiles).imageCover) {
    req.body.imageCover = `tour-${req.params.id}-${timestamp}-cover.jpeg`;

    imageJobs.push({
      buffer: (req.files as TourImageFiles).imageCover?.[0]?.buffer as Buffer,
      outputPath: `public/img/tours/${req.body.imageCover}`,
      options: { width: 2000, height: 1333, quality: 90 },
    });
  }

  // Process tour images
  if ((req.files as TourImageFiles).images) {
    req.body.images = [];

    (req.files as TourImageFiles).images?.forEach((file, i) => {
      const filename = `tour-${req.params.id}-${timestamp}-${i + 1}.jpeg`;
      req.body.images.push(filename);

      imageJobs.push({
        buffer: file.buffer,
        outputPath: `public/img/tours/${filename}`,
        options: { width: 2000, height: 1333, quality: 90 },
      });
    });
  }

  // Process all images concurrently
  await processImages(imageJobs);

  next();
});

export const aliasTopTours = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

export const getAllTours = factory.getAll(Tour);
export const getTour = factory.getOne(Tour);
export const createTour = factory.createOne(Tour);
export const deleteTour = factory.deleteOne(Tour);

export const updateTour = catchAsync(async (req, res, next) => {
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

  if (req.oldTourFiles) {
    cleanupAsync(req.oldTourFiles);
  }

  res.status(200).json({
    message: 'success',
    data: {
      tour: updatedTour,
    },
  });
});

export const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

export const getMonthlyPlan = catchAsync(
  async (req: Request<{ year: string }>, res, next) => {
    const year = +req.params.year; // 2025

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { numTourStarts: -1 },
      },
      {
        $limit: 12,
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  },
);

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi
export const getToursWithin = catchAsync(
  async (
    req: Request<{ latlng: string; unit: string; distance: string }>,
    res,
    next,
  ) => {
    const { distance, latlng, unit } = req.params;

    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? +distance / 3963.2 : +distance / 6378.1;

    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitude and longitude in the format lat,lng.',
          400,
        ),
      );
    }

    const tours = await Tour.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours,
      },
    });
  },
);

export const getDistances = catchAsync(
  async (req: Request<{ latlng: string; unit: string }>, res, next) => {
    const { latlng, unit } = req.params;

    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng) {
      return next(
        new AppError(
          'Please provide latitude and longitude in the format lat,lng.',
          400,
        ),
      );
    }

    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [+lng, +lat],
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier,
        },
      },
      {
        $project: {
          distance: 1,
          name: 1,
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        data: distances,
      },
    });
  },
);
