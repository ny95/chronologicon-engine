const { z } = require('zod');
const { isValidDate } = require('../utils/dates');

const isoDate = z.string().refine(isValidDate, 'Must be a valid ISO 8601 date');
const uuid = z.string().uuid();

const ingestBodySchema = z.object({
  filePath: z.string().min(1),
});

const jobIdParamSchema = z.object({
  jobId: z.string().min(1),
});

const rootEventParamSchema = z.object({
  rootEventId: uuid,
});

const searchQuerySchema = z.object({
  name: z.string().trim().min(1).optional(),
  start_date_after: isoDate.optional(),
  end_date_before: isoDate.optional(),
  sortBy: z.enum(['start_date', 'end_date', 'event_name', 'duration_minutes']).default('start_date'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

const dateRangeQuerySchema = z
  .object({
    startDate: isoDate,
    endDate: isoDate,
  })
  .refine((value) => new Date(value.endDate) > new Date(value.startDate), {
    message: 'endDate must be after startDate',
    path: ['endDate'],
  });

const eventInfluenceQuerySchema = z.object({
  sourceEventId: uuid,
  targetEventId: uuid,
});

module.exports = {
  dateRangeQuerySchema,
  eventInfluenceQuerySchema,
  ingestBodySchema,
  jobIdParamSchema,
  rootEventParamSchema,
  searchQuerySchema,
};
