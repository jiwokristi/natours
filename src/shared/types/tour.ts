import { Types } from 'mongoose';

export const tourDifficulties = ['easy', 'medium', 'difficult'] as const;
export type TourDifficultyType = (typeof tourDifficulties)[number];

export const geoJSONTypes = ['Point'] as const;
export type GeoJSONType = (typeof geoJSONTypes)[number];

export interface GeoLocationType {
  type: GeoJSONType;
  coordinates: number[];
  description: string;
  day: number;
}

export interface ITour {
  name: string;
  slug: string;
  summary: string;
  description: string;
  difficulty: TourDifficultyType;
  duration: number;
  maxGroupSize: number;
  price: number;
  priceDiscount: number;
  startDates: Date[];
  imageCover: string;
  images: string[];
  startLocation: GeoLocationType;
  locations: GeoLocationType[];
  guides: Types.ObjectId;
  ratingsAverage: number;
  ratingsQuantity: number;
  createdAt: Date;
  secretTour: boolean;
}
