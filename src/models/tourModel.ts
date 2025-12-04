import { Query, Schema, model, InferSchemaType, Model } from 'mongoose';
import slugify from 'slugify';

enum TourDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

enum GeoJSONType {
  POINT = 'Point',
}

// 4.666666, 46.6666, 47, 4.7
const oneDecimal = (val: number) => Math.round(val * 10) / 10;

const tourSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name!'],
      unique: true,
      trim: true,
      maxLength: [
        40,
        'A tour name must have less or equal than 40 characters!',
      ],
      minLength: [
        10,
        'A tour name must have more or equal than 10 characters!',
      ],
    },
    slug: String,
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description!'],
    },
    description: {
      type: String,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: {
        values: Object.values(TourDifficulty),
        message: 'Difficulty is either: easy, medium, or hard!',
      },
      required: [true, 'A tour must have a difficulty!'],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration!'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size!'],
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price!'],
      set: (val: number) => oneDecimal(val),
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val: number) {
          // This points to the current doc on NEW document creation.
          // @ts-ignore TypeScript will infer 'this' as any, but it works
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price!',
      },
      set: (val: number) => oneDecimal(val),
    },
    startDates: {
      type: [Date],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image!'],
    },
    images: {
      type: [String],
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: GeoJSONType.POINT,
        enum: Object.values(GeoJSONType),
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        // GeoJSON
        type: {
          type: String,
          default: GeoJSONType.POINT,
          enum: Object.values(GeoJSONType),
        },
        coordinates: [Number],
        address: String,
        description: String,
      },
    ],
    // todo: guides: [{type: mongoose.Schema.ObjectId, ref: 'User'}],
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above or equal to 1.0'],
      max: [5, 'Rating must be below or equal to 5.0'],
      set: (val: number) => oneDecimal(val),
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  return oneDecimal(this.duration / 7);
});

export type ITour = InferSchemaType<typeof tourSchema>;

interface ITourModel extends Model<ITour> {
  // Add your static method signatures here when needed
  // Example:
  // findByDifficulty(difficulty: string): Promise<ITour[]>;
  // calculateStats(): Promise<any>;
}

// In Mongoose 7+, synchronous pre hooks don't need the next() callback
tourSchema.pre<Query<ITour, ITour>>(/^find/, function () {
  this.find({ secretTour: { $ne: true } });
});

tourSchema.pre('save', function () {
  // @ts-ignore package has no official TypeScript type definitions.
  this.slug = slugify(this.name, { lower: true });
});

// Example of adding static methods (uncomment and implement as needed)
// tourSchema.statics.findByDifficulty = function(difficulty: string) {
//   return this.find({ difficulty });
// };
//
// tourSchema.statics.calculateStats = async function() {
//   const stats = await this.aggregate([
//     // aggregation pipeline
//   ]);
//   return stats;
// };

const Tour = model<ITour, ITourModel>('Tour', tourSchema);

export default Tour;
