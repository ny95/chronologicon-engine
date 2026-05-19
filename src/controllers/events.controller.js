const { enqueueIngestion, getIngestionStatus } = require('../services/ingestion.service');
const { searchEvents } = require('../services/search.service');

async function ingestEvents(req, res, next) {
  try {
    const jobId = await enqueueIngestion(req.body.filePath);
    res.status(202).json({
      status: 'Ingestion initiated',
      jobId,
      message: `Check /api/events/ingestion-status/${jobId} for updates.`,
    });
  } catch (error) {
    next(error);
  }
}

async function ingestionStatus(req, res, next) {
  try {
    res.json(await getIngestionStatus(req.params.jobId));
  } catch (error) {
    next(error);
  }
}

async function search(req, res, next) {
  try {
    res.json(await searchEvents(req.query));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  ingestionStatus,
  ingestEvents,
  search,
};
