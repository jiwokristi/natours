import { Document, InferSchemaType, model, Query, Schema } from 'mongoose';

const bookingSchema = new Schema({
  tour: {
    type: Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a tour!'],
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user!'],
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price.'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre<Query<BookingData, IBooking>>(/^find/, function () {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });
});

export type BookingData = InferSchemaType<typeof bookingSchema>;
export interface IBooking extends Document, BookingData {}

const Booking = model<IBooking>('Booking', bookingSchema);

export default Booking;
