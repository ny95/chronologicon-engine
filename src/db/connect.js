const { sequelize } = require('./sequelize');
const { delay } = require('../utils/comman');

async function connectDB({ retryCnt = 5, delayMs = 2000 } = {}) {
  let _error;
  for(let retry = 1; retry <= retryCnt; retry++) {
    try {
      await sequelize.authenticate();
      await sequelize.sync();
      return;
    } catch (error) {
      _error = error;
      console.log(`Trying to connect DB with ${retry} of ${retryCnt}, error connecting: ${error.message}`);
      await delay(delayMs);
    }
  }
  throw _error;
}

module.exports = { connectDB };
