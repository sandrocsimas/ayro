'use strict';

const settings = require('../configs/settings');
const constants = require('../utils/constants');
const {logger} = require('@ayro/commons');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const _ = require('lodash');

const {Schema} = mongoose;
const {ObjectId} = Schema.Types;

const options = settings.mongo.username && settings.mongo.password ? {
  user: settings.mongo.username,
  pass: settings.mongo.password,
  authSource: 'admin',
} : {};

mongoose.Promise = Promise;
mongoose.set('debug', settings.mongo.debug);
mongoose.connect(`mongodb://${settings.mongo.host}:${settings.mongo.port}/${settings.mongo.schema}`, options).catch((err) => {
  logger.error('Could not connect to MongoDB.', err);
  process.exit(1);
});

function transform(obj, customTransform) {
  delete obj._id;
  delete obj.__v;
  if (customTransform) {
    customTransform(obj);
  }
  return obj;
}

function normalizeSchema(schema, customTransform) {
  schema.virtual('id').set(function (id) {
    this.set('_id', id);
  });
  schema.set('toJSON', {
    virtuals: true,
    transform: (doc, obj) => {
      return transform(obj, customTransform);
    },
  });
  schema.set('toObject', {
    virtuals: true,
    transform: (doc, obj) => {
      return transform(obj, customTransform);
    },
  });
  return schema;
}

const Account = new Schema({
  name: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  logo: {type: String},
  registration_date: {type: Date, required: true},
});

const App = new Schema({
  account: {type: ObjectId, ref: 'Account', required: true, index: true},
  name: {type: String, required: true},
  icon: {type: String},
  token: {type: String, required: true},
  registration_date: {type: Date, required: true},
});
App.virtual('integrations', {
  ref: 'Integration',
  localField: '_id',
  foreignField: 'app',
});
App.virtual('plugins', {
  ref: 'Plugin',
  localField: '_id',
  foreignField: 'app',
});

const AppSecret = new Schema({
  app: {type: ObjectId, ref: 'App', required: true, index: true},
  secret: {type: String, required: true},
  registration_date: {type: Date, required: true},
}, {collection: 'app_secrets'});

const Integration = new Schema({
  app: {type: ObjectId, ref: 'App', required: true},
  type: {type: String, enum: _.values(constants.integration.types), required: true},
  channel: {type: String, enum: _.values(constants.integration.channels), required: true},
  configuration: {type: Object},
  registration_date: {type: Date, required: true},
});
Integration.index({app: 1, channel: 1}, {unique: true});
Integration.index(
  {channel: 1, 'configuration.page.id': 1},
  {unique: true, partialFilterExpression: {'configuration.page.id': {$exists: true}}},
);
Integration.index(
  {channel: 1, 'configuration.team.id': 1},
  {unique: true, partialFilterExpression: {'configuration.team.id': {$exists: true}}},
);

const Plugin = new Schema({
  app: {type: ObjectId, ref: 'App', required: true},
  type: {type: String, enum: _.values(constants.plugin.types), required: true},
  channels: {type: [String], enum: constants.integration.userChannels, default: undefined},
  configuration: {type: Object},
  registration_date: {type: Date, required: true},
});
Plugin.index({app: 1, type: 1}, {unique: true});

const User = new Schema({
  app: {type: ObjectId, ref: 'App', required: true},
  uid: {type: String, required: true},
  identified: {type: Boolean, required: true},
  first_name: {type: String},
  last_name: {type: String},
  random_name: {type: Boolean, required: true},
  email: {type: String},
  photo: {type: String},
  photo_url: {type: String},
  properties: {type: Object},
  sign_up_date: {type: Date},
  extra: {type: Object},
  transient: {type: Boolean, required: true},
  latest_channel: {type: String, enum: constants.integration.userChannels},
  registration_date: {type: Date, required: true},
});
User.index({app: 1, uid: 1}, {unique: true});
User.index(
  {'extra.slack_channel.id': 1},
  {partialFilterExpression: {'extra.slack_channel.id': {$exists: true}}},
);
User.virtual('devices', {
  ref: 'Device',
  localField: '_id',
  foreignField: 'user',
});
User.methods.getFullName = function () {
  let fullName = '';
  if (this.first_name) {
    fullName = this.first_name + (this.last_name ? ` ${this.last_name}` : '');
  } else if (this.last_name) {
    fullName = this.last_name;
  }
  return fullName;
};

const DeviceInfo = new Schema({
  // Android
  app_id: {type: String},
  app_version: {type: String},
  manufacturer: {type: String},
  model: {type: String},
  carrier: {type: String},
  // Browser
  browser_name: {type: String},
  browser_version: {type: String},
  location: {type: String},
  // Messenger
  profile_id: {type: String},
  profile_name: {type: String},
  profile_gender: {type: String},
  profile_picture: {type: String},
  profile_locale: {type: String},
  profile_timezone: {type: String},
  // Common
  operating_system: {type: String},
}, {_id: false});

const Device = new Schema({
  app: {type: ObjectId, ref: 'App', required: true, index: true},
  user: {type: ObjectId, ref: 'User', required: true},
  uid: {type: String, required: true},
  platform: {type: String, required: true},
  channel: {type: String, enum: constants.integration.userChannels, required: true},
  push_token: {type: String},
  info: {type: DeviceInfo},
  registration_date: {type: Date, required: true},
});
Device.index({user: 1, uid: 1}, {unique: true});
Device.index({user: 1, channel: 1}, {unique: true});
Device.index(
  {platform: 1, 'info.profile_id': 1},
  {partialFilterExpression: {'info.profile_id': {$exists: true}}},
);
Device.methods.getPlatformName = function () {
  const platform = constants.device.platforms[_.toUpper(this.platform)];
  return platform ? platform.name : '';
};
Device.methods.isSmartphone = function () {
  return _.includes([constants.device.platforms.ANDROID.id], this.platform);
};
Device.methods.isAndroid = function () {
  return this.platform === constants.device.platforms.ANDROID.id;
};
Device.methods.isBrowser = function () {
  return this.platform === constants.device.platforms.BROWSER.id;
};
Device.methods.isMessenger = function () {
  return this.platform === constants.device.platforms.MESSENGER.id;
};

const Agent = new Schema({
  id: {type: String},
  name: {type: String},
  photo_url: {type: String},
}, {_id: false});

const ChatMessage = new Schema({
  app: {type: ObjectId, ref: 'App', required: true, index: true},
  user: {type: ObjectId, ref: 'User', required: true},
  agent: {type: Agent, required: true},
  text: {type: String, required: true},
  direction: {type: String, enum: _.values(constants.chatMessage.directions), required: true},
  channel: {type: String, enum: constants.integration.userChannels, required: true},
  date: {type: Date, required: true},
}, {collection: 'chat_messages'});
ChatMessage.index({user: 1, channel: 1});
ChatMessage.index({date: 1}, {expireAfterSeconds: 7776000});

exports.Account = mongoose.model('Account', normalizeSchema(Account, (account) => {
  delete account.password;
}));
exports.App = mongoose.model('App', normalizeSchema(App));
exports.AppSecret = mongoose.model('AppSecret', normalizeSchema(AppSecret));
exports.Integration = mongoose.model('Integration', normalizeSchema(Integration, (integration) => {
  if (_.has(integration, 'configuration.fcm.server_key')) {
    const serverKey = integration.configuration.fcm.server_key;
    const hiddenKey = '*************';
    integration.configuration.fcm.server_key = serverKey.length > 10 ? hiddenKey + serverKey.slice(-5) : hiddenKey;
  }
}));
exports.Plugin = mongoose.model('Plugin', normalizeSchema(Plugin));
exports.User = mongoose.model('User', normalizeSchema(User));
exports.Device = mongoose.model('Device', normalizeSchema(Device));
exports.ChatMessage = mongoose.model('ChatMessage', normalizeSchema(ChatMessage));
