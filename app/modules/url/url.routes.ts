import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  detectDeviceType,
  detectOsName,
  getGeoLocation,
  getIpAddress,
} from '../../utility/deviceDetection';
import logger from '../../utility/logger';
import { ResponseHandler } from '../../utility/responseHandler';
import analyticsService from '../analytics/analytics.service';
import { URL_CONSTANTS } from './url.constants';
import urlService from './url.service';

export const UrlRouter = Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  limit: 3,
  message: 'Too many requests, please try again later',
  standardHeaders: 'draft-8',
});

UrlRouter.post('/shorten', limiter, async (req, res, next) => {
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

UrlRouter.get('/shorten/:alias', async (req, res, next) => {
  try {
    const { alias } = req.params;
    const response = await urlService.getOneUrl({ customAlias: alias });
    if (!response) {
      throw URL_CONSTANTS.NOT_FOUND;
    }
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
    await analyticsService.CreateAnalytics({
      urlId: response.id ?? 0,
      ...restAnalytics,
    });
    res.redirect(response?.longUrl as string);
  } catch (error) {
    next(error);
  }
});
