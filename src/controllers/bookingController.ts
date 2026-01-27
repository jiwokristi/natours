import { Request } from 'express';
import Stripe from 'stripe';

import Tour from 'models/tourModel.js';
import Booking from 'models/bookingModel.js';

import catchAsync from 'utils/catchAsync.js';

import * as factory from './factoryController.js';
import AppError from 'utils/appError.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const getCheckoutSession = catchAsync(
  async (req: Request<{ tourId: string }>, res, next) => {
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId);

    if (!tour) {
      return next(new AppError('No tour found with that ID', 404));
    }

    // 2) Create product and price on Stripe
    const product = await stripe.products.create({
      name: `${tour.name} Tour`,
      description: tour.summary,
      images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: tour.price * 100,
      currency: 'usd',
    });

    // 3) Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get('host')}/?tour=${
        req.params.tourId
      }&user=${req.user.id}&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
    });

    // 4) Create session as response
    res.status(200).json({
      status: 'success',
      session,
    });
  },
);

export const createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour || !user || !price) return next();

  await Booking.create({ tour, user, price: +price });

  res.redirect(req.originalUrl.split('?')[0] as string);
});

export const getAllBookings = factory.getAll(Booking);
export const getBooking = factory.getOne(Booking);
export const createBooking = factory.createOne(Booking);
export const updateBooking = factory.updateOne(Booking);
export const deleteBooking = factory.deleteOne(Booking);
