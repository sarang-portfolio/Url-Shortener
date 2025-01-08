import { NextFunction, Request, Response } from 'express';
import { Server } from 'http';
import request from 'supertest';
import app, { startServer } from '../app/app';
import analyticsService from '../app/modules/analytics/analytics.service';
import urlService from '../app/modules/url/url.service';
import { ERROR_MESSAGES } from '../app/utility/common/constants/message.constants';
import { ERROR_CODES } from '../app/utility/common/constants/statusCode.constants';
import { IExcludedPaths } from '../app/utility/common/types/common.types';
import { verifyIdToken } from '../app/utility/OAuth2.google';
import redisClient from '../app/utility/redis';
import { sequelize } from '../app/utility/sequelize';

jest.mock('../app/modules/url/url.service.ts', () => ({
  createUrl: jest.fn(),
  getOneUrl: jest.fn(),
}));

jest.mock('../app/utility/OAuth2.google.ts', () => ({
  verifyIdToken: jest.fn(),
}));

(verifyIdToken as jest.Mock).mockResolvedValue({
  sub: '123',
  email: '123@example.com',
});

jest.mock('../app/utility/authorize.ts', () => ({
  authorize: jest.fn().mockImplementation((excludedPaths: IExcludedPaths[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (
        excludedPaths.find(
          (e) => req.url.includes(e.path) && req.method.includes(e.method),
        )
      ) {
        return next();
      }

      const token = req.headers.authorization as string;
      try {
        const payload = await (verifyIdToken as jest.Mock)(token);
        res.locals.user = payload;
        next();
      } catch {
        next({
          statusCode: ERROR_CODES.FORBIDDEN,
          message: ERROR_MESSAGES.UNAUTHORIZED,
        });
      }
    };
  }),
}));

jest.mock('../app/utility/redis.ts', () => ({
  get: jest.fn((key: string) => {
    if (key === 'existingKey') return Promise.resolve('mockValue');
    return Promise.resolve(null);
  }),
  set: jest.fn((key: string, value: string, options: any) => {
    return Promise.resolve('OK');
  }),
  on: jest.fn(),
  connect: jest.fn(() => Promise.resolve()),
  disconnect: jest.fn(() => Promise.resolve()),
}));

jest.mock('../app/modules/analytics/analytics.service.ts', () => ({
  createAnalytics: jest.fn(),
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

jest.mock('../app/utility/deviceDetection.ts', () => ({
  getIpAddress: jest.fn(() => '127.0.0.1'),
  getGeoLocation: jest.fn(() => 'Pune, India'),
  detectDeviceType: jest.fn(() => 'Desktop'),
  detectOsName: jest.fn(() => 'Windows'),
}));

let server: Server;

beforeAll(async () => {
  try {
    server = await startServer();
    await sequelize.authenticate();
  } catch (error) {
    console.error(ERROR_MESSAGES.SERVER_RUN_FAILURE, error);
  }
});

afterAll(async () => {
  server.close();
  await sequelize.close();
  await redisClient.disconnect();
  jest.clearAllMocks();
});

describe('POST /shorten', () => {
  const mockToken = 'mockToken';
  const urlData = {
    longUrl: 'https://example.com',
    customAlias: 'customalias',
    topic: 'tech',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (urlService.createUrl as jest.Mock).mockResolvedValue({
      shortUrl: 'https://shortn.it/customalias',
    });
  });

  it('should create a shortened URL successfully', async () => {
    const response = await request(app)
      .post('/url/shorten')
      .send(urlData)
      .set('Authorization', mockToken);

    expect(response.status).toBe(200);
    expect(urlService.createUrl).toHaveBeenCalledWith({
      ...urlData,
      topic: 'tech',
      sub: expect.any(String),
    });
    expect(response.body.data.shortUrl).toBe('https://shortn.it/customalias');
  });

  it('should return 429 if rate limit is exceeded', async () => {
    // Simulate hitting the rate limit
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post('/url/shorten')
        .send(urlData)
        .set('Authorization', mockToken);
    }
    const response = await request(app)
      .post('/url/shorten')
      .send(urlData)
      .set('Authorization', mockToken);

    expect(response.status).toBe(429);
    expect(response.body.error).toBe(
      'Too many requests, please try again later',
    );
  });
});

describe('GET /shorten/:alias', () => {
  const alias = 'customalias';
  const mockUrl = 'https://example.com';
  const mockAnalytics = {
    timeStamp: new Date(),
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    ipAddress: '127.0.0.1',
    geoLocation: 'Pune, India',
    deviceType: 'Desktop',
    osName: 'Windows',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (redisClient.get as jest.Mock).mockResolvedValue(null);
    (urlService.getOneUrl as jest.Mock).mockResolvedValue({ longUrl: mockUrl });
    (analyticsService.createAnalytics as jest.Mock).mockResolvedValue({});
  });

  it('should redirect to the original URL if found and log analytics', async () => {
    const response = await request(app)
      .get(`/url/shorten/${alias}`)
      .set('User-Agent', mockAnalytics.userAgent)
      .set('X-Forwarded-For', mockAnalytics.ipAddress);

    expect(redisClient.get).toHaveBeenCalledWith(alias);
    expect(urlService.getOneUrl).toHaveBeenCalledWith({ customAlias: alias });
    expect(redisClient.set).toHaveBeenCalledWith(alias, mockUrl, { EX: 3600 });
    expect(analyticsService.createAnalytics).toHaveBeenCalledWith({
      urlId: 0,
      userAgent: mockAnalytics.userAgent,
      ipAddress: mockAnalytics.ipAddress,
      geoLocation: expect.any(String),
      deviceType: expect.any(String),
      osName: expect.any(String),
    });
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(mockUrl);
  });

  it('should return 404 if URL is not found', async () => {
    (urlService.getOneUrl as jest.Mock).mockResolvedValue(null);

    const response = await request(app).get(`/url/shorten/${alias}`);

    expect(response.status).toBe(404);
    expect(response.body.error.message).toBe('URL NOT FOUND');
  });

  it('should return cached URL if available', async () => {
    (redisClient.get as jest.Mock).mockResolvedValue(mockUrl);

    const response = await request(app).get(`/url/shorten/${alias}`);

    expect(redisClient.get).toHaveBeenCalledWith(alias);
    expect(urlService.getOneUrl).not.toHaveBeenCalled();
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(mockUrl);
  });

  it('should not log analytics if URL is not found', async () => {
    (urlService.getOneUrl as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .get(`/url/shorten/${alias}`)
      .set('User-Agent', mockAnalytics.userAgent)
      .set('X-Forwarded-For', mockAnalytics.ipAddress);

    expect(analyticsService.createAnalytics).not.toHaveBeenCalled();
    expect(response.status).toBe(404);
    expect(response.body.error.message).toBe('URL NOT FOUND');
  });

  it('should log analytics when redirecting cached URL', async () => {
    (redisClient.get as jest.Mock).mockResolvedValue(mockUrl);

    const response = await request(app)
      .get(`/url/shorten/${alias}`)
      .set('User-Agent', mockAnalytics.userAgent)
      .set('X-Forwarded-For', mockAnalytics.ipAddress);

    expect(redisClient.get).toHaveBeenCalledWith(alias);
    expect(urlService.getOneUrl).not.toHaveBeenCalled();
    expect(analyticsService.createAnalytics).toHaveBeenCalledWith({
      urlId: 0,
      userAgent: mockAnalytics.userAgent,
      ipAddress: mockAnalytics.ipAddress,
      geoLocation: expect.any(String),
      deviceType: expect.any(String),
      osName: expect.any(String),
    });
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(mockUrl);
  });
});
