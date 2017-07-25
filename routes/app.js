const App = require('../models').App;
const appService = require('../services/app');
const isAccountAuthenticated = require('../utils/middlewares').isAccountAuthenticated;
const constants = require('../utils/constants');
const logger = require('../utils/logger');
const errors = require('../utils/errors');

module.exports = (router, app) => {

  function createApp(req, res) {
    appService.createApp(req.account, req.body.name).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function listApps(req, res) {
    appService.listApps(req.account).then((apps) => {
      res.json(apps);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function getApp(req, res) {
    appService.getApp(req.params.app).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function deleteApp(req, res) {
    const app = new App({id: req.params.app});
    appService.deleteApp(req.account, app).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function initWebIntegration(req, res) {
    appService.getAppByToken(req.body.app_token).then((app) => {
      if (!app.getIntegration(constants.integration.channels.WEB)) {
        return appService.addWebIntegration(app, {});
      }
      return app;
    }).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function updateWebIntegration(req, res) {
    const app = new App({id: req.params.app});
    appService.updateWebIntegration(app, req.body).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function removeWebIntegration(req, res) {
    const app = new App({id: req.params.app});
    appService.removeWebIntegration(app).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function initAndroidIntegration(req, res) {
    appService.getAppByToken(req.body.app_token).then((app) => {
      if (!app.getIntegration(constants.integration.channels.WEB)) {
        return appService.addAndroidIntegration(app, {});
      }
      return app;
    }).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function updateAndroidIntegration(req, res) {
    const app = new App({id: req.params.app});
    appService.updateAndroidIntegration(app, req.body).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function removeAndroidIntegration(req, res) {
    const app = new App({id: req.params.app});
    appService.removeAndroidIntegration(app).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function initIOSIntegration(req, res) {
    appService.getAppByToken(req.body.app_token).then((app) => {
      if (!app.getIntegration(constants.integration.channels.WEB)) {
        return appService.addIOSIntegration(app, {});
      }
      return app;
    }).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function updateIOSIntegration(req, res) {
    const app = new App({id: req.params.app});
    appService.updateIOSIntegration(app, req.body).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function removeIOSIntegration(req, res) {
    const app = new App({id: req.params.app});
    appService.removeIOSIntegration(app).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function addSlackIntegration(req, res) {
    const app = new App({id: req.params.app});
    appService.addSlackIntegration(app, req.body.api_token).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function updateSlackIntegration(req, res) {
    const app = new App({id: req.params.app});
    appService.updateSlackIntegration(app, req.body).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function removeSlackIntegration(req, res) {
    const app = new App({id: req.params.app});
    appService.removeSlackIntegration(app).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function listSlackChannels(req, res) {
    const app = new App({id: req.params.app});
    appService.listSlackChannels(app).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  function createSlackChannel(req, res) {
    const app = new App({id: req.params.app});
    appService.createSlackChannel(app, req.body.channel).then((app) => {
      res.json(app);
    }).catch((err) => {
      logger.error(err);
      errors.respondWithError(res, err);
    });
  }

  router.post('/', isAccountAuthenticated, createApp);
  router.get('/', isAccountAuthenticated, listApps);
  router.get('/:app', isAccountAuthenticated, getApp);
  router.delete('/:app', isAccountAuthenticated, deleteApp);

  router.post('/integrations/web/init', isAccountAuthenticated, initWebIntegration);
  router.put('/:app/integrations/web', isAccountAuthenticated, updateWebIntegration);
  router.delete('/:app/integrations/web', isAccountAuthenticated, removeWebIntegration);

  router.post('/integrations/android/init', isAccountAuthenticated, initAndroidIntegration);
  router.put('/:app/integrations/android', isAccountAuthenticated, updateAndroidIntegration);
  router.delete('/:app/integrations/android', isAccountAuthenticated, removeAndroidIntegration);

  router.post('/integrations/ios/init', isAccountAuthenticated, initIOSIntegration);
  router.put('/:app/integrations/ios', isAccountAuthenticated, updateIOSIntegration);
  router.delete('/:app/integrations/ios', isAccountAuthenticated, removeIOSIntegration);

  router.post('/:app/integrations/slack', isAccountAuthenticated, addSlackIntegration);
  router.put('/:app/integrations/slack', isAccountAuthenticated, updateSlackIntegration);
  router.delete('/:app/integrations/slack', isAccountAuthenticated, removeSlackIntegration);
  router.get('/:app/integrations/slack/channels', isAccountAuthenticated, listSlackChannels);
  router.post('/:app/integrations/slack/channels', isAccountAuthenticated, createSlackChannel);

  app.use('/apps', router);

};
