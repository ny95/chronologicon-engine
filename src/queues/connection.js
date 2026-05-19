const IORedis = require('ioredis');
const { env } = require('../config/env');

function createRedisConnection() {
  return new IORedis({
    host: env.redis.host,
    port: env.redis.port,
    maxRetriesPerRequest: null,
  });
}

module.exports = { createRedisConnection };
