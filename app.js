const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

require('dotenv').config();
global.utils = require('./utils/global');
require('./routes')(app);

require('./utils/cron').setCron();

app.listen(process.env.PORT, process.env.HOST, () => {
  console.info(`[DNA-AuthApiServer] Listening on Port ${PORT}`);
});

module.exports = app;