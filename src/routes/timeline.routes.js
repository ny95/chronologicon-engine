const { timeline } = require('../controllers/timeline.controller');
const { validate } = require('../middleware/validate');
const { rootEventParamSchema } = require('../validators/event.validators');

module.exports = app => {
  app.get('/api/timeline/:rootEventId', validate(rootEventParamSchema, 'params'), timeline);
}
