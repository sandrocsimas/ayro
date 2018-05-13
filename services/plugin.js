'use strict';

const {App, Plugin} = require('../models');
const settings = require('../configs/settings');
const constants = require('../utils/constants');
const errors = require('../utils/errors');
const appQueries = require('../utils/queries/app');
const pluginQueries = require('../utils/queries/plugin');
const userQueries = require('../utils/queries/user');
const chatCommons = require('./commons/chat');
const {logger} = require('@ayro/commons');
const Promise = require('bluebird');
const moment = require('moment');
const _ = require('lodash');

const SEND_MESSAGE_DELAY_SMALL = 2000;
const SEND_MESSAGE_DELAY = 4000;

const CONFIG_OFFICE_HOURS = ['timezone', 'time_range', 'time_range.sunday', 'time_range.monday', 'time_range.tuesday', 'time_range.wednesday', 'time_range.thursday', 'time_range.friday', 'time_range.saturday', 'reply'];
const CONFIG_GREETINGS_MESSAGE = ['message'];

function fixTimezone(timezone) {
  if (timezone === 'UTC') {
    return 'UTC+00:00';
  }
  return timezone;
}

async function executeGreetingsMessagePlugin(plugin, user, channel) {
  const app = await appQueries.getApp(user.app);
  const agent = {
    id: '0',
    name: app.name,
    photo_url: `${settings.publicUrl}/apps/${app.id}/icon`,
  };
  await Promise.delay(SEND_MESSAGE_DELAY_SMALL);
  await chatCommons.pushMessage(agent, user, plugin.configuration.message, channel);
}

async function executeOfficeHoursPlugin(plugin, user) {
  const now = moment();
  const lastCheck = _.get(user, 'extra.plugins.office_hours.last_check');
  if (lastCheck && moment(lastCheck).dayOfYear() === now.dayOfYear()) {
    return;
  }
  const timezone = fixTimezone(plugin.configuration.timezone);
  now.utcOffset(timezone);
  const day = _.lowerCase(now.format('dddd'));
  const timeRange = plugin.configuration.time_range[day];
  if (!timeRange) {
    return;
  }
  const startTime = moment().utcOffset(timezone);
  const [startHour, startMinute] = timeRange.start.split(':');
  startTime.set({hours: startHour, minutes: startMinute, seconds: 0});
  const endTime = moment().utcOffset(timezone);
  const [endHour, endMinute] = timeRange.end.split(':');
  endTime.set({hours: endHour, minutes: endMinute, seconds: 59});
  if (now.isBefore(startTime) || now.isAfter(endTime)) {
    const app = await appQueries.getApp(user.app);
    const agent = {
      id: '0',
      name: app.name,
      photo_url: `${settings.publicUrl}/apps/${app.id}/icon`,
    };
    await Promise.delay(SEND_MESSAGE_DELAY);
    await chatCommons.pushMessage(agent, user, plugin.configuration.reply);
  }
  await user.update({'extra.plugins.office_hours.last_check': moment().valueOf()});
}

async function executeConnectChannelPlugin(user) {
  if (_.get(user, 'extra.metrics.messages_posted') === 1) {
    const channels = ['email'];
    await Promise.delay(SEND_MESSAGE_DELAY_SMALL);
    await chatCommons.pushLinkChannelMessage(user, channels);
  }
}

async function addPlugin(app, type, configuration) {
  let plugin = await pluginQueries.getPlugin(app, type, {require: false});
  if (plugin) {
    throw errors.ayroError('plugin_already_exists', 'Plugin already exists');
  }
  plugin = new Plugin({
    type,
    configuration,
    app: app.id,
    registration_date: new Date(),
  });
  return plugin.save();
}

async function updatePlugin(app, type, configuration) {
  const plugin = await pluginQueries.getPlugin(app, type);
  await plugin.update({configuration}, {runValidators: true});
  plugin.configuration = configuration;
  return plugin;
}

exports.getPlugin = async (app, type, options) => {
  return pluginQueries.getPlugin(app, type, options);
};

exports.addOfficeHoursPlugin = async (app, configuration) => {
  return addPlugin(app, constants.plugin.types.OFFICE_HOURS, _.pick(configuration, CONFIG_OFFICE_HOURS));
};

exports.updateOfficeHoursPlugin = async (app, configuration) => {
  return updatePlugin(app, constants.plugin.types.OFFICE_HOURS, _.pick(configuration, CONFIG_OFFICE_HOURS));
};

exports.addGreetingsMessagePlugin = async (app, configuration) => {
  return addPlugin(app, constants.plugin.types.GREETINGS_MESSAGE, _.pick(configuration, CONFIG_GREETINGS_MESSAGE));
};

exports.updateGreetingsMessagePlugin = async (app, configuration) => {
  return updatePlugin(app, constants.plugin.types.GREETINGS_MESSAGE, _.pick(configuration, CONFIG_GREETINGS_MESSAGE));
};

exports.removePlugin = async (app, type) => {
  const plugin = await pluginQueries.getPlugin(app, type);
  await plugin.remove();
};

exports.chatViewed = async (user, channel) => {
  try {
    const loadedUser = await userQueries.getUser(user.id);
    if (_.get(loadedUser, 'extra.metrics.chat_views') === 1) {
      const app = new App({id: loadedUser.app});
      const greetingsMessagePlugin = await pluginQueries.getPlugin(app, constants.plugin.types.GREETINGS_MESSAGE, {require: false});
      if (greetingsMessagePlugin) {
        await executeGreetingsMessagePlugin(greetingsMessagePlugin, loadedUser, channel);
      }
    }
  } catch (err) {
    logger.warn('Could not process "chatViewed" trigger', err);
  }
};

exports.messagePosted = async (user) => {
  try {
    const loadedUser = await userQueries.getUser(user.id);
    const app = new App({id: loadedUser.app});
    const officeHoursPlugin = await pluginQueries.getPlugin(app, constants.plugin.types.OFFICE_HOURS, {require: false});
    if (officeHoursPlugin) {
      await executeOfficeHoursPlugin(officeHoursPlugin, loadedUser);
    }
    await executeConnectChannelPlugin(loadedUser);
  } catch (err) {
    logger.warn('Could not process "messagePosted" trigger', err);
  }
};
