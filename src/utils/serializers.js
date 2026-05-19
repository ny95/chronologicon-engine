const { toIso } = require('./dates');

function serializeEvent(event, children = []) {
  const raw = typeof event.get === 'function' ? event.get({ plain: true }) : event;

  return {
    event_id: raw.event_id,
    event_name: raw.event_name,
    description: raw.description,
    start_date: toIso(raw.start_date),
    end_date: toIso(raw.end_date),
    duration_minutes: raw.duration_minutes,
    parent_event_id: raw.parent_event_id,
    metadata: raw.metadata,
    children,
  };
}

function serializeEventSummary(event) {
  const raw = typeof event.get === 'function' ? event.get({ plain: true }) : event;

  return {
    event_id: raw.event_id,
    event_name: raw.event_name,
    description: raw.description,
    start_date: toIso(raw.start_date),
    end_date: toIso(raw.end_date),
    duration_minutes: raw.duration_minutes,
    parent_event_id: raw.parent_event_id,
    metadata: raw.metadata,
  };
}

module.exports = {
  serializeEvent,
  serializeEventSummary,
};
