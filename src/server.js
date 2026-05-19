const { env } = require('./config/env')
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
const { errorHandler, notFound } = require('./middleware/error-handler');
const { connectDB } = require('./db/connect');
require('./models');

try {
  (async () => {

    
    const app = express();
    app.use(helmet());
    app.use(cors());
    app.use(express.json({ limit: '1mb' }));
    app.use(morgan('combined'));
    
    app.get('/', (_req, res) => {
      res.redirect('/docs');
    });
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    require("./routes")(app);

    app.use(notFound);
    app.use(errorHandler);

    await connectDB();
    
    app.listen(env.port, () => {
      console.log(`Chronologicon Engine API listening on port ${env.port}`);
    });
  })();
} catch (error) {
  console.error('Failed to start API server:', error);
  process.exit(1);
}
