import type { Response, CookieOptions } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

import { IUser } from 'models/userModel.js';

const signToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN as unknown as number,
  });

export const createSendToken = (
  user: IUser,
  statusCode: number,
  res: Response,
) => {
  const token = signToken(user._id.toString());

  const cookieOptions: CookieOptions = {
    expires: new Date(
      Date.now() +
        (process.env.JWT_COOKIE_EXPIRES_IN as unknown as number) *
          24 *
          60 *
          60 *
          1000,
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from the output
  (user as any).password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export const jwtVerifyPromisified = (
  token: string,
  secret: string,
): JwtPayload => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, {}, (err, payload) => {
      if (err) {
        reject(err);
      } else {
        resolve(payload);
      }
    });
  });
};
