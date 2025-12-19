const express = require('express');
const expressLoader = require('./loaders/express.loader');

const app = express();

// Load express middlewares and routes
expressLoader(app);

module.exports = app;
