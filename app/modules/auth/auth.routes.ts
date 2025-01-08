import { Router } from 'express';
import { getAuthUrl, getToken } from '../../utility/OAuth2.google';
import { AUTH_ROUTES } from '../../utility/common/constants/routes.constants';
import { ResponseHandler } from '../../utility/responseHandler';
import { AUTH_CONSTANTS } from './auth.constants';
import authService from './auth.service';

export const AuthRouter = Router();

const { PRIVATE_AUTH_LOGIN, PRIVATE_AUTH_OAUTH2_CALLBACK } = AUTH_ROUTES;

const { MISSING_AUTH_CODE } = AUTH_CONSTANTS;

AuthRouter.get(PRIVATE_AUTH_LOGIN, async (req, res, next) => {
  try {
    const authUrl = getAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    next(error);
  }
});

AuthRouter.get(PRIVATE_AUTH_OAUTH2_CALLBACK, async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) {
      throw MISSING_AUTH_CODE;
    }
    const tokens = await getToken(code.toString());
    const response = await authService.login(tokens.id_token as string);
    res.send(new ResponseHandler(response));
  } catch (error) {
    next(error);
  }
});
