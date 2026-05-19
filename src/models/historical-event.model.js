const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/sequelize');

const HistoricalEvent = sequelize.define(
  'HistoricalEvent',
  {
    event_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    event_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATE(3),
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE(3),
      allowNull: false,
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    parent_event_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    tableName: 'historical_events',
    indexes: [
      { fields: ['start_date'] },
      { fields: ['end_date'] },
      { fields: ['parent_event_id'] },
      { fields: ['event_name'] },
    ],
  },
);

module.exports = { HistoricalEvent };
