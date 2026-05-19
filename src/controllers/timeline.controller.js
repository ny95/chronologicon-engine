const { getTimeline } = require('../services/timeline.service');

async function timeline(req, res, next) {
  try {
    res.json(await getTimeline(req.params.rootEventId));
  } catch (error) {
    next(error);
  }
}

module.exports = { timeline };
