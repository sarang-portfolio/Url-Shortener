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

export const URL_ROUTES = {
  PUBLIC_URL_ROUTE: '/url',
  PRIVATE_SHORTEN_URL: '/shorten',
  PRIVATE_GET_SHORTEN_URL: '/shorten/:alias',
};

export const ANALYTICS_ROUTES = {
  PUBLIC_ANALYTICS_ROUTE: '/analytics',
  PRIVATE_GET_OVERALL_ANALYTICS: '/overall',
  PRIVATE_GET_TOPIC_ANALYTICS: '/topic/:topic',
  PRIVATE_GET_CUSTOM_ALIAS_ANALYTICS: '/:alias',
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

export const OTHER_ROUTES = {
  FAVICON_ROUTE: '/favicon.ico',
};
