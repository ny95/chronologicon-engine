const { Worker } = require('bullmq');
const { env } = require('./config/env');
const { connectDB } = require('./db/connect');
const { createRedisConnection } = require('./queues/connection');
const { processIngestionJob } = require('./services/ingestion.service');
require('./models');

try {
  (async () => {
    await connectDB();
  
    const worker = new Worker(env.queues.ingestion, processIngestionJob, {
      connection: createRedisConnection(),
      concurrency: 2,
    });
    
    worker.on('completed', (job) => {
      console.log(`Ingestion job ${job.id} completed.`);
    });
    
    worker.on('failed', (job, error) => {
      console.error(`Ingestion job ${job && job.id} failed:`, error);
    });
    
    console.log(`Ingestion worker listening on queue '${env.queues.ingestion}'.`);
  })();
} catch (error) {
  console.error('Failed to start worker:', error);
  process.exit(1);
}
