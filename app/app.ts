import express from "express";
import { connectToPostgres } from "./connections/postgres.connection";
import { registerRoutes } from "./modules/routes/routes.register";
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "./utility/common/constants/message.constants";
import { SUCCESS_CODES } from "./utility/common/constants/statusCode.constants";
import logger from "./utility/logger";
import { ResponseHandler } from "./utility/responseHandler";
import { healthCheckRoute } from "./utility/common/constants/routes.constants";
import { setupSwagger } from "./utility/swagger";

const { SERVER_RUN_FAILURE } = ERROR_MESSAGES;
const { SERVER_RUN_SUCCESS, HEALTH_CHECK_SUCCESS } = SUCCESS_MESSAGES;

export const startServer = async () => {
  try {
    const app = express();

    await connectToPostgres();
    registerRoutes(app);
    setupSwagger(app);

    const { PORT } = process.env;
    app.listen(PORT, () => logger.info(`${SERVER_RUN_SUCCESS}: ${PORT}`));

    /**
     * @openapi
     * /healthCheck:
     *   get:
     *     summary: Health check route
     *     description: Verifies if the server is up and running.
     *     responses:
     *       200:
     *         description: Server is up and running
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 statusCode:
     *                   type: integer
     *                   example: 200
     *                 message:
     *                   type: string
     *                   example: "HEALTH CHECK SUCCESSFULL"
     */

    app.get(healthCheckRoute.HEALTH_CHECK, (req, res, next) => {
      res.send(
        new ResponseHandler({
          statusCode: SUCCESS_CODES.OK,
          message: HEALTH_CHECK_SUCCESS,
        })
      );
    });
  } catch (e) {
    logger.error(e);
    logger.info(SERVER_RUN_FAILURE);
    process.exit(1);
  }
};
