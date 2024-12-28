import { Sequelize, Dialect } from "sequelize";
import { COMMON_CONSTANTS } from "./common/constants/common.constants";
import logger from "./logger";

const { DATABASE, HOST, DB_PORT, DB_USER, DB_PASSWORD, DIALECT } = process.env;

export const sequelize = new Sequelize(
  DATABASE as string,
  DB_USER as string,
  DB_PASSWORD,
  {
    host: HOST,
    port: Number(DB_PORT),
    dialect: (DIALECT as Dialect) || COMMON_CONSTANTS.DATABASE_DIALECT,
    logging: (message) => logger.info(message),
  }
);
