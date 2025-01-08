import { NextFunction, Request, Response } from 'express';
import { Server } from 'http';
import request from 'supertest';
import app, { startServer } from '../app/app';
import { ANALYTICS_CONSTANTS } from '../app/modules/analytics/analytics.constants';
import analyticsService from '../app/modules/analytics/analytics.service';
import { ERROR_MESSAGES } from '../app/utility/common/constants/message.constants';
import { ERROR_CODES } from '../app/utility/common/constants/statusCode.constants';
import { IExcludedPaths } from '../app/utility/common/types/common.types';
import { verifyIdToken } from '../app/utility/OAuth2.google';
import redisClient from '../app/utility/redis';
import { sequelize } from '../app/utility/sequelize';

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

jest.mock('../app/modules/analytics/analytics.service.ts');

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
const mockToken = 'mockToken';

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

describe('GET /analytics/overall', () => {
  it('should return overall analytics data', async () => {
    const mockAnalyticsData = { totalUsers: 100, totalClicks: 2000 };
    const mockUser = { sub: '123' };

    // Mocking analyticsService
    analyticsService.overallAnalytics = jest
      .fn()
      .mockResolvedValue(mockAnalyticsData);

    // Mocking the user data in res.locals
    const res = await request(app)
      .get('/analytics/overall')
      .set('Authorization', mockToken) // provide necessary headers
      .expect(200);

    expect(analyticsService.overallAnalytics).toHaveBeenCalledWith(
      mockUser.sub,
    );
    expect(res.body.data).toEqual(mockAnalyticsData);
  });

  it('should handle errors and return a 500 status', async () => {
    const mockUser = { sub: '123' };
    analyticsService.overallAnalytics = jest
      .fn()
      .mockRejectedValue(ANALYTICS_CONSTANTS.INTERNAL_SERVER_ERROR);

    const res = await request(app)
      .get('/analytics/overall')
      .set('Authorization', mockToken)
      .expect(500);
    expect(res.body.error.message).toBe(ERROR_MESSAGES.SERVER_ERROR);
  });
});

describe('GET /analytics/topic/:topic', () => {
  it('should return analytics data for a specific topic', async () => {
    const mockAnalyticsData = { totalViews: 5000, engagementRate: 0.85 }; // example data
    const topic = 'NodeJS';

    analyticsService.topicAnalytics = jest
      .fn()
      .mockResolvedValue(mockAnalyticsData);

    const res = await request(app)
      .get(`/analytics/topic/${topic}`)
      .set('Authorization', mockToken)
      .expect(200);

    expect(analyticsService.topicAnalytics).toHaveBeenCalledWith(topic);
    expect(res.body.data).toEqual(mockAnalyticsData);
  });

  it('should handle errors and return a 500 status', async () => {
    const topic = 'NodeJS';
    analyticsService.topicAnalytics = jest
      .fn()
      .mockRejectedValue(ANALYTICS_CONSTANTS.INTERNAL_SERVER_ERROR);

    const res = await request(app)
      .get(`/analytics/topic/${topic}`)
      .set('Authorization', mockToken)
      .expect(500);

    expect(res.body.error.message).toBe(ERROR_MESSAGES.SERVER_ERROR);
  });
});

describe('GET /analytics/:alias', () => {
  it('should return cached analytics data if available in Redis', async () => {
    const alias = 'customAlias';
    const mockAnalyticsData = { totalViews: 3000, clicks: 1500 };

    redisClient.get = jest
      .fn()
      .mockResolvedValue(JSON.stringify(mockAnalyticsData));

    const res = await request(app)
      .get(`/analytics/${alias}`)
      .set('Authorization', mockToken)
      .expect(200);

    expect(redisClient.get).toHaveBeenCalledWith(`analytics:${alias}`);
    expect(res.body.data).toEqual(mockAnalyticsData);
  });

  it('should fetch and cache analytics data if not in Redis', async () => {
    const alias = 'customAlias';
    const mockAnalyticsData = { totalViews: 3000, clicks: 1500 };

    redisClient.get = jest.fn().mockResolvedValue(null);
    analyticsService.getAnalyticsData = jest
      .fn()
      .mockResolvedValue(mockAnalyticsData);
    redisClient.set = jest.fn().mockResolvedValue('OK');

    const res = await request(app)
      .get(`/analytics/${alias}`)
      .set('Authorization', mockToken)
      .expect(200);

    expect(redisClient.get).toHaveBeenCalledWith(`analytics:${alias}`);
    expect(analyticsService.getAnalyticsData).toHaveBeenCalledWith(alias);
    expect(redisClient.set).toHaveBeenCalledWith(
      `analytics:${alias}`,
      JSON.stringify(mockAnalyticsData),
      { EX: 3600 },
    );
    expect(res.body.data).toEqual(mockAnalyticsData);
  });
});
