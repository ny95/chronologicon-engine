const { ingestionStatus, ingestEvents, search } = require('../controllers/events.controller');
const { validate } = require('../middleware/validate');
const { ingestBodySchema, jobIdParamSchema, searchQuerySchema } = require('../validators/event.validators');

module.exports = app => {  
  app.post('/api/events/ingest', validate(ingestBodySchema), ingestEvents);
  app.get('/api/events/ingestion-status/:jobId', validate(jobIdParamSchema, 'params'), ingestionStatus);
  app.get('/api/events/search', validate(searchQuerySchema, 'query'), search);
}
