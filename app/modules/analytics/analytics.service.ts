import { URL_CONSTANTS } from '../url/url.constants';
import urlService from '../url/url.service';
import userService from '../user/user.service';
import { ANALYTICS_CONSTANTS } from './analytics.constants';
import analyticsRepo from './analytics.repo';
import { CreateAnalyticsDto, IAnalytics } from './analytics.types';

const createAnalytics = async (createDto: CreateAnalyticsDto) => {
  try {
    const analytics = await analyticsRepo.create(createDto);
    return analytics;
  } catch (error) {
    throw error;
  }
};

const getAllAnalytics = async () => {
  try {
    const analytics = await analyticsRepo.getAll();
    return analytics;
  } catch (error) {
    throw error;
  }
};

const getOneAnalytics = async (getOneDto: Partial<IAnalytics>) => {
  try {
    const analytics = await analyticsRepo.getOne(getOneDto);
    return analytics;
  } catch (error) {
    throw error;
  }
};

const getAnalyticsData = async (alias: string) => {
  try {
    const url = await urlService.getOneUrl({ customAlias: alias });
    if (!url) throw URL_CONSTANTS.NOT_FOUND;

    const urlId = url.id as number;

    const totalClicks = await analyticsRepo.totalClicks(urlId);
    const uniqueUsers = await analyticsRepo.uniqueUsers(urlId);
    const dailyClicks = await analyticsRepo.clickByDate(urlId);
    const osData = await analyticsRepo.osTypeAnalytics(urlId);
    const deviceData = await analyticsRepo.deviceTypeAnalytics(urlId);
    return {
      totalClicks,
      uniqueUsers,
      clicksByDate: dailyClicks,
      osType: osData,
      deviceType: deviceData,
    };
  } catch (error) {
    throw ANALYTICS_CONSTANTS.INTERNAL_SERVER_ERROR;
  }
};

const topicAnalytics = async (topic: string) => {
  try {
    const totalClicks = await analyticsRepo.totalClicksByTopic(topic);
    const uniqueUsers = await analyticsRepo.uniqueUsersByTopic(topic);
    const clicksByDate = await analyticsRepo.clicksByDateForTopic(topic);
    const urls = await analyticsRepo.urlsByTopic(topic);
    return {
      totalClicks,
      uniqueUsers,
      clicksByDate,
      urls,
    };
  } catch (error) {
    throw ANALYTICS_CONSTANTS.INTERNAL_SERVER_ERROR;
  }
};

const overallAnalytics = async (sub: string) => {
  try {
    const user = await userService.getOneUser({ sub });
    const analytics = await analyticsRepo.overallAnalyticsOfUser(
      user?.id as number,
    );
    return analytics;
  } catch (error) {
    throw ANALYTICS_CONSTANTS.INTERNAL_SERVER_ERROR;
  }
};

export default {
  createAnalytics,
  getAllAnalytics,
  getOneAnalytics,
  getAnalyticsData,
  topicAnalytics,
  overallAnalytics,
};
