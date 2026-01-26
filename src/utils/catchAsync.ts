import { Request, Response, NextFunction } from 'express';

function catchAsync<Req = Request, Res = Response, Next = NextFunction>(
  controller: (req: Req, res: Res, next: Next) => Promise<any>,
) {
  return async (req: Req, res: Res, next: Next) => {
    try {
      return await controller(req, res, next);
    } catch (err) {
      (next as NextFunction)(err);
    }
  };
}

export default catchAsync;
