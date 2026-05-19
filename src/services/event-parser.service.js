const { z } = require('zod');
const { durationMinutes, parseDate } = require('../utils/dates');

const uuidSchema = z.string().uuid();

function parseEventLine(line, lineNumber, sourceFileName) {
  const parts = line.split('|');

  if (parts.length !== 6) {
    return {
      ok: false,
      error: `Line ${lineNumber}: Malformed entry: '${line}'`,
    };
  }

  const [eventId, eventName, startDateValue, endDateValue, parentIdValue, description] = parts.map((part) =>
    part.trim(),
  );

  if (!uuidSchema.safeParse(eventId).success) {
    return { ok: false, error: `Line ${lineNumber}: Invalid UUID for event_id: '${eventId}'` };
  }

  if (!eventName) {
    return { ok: false, error: `Line ${lineNumber}: event_name is required for event '${eventId}'` };
  }

  const startDate = parseDate(startDateValue);
  if (!startDate) {
    return { ok: false, error: `Line ${lineNumber}: Invalid start_date for event '${eventId}': '${startDateValue}'` };
  }

  const endDate = parseDate(endDateValue);
  if (!endDate) {
    return { ok: false, error: `Line ${lineNumber}: Invalid end_date for event '${eventId}': '${endDateValue}'` };
  }

  if (endDate <= startDate) {
    return { ok: false, error: `Line ${lineNumber}: end_date must be after start_date for event '${eventId}'` };
  }

  const parentEventId = parentIdValue.toUpperCase() === 'NULL' || parentIdValue === '' ? null : parentIdValue;
  if (parentEventId && !uuidSchema.safeParse(parentEventId).success) {
    return { ok: false, error: `Line ${lineNumber}: Invalid parent_event_id for event '${eventId}': '${parentIdValue}'` };
  }

  return {
    ok: true,
    event: {
      event_id: eventId,
      event_name: eventName,
      description: description || null,
      start_date: startDate,
      end_date: endDate,
      duration_minutes: durationMinutes(startDate, endDate),
      parent_event_id: parentEventId,
      metadata: {
        sourceFileName,
        lineNumber,
      },
    },
  };
}

module.exports = { parseEventLine };
