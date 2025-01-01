import { SUCCESS_MESSAGES } from '../utility/common/constants/message.constants';
import logger from '../utility/logger';
import { sequelize } from '../utility/sequelize';
import { ERROR_MESSAGES } from '../utility/common/constants/message.constants';

export const connectToPostgres = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    logger.info(SUCCESS_MESSAGES.CONNECTED);
    return true;
  } catch (e) {
    logger.error(e);
    throw ERROR_MESSAGES.DATABASE_CONNCECTION_FAILURE;
  }
};
