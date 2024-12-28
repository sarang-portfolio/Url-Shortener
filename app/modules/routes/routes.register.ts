import cors from "cors";
import { Application, NextFunction, Request, Response, json } from "express";
import helmet from "helmet";
import { ResponseHandler } from "../../utility/responseHandler";
import { routes } from "./routes.data";
import { ERROR_CODES } from "../../utility/common/constants/statusCode.constants";

export const registerRoutes = (app: Application) => {
  app.use(helmet());
  app.use(cors());
  app.use(json());

  for (let route of routes) {
    app.use(route.path, route.router);
  }

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    res
      .status(err.statusCode || ERROR_CODES.INTERNAL_SERVER)
      .send(new ResponseHandler(null, err));
  });
};
