const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/sequelize');

const IngestionJob = sequelize.define(
  'IngestionJob',
  {
    job_id: {
      type: DataTypes.STRING(128),
      primaryKey: true,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'),
      allowNull: false,
      defaultValue: 'QUEUED',
    },
    file_path: {
      type: DataTypes.STRING(2048),
      allowNull: false,
    },
    processed_lines: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    error_lines: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_lines: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    errors: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    start_time: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
    end_time: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
    failure_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'ingestion_jobs',
  },
);

module.exports = { IngestionJob };
