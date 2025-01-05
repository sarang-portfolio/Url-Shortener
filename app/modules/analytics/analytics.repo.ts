import { format, subDays } from 'date-fns';
import { Op } from 'sequelize';
import { sequelize } from '../../utility/sequelize';
import { analyticsModel } from './analytics.schema';
import { CreateAnalyticsDto, IAnalytics } from './analytics.types';
import { urlModel } from '../url/url.schema';

const create = (createDto: CreateAnalyticsDto) =>
  analyticsModel.create({ ...createDto });

const getAll = () => analyticsModel.findAll();

const getOne = (getOneDto: Partial<IAnalytics>) =>
  analyticsModel.findOne({ where: { ...getOneDto } });

const last7Days = Array.from({ length: 7 }, (_, i) =>
  format(subDays(new Date(), i), 'yyyy-MM-dd'),
);

const totalClicks = (urlId: number) =>
  analyticsModel.count({ where: { urlId } });

const uniqueUsers = (urlId: number) =>
  analyticsModel.count({ where: { urlId }, distinct: true, col: 'ipAddress' });

const clickByDate = async (urlId: number) => {
  return await Promise.all(
    last7Days.map(async (date) => {
      const count = await analyticsModel.count({
        where: {
          urlId,
          createdAt: {
            [Op.gte]: new Date(`${date}T00:00:00.000Z`),
            [Op.lte]: new Date(`${date}T23:59:59.999Z`),
          },
        },
      });
      return { date, count };
    }),
  );
};

const osTypeAnalytics = async (
  urlId: number,
): Promise<{ osName: string; uniqueClicks: number; uniqueUsers: number }[]> => {
  const osData = await analyticsModel.findAll({
    attributes: [
      'osName',
      [sequelize.fn('COUNT', sequelize.col('osName')), 'uniqueClicks'],
    ],
    where: { urlId },
    group: ['osName'],
  });

  return Promise.all(
    osData.map(async (entry: any) => {
      const uniqueUsersCount = await analyticsModel.count({
        where: { urlId, osName: entry.osName },
        distinct: true,
        col: 'ipAddress',
      });
      return {
        osName: entry.osName,
        uniqueClicks: entry.dataValues.uniqueClicks,
        uniqueUsers: uniqueUsersCount,
      };
    }),
  );
};

const deviceTypeAnalytics = async (
  urlId: number,
): Promise<
  { deviceName: string; uniqueClicks: number; uniqueUsers: number }[]
> => {
  const deviceData = await analyticsModel.findAll({
    attributes: [
      'deviceType',
      [sequelize.fn('COUNT', sequelize.col('deviceType')), 'uniqueClicks'],
    ],
    where: { urlId },
    group: ['deviceType'],
  });

  return Promise.all(
    deviceData.map(async (entry: any) => {
      const uniqueUsersCount = await analyticsModel.count({
        where: { urlId, deviceType: entry.deviceType },
        distinct: true,
        col: 'ipAddress',
      });
      return {
        deviceName: entry.deviceType,
        uniqueClicks: entry.dataValues.uniqueClicks,
        uniqueUsers: uniqueUsersCount,
      };
    }),
  );
};

const totalClicksByTopic = async (topic: string): Promise<number> => {
  const urls = await urlModel.findAll({ where: { topic }, attributes: ['id'] });
  const urlIds: any = urls.map((url) => url.id);

  return analyticsModel.count({ where: { urlId: urlIds } });
};

const uniqueUsersByTopic = async (topic: string): Promise<number> => {
  const urls = await urlModel.findAll({ where: { topic }, attributes: ['id'] });
  const urlIds: any = urls.map((url) => url.id);

  return analyticsModel.count({
    where: { urlId: urlIds },
    distinct: true,
    col: 'ipAddress',
  });
};

const clicksByDateForTopic = async (
  topic: string,
): Promise<{ date: string; count: number }[]> => {
  const urls = await urlModel.findAll({ where: { topic }, attributes: ['id'] });
  const urlIds: any = urls.map((url) => url.id);

  return Promise.all(
    last7Days.map(async (date) => {
      const count = await analyticsModel.count({
        where: {
          urlId: urlIds,
          createdAt: {
            [Op.gte]: new Date(`${date}T00:00:00.000Z`),
            [Op.lte]: new Date(`${date}T23:59:59.999Z`),
          },
        },
      });
      return { date, count };
    }),
  );
};

const urlsByTopic = async (
  topic: string,
): Promise<
  { shortUrl: string; totalClicks: number; uniqueUsers: number }[]
> => {
  const urls = await urlModel.findAll({
    where: { topic },
    attributes: ['id', 'shortUrl'],
  });

  return Promise.all(
    urls.map(async (url) => {
      const totalClicks = await analyticsModel.count({
        where: { urlId: url.id },
      });
      const uniqueUsers = await analyticsModel.count({
        where: { urlId: url.id },
        distinct: true,
        col: 'ipAddress',
      });

      return {
        shortUrl: url.shortUrl,
        totalClicks,
        uniqueUsers,
      };
    }),
  );
};

const overallAnalyticsOfUser = async (userId: number) => {
  const totalUrls = await urlModel.count({ where: { userId } });

  const totalClicks = await analyticsModel.count({
    include: [{ model: urlModel, as: 'url', where: { userId } }],
  });

  const uniqueUsers = await analyticsModel.count({
    include: [{ model: urlModel, as: 'url', where: { userId } }],
    distinct: true,
    col: 'ipAddress',
  });

  const clicksByDate = await Promise.all(
    last7Days.map(async (date) => {
      const count = await analyticsModel.count({
        include: [{ model: urlModel, as: 'url', where: { userId } }],
        where: {
          createdAt: {
            [Op.gte]: new Date(`${date}T00:00:00.000Z`),
            [Op.lte]: new Date(`${date}T23:59:59.999Z`),
          },
        },
      });
      return { date, count };
    }),
  );

  const osType = await analyticsModel.findAll({
    include: [{ model: urlModel, as: 'url', where: { userId } }],
    attributes: [
      'osName',
      [sequelize.fn('COUNT', sequelize.col('analytics.id')), 'uniqueClicks'],
      [sequelize.fn('COUNT', sequelize.col('ipAddress')), 'uniqueUsers'],
    ],
    group: ['osName', 'url.id'],
  });

  const deviceType = await analyticsModel.findAll({
    include: [{ model: urlModel, as: 'url', where: { userId } }],
    attributes: [
      'deviceType',
      [sequelize.fn('COUNT', sequelize.col('analytics.id')), 'uniqueClicks'],
      [sequelize.fn('COUNT', sequelize.col('ipAddress')), 'uniqueUsers'],
    ],
    group: ['deviceType', 'url.id'],
  });

  return {
    totalUrls,
    totalClicks,
    uniqueUsers,
    clicksByDate,
    osType: osType.map((os: any) => ({
      osName: os.get('osName'),
      uniqueClicks: parseInt(os.get('uniqueClicks') as string, 10),
      uniqueUsers: parseInt(os.get('uniqueUsers') as string, 10),
    })),
    deviceType: deviceType.map((device: any) => ({
      deviceName: device.get('deviceType'),
      uniqueClicks: parseInt(device.get('uniqueClicks') as string, 10),
      uniqueUsers: parseInt(device.get('uniqueUsers') as string, 10),
    })),
  };
};

export default {
  create,
  getOne,
  getAll,
  totalClicks,
  uniqueUsers,
  clickByDate,
  osTypeAnalytics,
  deviceTypeAnalytics,
  totalClicksByTopic,
  urlsByTopic,
  clicksByDateForTopic,
  uniqueUsersByTopic,
  overallAnalyticsOfUser,
};
