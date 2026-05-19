const { Op } = require('sequelize');
const createError = require('http-errors');
const { HistoricalEvent } = require('../models');
const { toIso } = require('../utils/dates');

function eventWindowFilter(startDate, endDate) {
  return {
    start_date: { [Op.lt]: endDate },
    end_date: { [Op.gt]: startDate },
  };
}

function eventBrief(event) {
  return {
    event_id: event.event_id,
    event_name: event.event_name,
    start_date: toIso(event.start_date),
    end_date: toIso(event.end_date),
  };
}

async function findOverlappingEvents(startDateValue, endDateValue) {
  const startDate = new Date(startDateValue);
  const endDate = new Date(endDateValue);
  const events = await HistoricalEvent.findAll({
    where: eventWindowFilter(startDate, endDate),
    order: [['start_date', 'ASC']],
  });

  const overlaps = [];

  for (let i = 0; i < events.length; i += 1) {
    for (let j = i + 1; j < events.length; j += 1) {
      const first = events[i];
      const second = events[j];

      if (new Date(second.start_date) >= new Date(first.end_date)) {
        break;
      }

      const overlapStart = Math.max(new Date(first.start_date).getTime(), new Date(second.start_date).getTime());
      const overlapEnd = Math.min(new Date(first.end_date).getTime(), new Date(second.end_date).getTime());
      const overlapDurationMinutes = Math.round((overlapEnd - overlapStart) / 60000);

      if (overlapDurationMinutes > 0) {
        overlaps.push({
          overlappingEventPairs: [eventBrief(first), eventBrief(second)],
          overlap_duration_minutes: overlapDurationMinutes,
        });
      }
    }
  }

  return overlaps;
}

async function findLargestTemporalGap(startDateValue, endDateValue) {
  const rangeStart = new Date(startDateValue);
  const rangeEnd = new Date(endDateValue);
  const events = await HistoricalEvent.findAll({
    where: eventWindowFilter(rangeStart, rangeEnd),
    order: [['start_date', 'ASC']],
  });

  if (events.length === 0) {
    return {
      largestGap: {
        startOfGap: toIso(rangeStart),
        endOfGap: toIso(rangeEnd),
        durationMinutes: Math.round((rangeEnd.getTime() - rangeStart.getTime()) / 60000),
        precedingEvent: null,
        succeedingEvent: null,
      },
      message: 'No events found; the entire requested range is a temporal gap.',
    };
  }

  let cursor = rangeStart;
  let precedingEvent = null;
  let largestGap = null;

  for (const event of events) {
    const eventStart = new Date(Math.max(new Date(event.start_date).getTime(), rangeStart.getTime()));
    const eventEnd = new Date(Math.min(new Date(event.end_date).getTime(), rangeEnd.getTime()));

    if (eventStart > cursor) {
      largestGap = chooseLargerGap(largestGap, cursor, eventStart, precedingEvent, event);
    }

    if (eventEnd > cursor) {
      cursor = eventEnd;
      precedingEvent = event;
    }
  }

  if (cursor < rangeEnd) {
    largestGap = chooseLargerGap(largestGap, cursor, rangeEnd, precedingEvent, null);
  }

  if (!largestGap || largestGap.durationMinutes <= 0) {
    return {
      largestGap: null,
      message: 'No significant temporal gaps found within the specified range, or too few events.',
    };
  }

  return {
    largestGap,
    message: 'Largest temporal gap identified.',
  };
}

function chooseLargerGap(current, start, end, precedingEvent, succeedingEvent) {
  const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
  if (durationMinutes <= 0 || (current && current.durationMinutes >= durationMinutes)) {
    return current;
  }

  return {
    startOfGap: toIso(start),
    endOfGap: toIso(end),
    durationMinutes,
    precedingEvent: precedingEvent
      ? {
          event_id: precedingEvent.event_id,
          event_name: precedingEvent.event_name,
          end_date: toIso(precedingEvent.end_date),
        }
      : null,
    succeedingEvent: succeedingEvent
      ? {
          event_id: succeedingEvent.event_id,
          event_name: succeedingEvent.event_name,
          start_date: toIso(succeedingEvent.start_date),
        }
      : null,
  };
}

async function findEventInfluencePath(sourceEventId, targetEventId) {
  const [source, target] = await Promise.all([
    HistoricalEvent.findByPk(sourceEventId),
    HistoricalEvent.findByPk(targetEventId),
  ]);

  if (!source) {
    throw createError(404, `Source event '${sourceEventId}' was not found.`);
  }

  if (!target) {
    throw createError(404, `Target event '${targetEventId}' was not found.`);
  }

  const queue = [
    {
      event: source,
      path: [source],
      totalDurationMinutes: source.duration_minutes,
    },
  ];
  const bestCosts = new Map([[source.event_id, source.duration_minutes]]);

  while (queue.length > 0) {
    queue.sort((left, right) => left.totalDurationMinutes - right.totalDurationMinutes);
    const current = queue.shift();

    if (current.event.event_id === targetEventId) {
      return {
        sourceEventId,
        targetEventId,
        shortestPath: current.path.map((event) => ({
          event_id: event.event_id,
          event_name: event.event_name,
          duration_minutes: event.duration_minutes,
        })),
        totalDurationMinutes: current.totalDurationMinutes,
        message: 'Shortest temporal path found from source to target event.',
      };
    }

    const children = await HistoricalEvent.findAll({
      where: { parent_event_id: current.event.event_id },
      order: [['duration_minutes', 'ASC']],
    });

    for (const child of children) {
      const candidateCost = current.totalDurationMinutes + child.duration_minutes;
      const bestKnownCost = bestCosts.get(child.event_id);

      if (bestKnownCost === undefined || candidateCost < bestKnownCost) {
        bestCosts.set(child.event_id, candidateCost);
        queue.push({
          event: child,
          path: [...current.path, child],
          totalDurationMinutes: candidateCost,
        });
      }
    }
  }

  return {
    sourceEventId,
    targetEventId,
    shortestPath: [],
    totalDurationMinutes: 0,
    message: 'No temporal path found from source to target event.',
  };
}

module.exports = {
  findEventInfluencePath,
  findLargestTemporalGap,
  findOverlappingEvents,
};
