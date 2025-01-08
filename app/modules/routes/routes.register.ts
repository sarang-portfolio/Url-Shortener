import cors from 'cors';
import { Application, NextFunction, Request, Response, json } from 'express';
import helmet from 'helmet';
import { authorize } from '../../utility/authorize';
import { ERROR_CODES } from '../../utility/common/constants/statusCode.constants';
import logger from '../../utility/logger';
import { ResponseHandler } from '../../utility/responseHandler';
import { excludedPaths, routes } from './routes.data';

export const registerRoutes = (app: Application) => {
  app.use(helmet());
  app.use(cors());
  app.use(json());

  app.use(authorize(excludedPaths));

  for (let route of routes) {
    app.use(route.path, route.router);
  }

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(err);
    res
      .status(err.statusCode || ERROR_CODES.INTERNAL_SERVER)
      .send(new ResponseHandler(null, err));
  });
};
