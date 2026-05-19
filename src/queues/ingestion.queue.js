const { Queue } = require('bullmq');
const { env } = require('../config/env');
const { createRedisConnection } = require('./connection');

const ingestionQueue = new Queue(env.queues.ingestion, {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 100 },
  },
});

module.exports = { ingestionQueue };
