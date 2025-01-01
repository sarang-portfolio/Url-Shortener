export const HEALTH_CHECK_ROUTES = {
  PUBLIC_HEALTH_CHECK: '/healthCheck',
};

export const AUTH_ROUTES = {
  PRIVATE_AUTH_LOGIN: '/login',
  PRIVATE_AUTH_OAUTH2_CALLBACK: '/oauth2callback',
  PUBLIC_AUTH_ROUTE: '/auth',
};

export const SWAGGER_ROUTES = {
  PUBLIC_SWAGGER_DOCS: '/api-docs',
};

export const API_METHODS: {
  [key: string]: string;
} = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};
