import { MessageHandler } from '../../utility/responseHandler';

export const USER_CONSTANTS = {
  NOT_FOUND: new MessageHandler(404, 'USER NOT FOUND'),
};
