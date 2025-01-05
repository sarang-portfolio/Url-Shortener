import { Router } from 'express';
import { ResponseHandler } from '../../utility/responseHandler';
import analyticsService from './analytics.service';

export const AnaylticsRouter = Router();

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

AnaylticsRouter.get('/:alias', async (req, res, next) => {
  try {
    const { alias } = req.params;
    const response = await analyticsService.getAnalyticsData(alias);
    res.send(new ResponseHandler(response));
  } catch (error) {
    next(error);
  }
});
