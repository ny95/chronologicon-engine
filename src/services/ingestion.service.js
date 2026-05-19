const fs = require('fs');
const path = require('path');
const readline = require('readline');
const createError = require('http-errors');
const { Op } = require('sequelize');
const { HistoricalEvent, IngestionJob } = require('../models');
const { ingestionQueue } = require('../queues/ingestion.queue');
const { parseEventLine } = require('./event-parser.service');
const { toIso } = require('../utils/dates');

const ERROR_PREVIEW_LIMIT = 100;

async function enqueueIngestion(filePath) {
  if (!fs.existsSync(filePath)) {
    throw createError(400, `File not found: ${filePath}`);
  }

  const job = await ingestionQueue.add('ingest-events', { filePath });

  await IngestionJob.create({
    job_id: job.id,
    status: 'QUEUED',
    file_path: filePath,
  });

  return job.id;
}

async function getIngestionStatus(jobId) {
  const job = await IngestionJob.findByPk(jobId);
  if (!job) {
    throw createError(404, `Ingestion job '${jobId}' was not found.`);
  }

  const raw = job.get({ plain: true });
  return {
    jobId: raw.job_id,
    status: raw.status,
    processedLines: raw.processed_lines,
    errorLines: raw.error_lines,
    totalLines: raw.total_lines,
    errors: raw.errors || [],
    startTime: toIso(raw.start_time),
    endTime: toIso(raw.end_time),
    failureReason: raw.failure_reason,
  };
}

async function processIngestionJob(job) {
  const { filePath } = job.data;
  const sourceFileName = path.basename(filePath);
  const statusPatch = {
    status: 'PROCESSING',
    start_time: new Date(),
    failure_reason: null,
  };

  await IngestionJob.update(statusPatch, { where: { job_id: job.id } });

  let totalLines = 0;
  let processedLines = 0;
  let errorLines = 0;
  const errors = [];
  const pendingParentIds = new Set();

  try {
    const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const reader = readline.createInterface({ input: stream, crlfDelay: Infinity });

    for await (const line of reader) {
      totalLines += 1;
      const trimmedLine = line.trim();

      if (!trimmedLine) {
        continue;
      }

      const parsed = parseEventLine(trimmedLine, totalLines, sourceFileName);
      if (!parsed.ok) {
        errorLines += 1;
        if (errors.length < ERROR_PREVIEW_LIMIT) {
          errors.push(parsed.error);
        }
        continue;
      }

      if (parsed.event.parent_event_id) {
        pendingParentIds.add(parsed.event.parent_event_id);
      }

      await HistoricalEvent.upsert(parsed.event);
      processedLines += 1;

      if (totalLines % 100 === 0) {
        await persistProgress(job.id, { processedLines, errorLines, totalLines, errors });
        await job.updateProgress({ processedLines, errorLines, totalLines });
      }
    }

    await flagMissingParents(pendingParentIds, errors);

    await IngestionJob.update(
      {
        status: 'COMPLETED',
        processed_lines: processedLines,
        error_lines: errorLines,
        total_lines: totalLines,
        errors,
        end_time: new Date(),
      },
      { where: { job_id: job.id } },
    );

    return { processedLines, errorLines, totalLines };
  } catch (error) {
    await IngestionJob.update(
      {
        status: 'FAILED',
        processed_lines: processedLines,
        error_lines: errorLines,
        total_lines: totalLines,
        errors,
        end_time: new Date(),
        failure_reason: error.message,
      },
      { where: { job_id: job.id } },
    );
    throw error;
  }
}

async function persistProgress(jobId, progress) {
  await IngestionJob.update(
    {
      processed_lines: progress.processedLines,
      error_lines: progress.errorLines,
      total_lines: progress.totalLines,
      errors: progress.errors,
    },
    { where: { job_id: jobId } },
  );
}

async function flagMissingParents(parentIds, errors) {
  if (parentIds.size === 0) {
    return;
  }

  const parents = await HistoricalEvent.findAll({
    attributes: ['event_id'],
    where: { event_id: { [Op.in]: [...parentIds] } },
  });
  const existing = new Set(parents.map((parent) => parent.event_id));

  for (const parentId of parentIds) {
    if (!existing.has(parentId) && errors.length < ERROR_PREVIEW_LIMIT) {
      errors.push(`Parent event '${parentId}' was referenced but not found in the ingested dataset.`);
    }
  }
}

module.exports = {
  enqueueIngestion,
  getIngestionStatus,
  processIngestionJob,
};
