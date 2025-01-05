import {
  API_METHODS,
  AUTH_ROUTES,
  HEALTH_CHECK_ROUTES,
  SWAGGER_ROUTES,
} from '../../utility/common/constants/routes.constants';
import {
  IExcludedPaths,
  Method,
} from '../../utility/common/types/common.types';
import { AnaylticsRouter } from '../analytics/analytics.routes';
import { AuthRouter } from '../auth/auth.routes';
import { UrlRouter } from '../url/url.routes';
import { Route, Routes } from './routes.types';

const { PUBLIC_SWAGGER_DOCS } = SWAGGER_ROUTES;
const { GET } = API_METHODS;
const { PUBLIC_AUTH_ROUTE, PRIVATE_AUTH_LOGIN, PRIVATE_AUTH_OAUTH2_CALLBACK } =
  AUTH_ROUTES;
const { PUBLIC_HEALTH_CHECK } = HEALTH_CHECK_ROUTES;

export const routes: Routes = [
  new Route(PUBLIC_AUTH_ROUTE, AuthRouter),
  new Route('/url', UrlRouter),
  new Route('/analytics', AnaylticsRouter),
];

export const excludedPaths: IExcludedPaths[] = [
  {
    path: PUBLIC_AUTH_ROUTE + PRIVATE_AUTH_LOGIN,
    method: GET as Method,
  },
  { path: PUBLIC_HEALTH_CHECK, method: GET as Method },
  { path: PUBLIC_SWAGGER_DOCS, method: GET as Method },
  {
    path: PUBLIC_AUTH_ROUTE + PRIVATE_AUTH_OAUTH2_CALLBACK,
    method: GET as Method,
  },
  { path: '/favicon.ico', method: GET as Method }, // Add this line
];
