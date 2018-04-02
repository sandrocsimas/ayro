const constants = require('../../utils/constants');
const integrationCommons = require('../commons/integration');
const _ = require('lodash');

const CONFIG_WORDPRESS = ['primary_color', 'conversation_color'];
const DEFAULT_PRIMARY_COLOR = '#5c7382';
const DEFAULT_CONVERSATION_COLOR = '#007bff';

exports.addIntegration = (app) => {
  return Promise.resolve().then(() => {
    const configuration = {
      primary_color: DEFAULT_PRIMARY_COLOR,
      conversation_color: DEFAULT_CONVERSATION_COLOR,
    };
    return integrationCommons.addIntegration(app, constants.integration.channels.WORDPRESS, constants.integration.types.USER, _.pick(configuration, CONFIG_WORDPRESS));
  });
};

exports.updateIntegration = (app, configuration) => {
  return integrationCommons.updateIntegration(app, constants.integration.channels.WORDPRESS, _.pick(configuration, CONFIG_WORDPRESS));
};

exports.removeIntegration = (app) => {
  return integrationCommons.removeIntegration(app, constants.integration.channels.WORDPRESS);
};