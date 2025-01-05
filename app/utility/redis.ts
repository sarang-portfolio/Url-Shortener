import { createClient } from 'redis';
import logger from './logger';

const { REDIS_HOST } = process.env;

const redisClient = createClient({
  url: REDIS_HOST,
  socket: {
    reconnectStrategy(retries, cause: any) {
      if (retries > 10) {
        logger.error('Max retries reached. Error:', cause);
        return new Error('Max retries reached');
      }
      if (cause && cause.code === 'ECONNREFUSED') {
        logger.warn('Connection refused. Retrying...');
        return Math.min(retries * 1000, 3000); // Retry with increasing delay
      }
      // Default exponential backoff with jitter
      const jitter = Math.floor(Math.random() * 200);
      const delay = Math.min(Math.pow(2, retries) * 50, 2000);
      return delay + jitter;
    },
    connectTimeout: 10000, // 10 seconds
    keepAlive: 10000, // 10 seconds
  },
});

redisClient.on('error', (err) => {
  logger.error('Redis Error: ', err);
});

redisClient.on('connect', (err) => {
  logger.info('CONNECTED TO REDIS SERVER');
});

redisClient.on('reconnecting', (delay) => {
  logger.info(`Reconnecting to Redis in ${delay}ms`);
});

redisClient.on('end', () => {
  logger.info('Disconnected from Redis');
});

redisClient.on('ready', () => {
  logger.info('Redis client is ready');
});

redisClient.on('monitor', (time, args, source, database) => {
  logger.debug(`Redis monitor: ${time} ${args} ${source} ${database}`);
});

export default redisClient;
