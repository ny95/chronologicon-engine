const { Sequelize } = require('sequelize');
const { env } = require('../config/env');

const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'mysql',
  logging: env.db.logging ? console.log : false,
  define: {
    underscored: true,
    timestamps: true,
  },
  timezone: '+00:00',
});

module.exports = { sequelize };
