import { Router } from 'express';
import { ResponseHandler } from '../../utility/responseHandler';
import urlService from './url.service';
import rateLimit from 'express-rate-limit';

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
      topic: req.body?.topic || null,
      sub: res.locals.user.sub,
    };
    const response = await urlService.createUrl(data);
    res.send(new ResponseHandler(response));
  } catch (error) {
    next(error);
  }
});
