import { google } from 'googleapis';
import { COMMON_CONSTANTS } from './common/constants/common.constants';
import { ERROR_CODES } from './common/constants/statusCode.constants';

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  GOOGLE_ISSUER,
} = process.env;

const { PROFILE_SCOPE, EMAIL_SCOPE, GOOGLE_ACCESS_TYPE } = COMMON_CONSTANTS;

export const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
);

const SCOPES = [PROFILE_SCOPE, EMAIL_SCOPE];

export const getAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: GOOGLE_ACCESS_TYPE,
    scope: SCOPES,
  });
};

export const getToken = async (code: string) => {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
};

export const verifyIdToken = async (idToken: string) => {
  try {
    const ticket = await oauth2Client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (payload?.iss !== GOOGLE_ISSUER) {
      throw {
        statusCode: ERROR_CODES.FORBIDDEN,
        message: COMMON_CONSTANTS.INVALID_ID_TOKEN,
      };
    }
    return payload;
  } catch (error) {
    throw error;
  }
};
