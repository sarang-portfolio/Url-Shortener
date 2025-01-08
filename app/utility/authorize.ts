import { NextFunction, Request, Response } from 'express';
import { ERROR_MESSAGES } from './common/constants/message.constants';
import { ERROR_CODES } from './common/constants/statusCode.constants';
import { IExcludedPaths } from './common/types/common.types';
import { verifyIdToken } from './OAuth2.google';

export const authorize = (excludedPaths: IExcludedPaths[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (
        excludedPaths.find(
          (e) => req.url.includes(e.path) && req.method.includes(e.method),
        )
      ) {
        return next();
      }
      const token = req.headers.authorization as string;
      const payload = await verifyIdToken(token);
      res.locals.user = payload;
      next();
    } catch (e) {
      next({
        statusCode: ERROR_CODES.FORBIDDEN,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }
  };
};
