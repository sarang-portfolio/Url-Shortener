import { ERROR_MESSAGES } from '../../utility/common/constants/message.constants';
import { ERROR_CODES } from '../../utility/common/constants/statusCode.constants';
import { MessageHandler } from '../../utility/responseHandler';

export const ANALYTICS_CONSTANTS = {
  INTERNAL_SERVER_ERROR: new MessageHandler(
    ERROR_CODES.INTERNAL_SERVER,
    ERROR_MESSAGES.SERVER_ERROR,
  ),
  NOT_FOUND: new MessageHandler(
    ERROR_CODES.NOT_FOUND,
    ERROR_MESSAGES.NOT_FOUND,
  ),
};
