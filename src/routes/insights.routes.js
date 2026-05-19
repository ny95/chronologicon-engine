const {
  eventInfluence,
  overlappingEvents,
  temporalGaps,
} = require('../controllers/insights.controller');
const { validate } = require('../middleware/validate');
const { dateRangeQuerySchema, eventInfluenceQuerySchema } = require('../validators/event.validators');

module.exports = app => {
  app.get('/api/insights/overlapping-events', validate(dateRangeQuerySchema, 'query'), overlappingEvents);
  app.get('/api/insights/temporal-gaps', validate(dateRangeQuerySchema, 'query'), temporalGaps);
  app.get('/api/insights/event-influence', validate(eventInfluenceQuerySchema, 'query'), eventInfluence);
}
