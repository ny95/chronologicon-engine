const { sequelize } = require('./sequelize');
require('../models');

async function syncDatabase() {
  await sequelize.authenticate();
  await sequelize.sync();
  console.log('Database schema synchronized.');
}

if (require.main === module) {
  syncDatabase()
    .then(() => sequelize.close())
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { syncDatabase };
