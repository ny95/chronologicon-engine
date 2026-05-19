const {
  findEventInfluencePath,
  findLargestTemporalGap,
  findOverlappingEvents,
} = require('../services/insights.service');

async function overlappingEvents(req, res, next) {
  try {
    res.json(await findOverlappingEvents(req.query.startDate, req.query.endDate));
  } catch (error) {
    next(error);
  }
}

async function temporalGaps(req, res, next) {
  try {
    res.json(await findLargestTemporalGap(req.query.startDate, req.query.endDate));
  } catch (error) {
    next(error);
  }
}

async function eventInfluence(req, res, next) {
  try {
    res.json(await findEventInfluencePath(req.query.sourceEventId, req.query.targetEventId));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  eventInfluence,
  overlappingEvents,
  temporalGaps,
};
