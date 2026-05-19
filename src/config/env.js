require('dotenv').config({ quiet: true });

const env = {
  nodeEnv: process.env.NODE_ENV || 'DEV',
  port: Number(process.env.PORT || 3000),
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    name: process.env.DB_NAME || 'chronologicon',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    logging: process.env.DB_LOGGING === 'true',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT || 6379),
  },
  queues: {
    ingestion: process.env.INGESTION_QUEUE_NAME || 'eventIngestion',
  },
};

module.exports = { env };
