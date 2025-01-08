import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { URL_ROUTES } from '../../utility/common/constants/routes.constants';
import {
  detectDeviceType,
  detectOsName,
  getGeoLocation,
  getIpAddress,
} from '../../utility/deviceDetection';
import logger from '../../utility/logger';
import redisClient from '../../utility/redis';
import { ResponseHandler } from '../../utility/responseHandler';
import analyticsService from '../analytics/analytics.service';
import { URL_CONSTANTS } from './url.constants';
import urlService from './url.service';

export const UrlRouter = Router();
const { PRIVATE_SHORTEN_URL, PRIVATE_GET_SHORTEN_URL } = URL_ROUTES;

/**
 * @swagger
 * tags:
 *   - name: Url
 *     description: Url operations for short URLs.
 */

/**
 * @swagger
 * /url/shorten:
 *   post:
 *     tags:
 *       - Url
 *     summary: Create a shortened URL.
 *     description: Generate a short URL from a given long URL with an optional custom alias and topic.
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               longUrl:
 *                 type: string
 *                 description: The original long URL to shorten.
 *               customAlias:
 *                 type: string
 *                 description: Optional custom alias for the short URL.
 *               topic:
 *                 type: string
 *                 description: Topic or category for the URL.
 *             required:
 *               - longUrl
 *     responses:
 *       200:
 *         description: Successfully created a shortened URL.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseHandler'
 *       429:
 *         description: Too many requests, rate limit exceeded.
 *       401:
 *         description: Unauthorized, missing or invalid token.
 *       400:
 *         description: Bad request, invalid parameters or missing required fields.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /url/shorten/{alias}:
 *   get:
 *     tags:
 *       - Url
 *     summary: Redirect to the original URL.
 *     description: Redirect users to the original long URL based on the provided short alias.
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: alias
 *         schema:
 *           type: string
 *         required: true
 *         description: The alias of the shortened URL.
 *     responses:
 *       302:
 *         description: Redirect to the original long URL.
 *       404:
 *         description: Short URL not found.
 *       500:
 *         description: Internal server error.
 *       400:
 *         description: Bad request, invalid alias format.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ResponseHandler:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           description: Response data returned from the request.
 *         error:
 *           type: object
 *           description: Error details if any.
 */

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  limit: 3,
  message: 'Too many requests, please try again later',
  standardHeaders: 'draft-8',
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests, please try again later',
    });
  },
});

UrlRouter.post(PRIVATE_SHORTEN_URL, limiter, async (req, res, next) => {
  try {
    const data = {
      longUrl: req.body.longUrl,
      customAlias: req.body?.customAlias || null,
      topic: req.body?.topic.toLowerCase() || null,
      sub: res.locals.user.sub,
    };
    const response = await urlService.createUrl(data);
    res.send(new ResponseHandler(response));
  } catch (error) {
    next(error);
  }
});

UrlRouter.get(PRIVATE_GET_SHORTEN_URL, async (req, res, next) => {
  try {
    const { alias } = req.params;

    const cachedLongUrl = await redisClient.get(alias);
    if (cachedLongUrl) {
      const analytics = {
        timeStamp: new Date(),
        userAgent: req.headers['user-agent'] || 'Unknown',
        ipAddress: getIpAddress(req),
        geoLocation: getGeoLocation(getIpAddress(req)),
        deviceType: detectDeviceType(req.headers['user-agent'] || 'Unknown'),
        osName: detectOsName(req.headers['user-agent'] || 'Unknown'),
      };
      logger.info(JSON.stringify(analytics, null, 2));
      const { timeStamp, ...restAnalytics } = analytics;
      await analyticsService.createAnalytics({
        urlId: 0,
        ...restAnalytics,
      });

      return res.status(302).redirect(cachedLongUrl);
    }

    const response = await urlService.getOneUrl({ customAlias: alias });
    if (!response) {
      throw URL_CONSTANTS.NOT_FOUND;
    }
    await redisClient.set(alias, response.longUrl, { EX: 3600 });

    const analytics = {
      timeStamp: new Date(),
      userAgent: req.headers['user-agent'] || 'Unknown',
      ipAddress: getIpAddress(req),
      geoLocation: getGeoLocation(getIpAddress(req)),
      deviceType: detectDeviceType(req.headers['user-agent'] || 'Unknown'),
      osName: detectOsName(req.headers['user-agent'] || 'Unknown'),
    };
    logger.info(JSON.stringify(analytics, null, 2));
    const { timeStamp, ...restAnalytics } = analytics;
    await analyticsService.createAnalytics({
      urlId: response.id ?? 0,
      ...restAnalytics,
    });
    res.status(302).redirect(response?.longUrl as string);
  } catch (error) {
    next(error);
  }
});
