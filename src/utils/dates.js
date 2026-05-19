function isValidDate(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime());
}

function parseDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return null;
  }
  return date;
}

function durationMinutes(startDate, endDate) {
  return Math.ceil((endDate.getTime() - startDate.getTime()) / 60000);
}

function toIso(value) {
  return value ? new Date(value).toISOString() : null;
}

module.exports = {
  durationMinutes,
  isValidDate,
  parseDate,
  toIso,
};
