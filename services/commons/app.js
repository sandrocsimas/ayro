const {App} = require('../../models');
const errors = require('../../utils/errors');
const queries = require('../../utils/queries');
const Promise = require('bluebird');

function throwAppNotFoundIfNeeded(app, options) {
  if (!app && (!options || options.require)) {
    throw errors.notFoundError('app.doesNotExist', 'App does not exist');
  }
}

exports.getApp = (id, options) => {
  return Promise.coroutine(function* () {
    const promise = App.findById(id);
    queries.fillQuery(promise, options);
    const app = yield promise.exec();
    throwAppNotFoundIfNeeded(app, options);
    return app;
  })();
};

exports.findApp = (query, options) => {
  return Promise.coroutine(function* () {
    const promise = App.findOne(query);
    queries.fillQuery(promise, options);
    const app = yield promise.exec();
    throwAppNotFoundIfNeeded(app, options);
    return app;
  })();
};

exports.findApps = (query, options) => {
  return Promise.resolve().then(() => {
    const promise = App.find(query);
    queries.fillQuery(promise, options);
    return promise.exec();
  });
};
