import { MessageHandler } from '../../utility/responseHandler';

export const AUTH_CONSTANTS = {
  MISSING_AUTH_CODE: new MessageHandler(400, 'NO AUTH CODE PROVIDED'),
};
