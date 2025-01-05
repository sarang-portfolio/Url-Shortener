import { NextFunction, Request, Response, Router } from 'express';
import { ResponseHandler } from '../../utility/responseHandler';
import analyticsService from './analytics.service';
import redisClient from '../../utility/redis';

export const AnaylticsRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics operations for short URLs.
 */

/**
 * @swagger
 * /analytics/overall:
 *   get:
 *     summary: Get overall analytics
 *     tags: [Analytics]
 *     description: Retrieve overall analytics for all short URLs created by the authenticated user.
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved overall analytics.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUrls:
 *                   type: number
 *                   description: Total number of short URLs created by the user.
 *                 totalClicks:
 *                   type: number
 *                   description: Total number of clicks across all URLs.
 *                 uniqueUsers:
 *                   type: number
 *                   description: Total number of unique users who accessed the URLs.
 *                 clicksByDate:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         description: The date for the analytics entry.
 *                       totalClicks:
 *                         type: number
 *                         description: Total clicks for the date.
 *                 osType:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       osName:
 *                         type: string
 *                         description: Operating system name.
 *                       uniqueClicks:
 *                         type: number
 *                         description: Unique clicks from the OS.
 *                       uniqueUsers:
 *                         type: number
 *                         description: Unique users from the OS.
 *                 deviceType:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       deviceName:
 *                         type: string
 *                         description: Device type (e.g., mobile, desktop).
 *                       uniqueClicks:
 *                         type: number
 *                         description: Unique clicks from the device.
 *                       uniqueUsers:
 *                         type: number
 *                         description: Unique users from the device.
 *       401:
 *         description: Unauthorized.
 */

/**
 * @swagger
 * /analytics/topic/{topic}:
 *   get:
 *     summary: Get topic-based analytics
 *     tags: [Analytics]
 *     description: Retrieve analytics for all URLs under a specific topic.
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: topic
 *         required: true
 *         schema:
 *           type: string
 *         description: The topic name to filter analytics by.
 *     responses:
 *       200:
 *         description: Successfully retrieved topic-based analytics.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalClicks:
 *                   type: number
 *                   description: Total clicks across all URLs in the topic.
 *                 uniqueUsers:
 *                   type: number
 *                   description: Unique users for the topic.
 *                 clicksByDate:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         description: The date for the analytics entry.
 *                       totalClicks:
 *                         type: number
 *                         description: Total clicks for the date.
 *                 urls:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       shortUrl:
 *                         type: string
 *                         description: The short URL.
 *                       totalClicks:
 *                         type: number
 *                         description: Total clicks for the URL.
 *                       uniqueUsers:
 *                         type: number
 *                         description: Unique users for the URL.
 *       400:
 *         description: Bad Request.
 */

/**
 * @swagger
 * /analytics/{alias}:
 *   get:
 *     summary: Get analytics for a specific URL
 *     tags: [Analytics]
 *     description: Retrieve analytics for a specific short URL, including total clicks, unique users, and detailed usage metrics.
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: alias
 *         required: true
 *         schema:
 *           type: string
 *         description: The alias of the short URL.
 *     responses:
 *       200:
 *         description: Successfully retrieved analytics for the short URL.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalClicks:
 *                   type: number
 *                   description: Total number of clicks for the short URL.
 *                 uniqueUsers:
 *                   type: number
 *                   description: Unique users for the short URL.
 *                 clicksByDate:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         description: The date for the analytics entry.
 *                       clickCount:
 *                         type: number
 *                         description: Click count for the date.
 *                 osType:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       osName:
 *                         type: string
 *                         description: Operating system name.
 *                       uniqueClicks:
 *                         type: number
 *                         description: Unique clicks from the OS.
 *                       uniqueUsers:
 *                         type: number
 *                         description: Unique users from the OS.
 *                 deviceType:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       deviceName:
 *                         type: string
 *                         description: Device type (e.g., mobile, desktop).
 *                       uniqueClicks:
 *                         type: number
 *                         description: Unique clicks from the device.
 *                       uniqueUsers:
 *                         type: number
 *                         description: Unique users from the device.
 *       404:
 *         description: Not Found.
 */

AnaylticsRouter.get('/overall', async (req, res, next) => {
  try {
    const { sub } = res.locals.user;
    const response = await analyticsService.overallAnalytics(sub);
    res.send(new ResponseHandler(response));
  } catch (error) {
    next(error);
  }
});

AnaylticsRouter.get('/topic/:topic', async (req, res, next) => {
  try {
    const { topic } = req.params;
    const response = await analyticsService.topicAnalytics(topic);
    res.send(new ResponseHandler(response));
  } catch (error) {
    next(error);
  }
});

AnaylticsRouter.get(
  '/:alias',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { alias } = req.params;

      const cachedAnalytics = await redisClient.get(`analytics:${alias}`);
      if (cachedAnalytics) {
        res.send(new ResponseHandler(JSON.parse(cachedAnalytics)));
        return;
      }

      const response = await analyticsService.getAnalyticsData(alias);
      await redisClient.set(`analytics:${alias}`, JSON.stringify(response), {
        EX: 3600,
      });
      res.send(new ResponseHandler(response));
    } catch (error) {
      next(error);
    }
  },
);
