import { Document, InferSchemaType, model, Query, Schema } from 'mongoose';

import Tour from './tourModel.js';

const reviewSchema = new Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre<Query<ReviewData, IReview>>(/^find/, function () {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // @ts-ignore
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre<Query<ReviewData, IReview>>(/^findOneAnd/, async function () {
  // @ts-ignore
  this.r = await this.findOne();
  // console.log(this.r);
});

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here, query has already executed
  // @ts-ignore
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

export type ReviewData = InferSchemaType<typeof reviewSchema>;
export interface IReview extends Document, ReviewData {
  calcAverageRatings(tourId: string): Promise<void>;
}

const Review = model<IReview>('Review', reviewSchema);

export default Review;
