const { HistoricalEvent } = require('./historical-event.model');
const { IngestionJob } = require('./ingestion-job.model');

HistoricalEvent.hasMany(HistoricalEvent, {
  as: 'children',
  foreignKey: 'parent_event_id',
  sourceKey: 'event_id',
});

HistoricalEvent.belongsTo(HistoricalEvent, {
  as: 'parent',
  foreignKey: 'parent_event_id',
  targetKey: 'event_id',
  constraints: false,
});

module.exports = {
  HistoricalEvent,
  IngestionJob,
};
