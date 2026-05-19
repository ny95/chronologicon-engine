# Chronologicon Engine

Node.js backend project:
1) It ingests historical event dump files asynchronously,
2) stores events in MySQL through Sequelize,
3) exposes APIs of timeline/search/insight.

## Tech Stack

- Node.js + Express
- MySQL + Sequelize
- BullMQ + Redis worker queue for ingestion jobs
- Zod request validation

## Project Structure

```text
src/
  controllers/   HTTP handlers
  models/        Sequelize models
  routes/        Express route modules
  services/      ingestion, search, timeline, and insights logic
  queues/        BullMQ and Redis setup
  validators/    Zod schemas
schema/          MySQL DDL
data/            sample_historical_data.txt
```


## Local Setup

```bash
npm install
cp sample.env .env
npm run db:sync
npm run dev
npm run dev:worker
```

- The API listens on `http://localhost:3000`.
- The worker runs as a separate service and consumes ingestion jobs from Redis.

- API documentation `http://localhost:3000/docs`.

## Ingestion Format

Each line must use:

```text
EVENT_ID|EVENT_NAME|START_DATE_ISO|END_DATE_ISO|PARENT_ID|DESCRIPTION
```
Only valid(as per above formate) events are upserted.


# chronologicon-engine
