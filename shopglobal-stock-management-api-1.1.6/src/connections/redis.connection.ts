import { REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD } from '@config';
import { createClient, RedisClientType } from 'redis';

const redisConnection = (): RedisClientType =>
  createClient({
    url: `redis://${REDIS_USERNAME}:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`,
  });

export default redisConnection;
