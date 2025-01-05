import { MessageHandler } from '../../utility/responseHandler';

export const URL_CONSTANTS = {
  ALREADY_EXIST: new MessageHandler(
    400,
    'SHORT URL ALREADY EXISTS FOR THIS LONG URL',
  ),
  MISSING_LONG_URL: new MessageHandler(400, 'LONG URL IS REQUIRED'),
  INVALID_URL_FORMAT: new MessageHandler(400, 'INVALID LONG URL FORMAT'),
  NOT_FOUND: new MessageHandler(404, 'URL NOT FOUND'),
};
