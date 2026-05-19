const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Chronologicon Engine API',
    description: 'Node.js backend project: It ingests historical event dump files asynchronously, stores events in MySQL through Sequelize, exposes APIs of timeline/search/insight.'
  },
  host: 'localhost:'+(process.env.PORT || 3000)
};

const outputFile = './swagger.json';
const routes = ["./src/routes/index.js"];

swaggerAutogen(outputFile, routes, doc);