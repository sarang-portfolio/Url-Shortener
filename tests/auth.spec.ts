import { Server } from 'http';
import request from 'supertest';
import app, { startServer } from '../app/app';
import { AUTH_CONSTANTS } from '../app/modules/auth/auth.constants';
import authService from '../app/modules/auth/auth.service';
import { getAuthUrl, getToken } from '../app/utility/OAuth2.google';
import { ResponseHandler } from '../app/utility/responseHandler';
import { ERROR_MESSAGES } from '../app/utility/common/constants/message.constants';

jest.mock('../app/utility/OAuth2.google.ts', () => ({
  getAuthUrl: jest.fn(),
  getToken: jest.fn(),
}));

jest.mock('../app/modules/auth/auth.service.ts', () => ({
  login: jest.fn(),
}));

jest.mock('winston', () => {
  const originalModule = jest.requireActual('winston');
  const mockFileTransport = jest.fn();
  return {
    ...originalModule,
    createLogger: jest.fn().mockReturnValue({
      add: jest.fn(),
      transports: [
        new mockFileTransport({
          filename: 'mock-error.log',
          level: 'error',
        }),
        new mockFileTransport({ filename: 'mock-combined.log' }),
      ],
      info: jest.fn(),
      error: jest.fn(),
    }),
    format: originalModule.format,
    transports: { ...originalModule.transports, File: mockFileTransport },
  };
});

describe('GET /auth/login', () => {
  let server: Server;

  beforeAll(async () => {
    try {
      server = await startServer();
    } catch (error) {
      console.error(ERROR_MESSAGES.SERVER_RUN_FAILURE);
    }
  });

  afterAll(async () => {
    server.close();
  });

  describe('GET /auth/login', () => {
    it('should redirect to Google auth URL', async () => {
      const mockAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
      (getAuthUrl as jest.Mock).mockReturnValue(mockAuthUrl);

      const response = await request(app).get('/auth/login');

      expect(response.status).toBe(302);
      expect(response.header.location).toBe(mockAuthUrl);
    });
  });

  describe('GET /auth/oauth2callback', () => {
    it('should return an error if code is missing', async () => {
      const response = await request(app).get('/auth/oauth2callback');

      expect(response.status).toBe(400);
      expect(JSON.stringify(response.body.error)).toEqual(
        JSON.stringify(AUTH_CONSTANTS.MISSING_AUTH_CODE),
      );
    });

    it('should login user and return response on valid code', async () => {
      const mockCode = 'mockAuthorizationCode';
      const mockTokens = {
        id_token: 'mockIdToken',
      };
      const mockResponse = {
        id: 123,
        token: 'mockIdToken',
      };

      (getToken as jest.Mock).mockResolvedValue(mockTokens);
      (authService.login as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app)
        .get('/auth/oauth2callback')
        .query({ code: mockCode });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(new ResponseHandler(mockResponse));
    });
  });
});
