import winston from 'winston';
import { COMMON_CONSTANTS } from './common/constants/common.constants';
import { LogLevel } from './common/constants/logger.constants';

const { NODE_ENV, ERROR_LOG_PATH, COMBINED_LOG_PATH } = process.env;
const { DATE_FORMAT, ENV_PROD } = COMMON_CONSTANTS;

const logger = winston.createLogger({
  level: LogLevel.INFO,
  format: winston.format.combine(
    winston.format.timestamp({ format: DATE_FORMAT }),
    winston.format.printf(
      ({ timestamp, level, message }) =>
        `[${timestamp}] ${level.toUpperCase()}: ${message}`,
    ),
  ),
  transports: [
    new winston.transports.File({
      filename: ERROR_LOG_PATH,
      level: LogLevel.ERROR,
    }),
    new winston.transports.File({ filename: COMBINED_LOG_PATH }),
  ],
});

if (NODE_ENV !== ENV_PROD) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.colorize(),
    }),
  );
}

export default logger;
