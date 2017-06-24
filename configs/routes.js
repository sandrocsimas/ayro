'use strict';

let logger = require('../utils/logger');

exports.configure = function(express, app) {

  logger.info('Configuring routes');

  require('../routes/auth')(express.Router(), app);
  require('../routes/account')(express.Router(), app);
  require('../routes/app')(express.Router(), app);
  require('../routes/user')(express.Router(), app);
  require('../routes/chat')(express.Router(), app);

};