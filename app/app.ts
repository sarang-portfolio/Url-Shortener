import express from 'express';
import { connectToPostgres } from './connections/postgres.connection';
import { registerRoutes } from './modules/routes/routes.register';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from './utility/common/constants/message.constants';
import { HEALTH_CHECK_ROUTES } from './utility/common/constants/routes.constants';
import { SUCCESS_CODES } from './utility/common/constants/statusCode.constants';
import logger from './utility/logger';
import { ResponseHandler } from './utility/responseHandler';
import { setupSwagger } from './utility/swagger';

const { SERVER_RUN_FAILURE } = ERROR_MESSAGES;
const { SERVER_RUN_SUCCESS, HEALTH_CHECK_SUCCESS } = SUCCESS_MESSAGES;

const app = express();

export const startServer = async () => {
  try {
    await connectToPostgres();
    registerRoutes(app);
    setupSwagger(app);

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

    app.get(HEALTH_CHECK_ROUTES.PUBLIC_HEALTH_CHECK, (req, res, next) => {
      res.send(
        new ResponseHandler({
          statusCode: SUCCESS_CODES.OK,
          message: HEALTH_CHECK_SUCCESS,
        }),
      );
    });

    const { PORT } = process.env;
    const server = app.listen(PORT, () =>
      logger.info(`${SERVER_RUN_SUCCESS}: ${PORT}`),
    );
    return server;
  } catch (e) {
    logger.error(e);
    logger.info(SERVER_RUN_FAILURE);
    process.exit(1);
  }
};

export default app;
