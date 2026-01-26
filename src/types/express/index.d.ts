import { IUser } from 'models/userModel';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    oldTourFiles?: string[];
  }
}
