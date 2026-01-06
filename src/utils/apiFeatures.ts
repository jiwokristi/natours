import type { Query } from 'mongoose';

/**
 * APIFeatures class for handling query operations like filtering, sorting, field limiting, and pagination
 *
 * @example
 * ```typescript
 * import APIFeatures from 'utils/apiFeatures.js';
 * import Tour from 'models/tourModel.js';
 *
 * const features = new APIFeatures(Tour.find(), req.query)
 *   .filter()
 *   .sort()
 *   .limitFields()
 *   .paginate();
 *
 * const tours = await features.query;
 * ```
 */
export interface QueryString {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  [key: string]: any;
}

class APIFeatures<T = any> {
  public query: Query<T[], T>;
  public queryString: QueryString;

  constructor(query: Query<T[], T>, queryString: QueryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter(): this {
    const queryObj = { ...this.queryString };
    const excludedFields: (keyof QueryString)[] = [
      'page',
      'sort',
      'limit',
      'fields',
    ];
    excludedFields.forEach(el => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr)) as Query<T[], T>;

    return this;
  }

  sort(): this {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy) as Query<T[], T>;
    } else {
      this.query = this.query.sort('-createdAt') as Query<T[], T>;
    }

    return this;
  }

  limitFields(): this {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields) as Query<T[], T>;
    } else {
      this.query = this.query.select('-__v') as Query<T[], T>;
    }

    return this;
  }

  paginate(): this {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit) as Query<T[], T>;

    return this;
  }
}

export default APIFeatures;
