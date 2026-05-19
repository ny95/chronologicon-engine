const createError = require('http-errors');
const { HistoricalEvent } = require('../models');
const { serializeEvent } = require('../utils/serializers');

async function getTimeline(rootEventId) {
  const root = await HistoricalEvent.findByPk(rootEventId);
  if (!root) {
    throw createError(404, `Event '${rootEventId}' was not found.`);
  }

  const visited = new Set();
  return buildTree(root, visited);
}

async function buildTree(event, visited) {
  if (visited.has(event.event_id)) {
    return serializeEvent(event, []);
  }

  visited.add(event.event_id);

  const children = await HistoricalEvent.findAll({
    where: { parent_event_id: event.event_id },
    order: [
      ['start_date', 'ASC'],
      ['event_name', 'ASC'],
    ],
  });

  const serializedChildren = [];
  for (const child of children) {
    serializedChildren.push(await buildTree(child, visited));
  }

  return serializeEvent(event, serializedChildren);
}

module.exports = { getTimeline };
