const { Op } = require('sequelize');
const { HistoricalEvent } = require('../models');
const { serializeEventSummary } = require('../utils/serializers');

async function searchEvents(query) {
  const where = {};

  if (query.name) {
    where.event_name = { [Op.like]: `%${query.name}%` };
  }

  if (query.start_date_after) {
    where.start_date = { [Op.gt]: new Date(query.start_date_after) };
  }

  if (query.end_date_before) {
    where.end_date = { [Op.lt]: new Date(query.end_date_before) };
  }

  const offset = (query.page - 1) * query.limit;
  const result = await HistoricalEvent.findAndCountAll({
    where,
    order: [[query.sortBy, query.sortOrder.toUpperCase()]],
    limit: query.limit,
    offset,
  });

  return {
    totalEvents: result.count,
    page: query.page,
    limit: query.limit,
    events: result.rows.map(serializeEventSummary),
  };
}

module.exports = { searchEvents };
