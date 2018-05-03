'use strict';

const {User} = require('../../models');
const errors = require('../../utils/errors');
const files = require('../../utils/files');
const hash = require('../../utils/hash');
const userQueries = require('../../utils/queries/user');
const {logger} = require('@ayro/commons');
const randomName = require('node-random-name');
const _ = require('lodash');

const UNALLOWED_ATTRS = ['_id', 'id', 'app', 'photo', 'random_name', 'registration_date'];

exports.createUser = async (app, data) => {
  if (data.identified && !data.uid) {
    throw errors.ayroError('user_uid_required', 'Uid is required');
  }
  const user = new User(_.omit(data, UNALLOWED_ATTRS));
  user.app = app.id;
  user.registration_date = new Date();
  user.random_name = false;
  if (!user.identified) {
    user.identified = false;
  }
  if (!user.uid) {
    user.uid = hash.uuid();
  }
  if (!user.first_name && !user.last_name) {
    [user.first_name, user.last_name] = _.split(randomName(), ' ');
    user.random_name = true;
  }
  try {
    user.photo = await files.downloadUserPhoto(user);
  } catch (err) {
    logger.debug('Could not download photo of user %s: %s.', user.id, err.message);
  }
  return user.save();
};

exports.updateUser = async (user, data) => {
  const loadedUser = await userQueries.getUser(user.id);
  const finalData = _.omit(data, UNALLOWED_ATTRS);
  if (finalData.first_name || finalData.last_name) {
    finalData.random_name = false;
  }
  if (finalData.photo_url && finalData.photo_url !== loadedUser.photo_url) {
    try {
      loadedUser.set(finalData);
      finalData.photo = await files.downloadUserPhoto(loadedUser);
    } catch (err) {
      logger.debug('Could not download photo of user %s: %s.', loadedUser.id, err.message);
    }
  }
  await loadedUser.update(finalData, {runValidators: true});
  loadedUser.set(finalData);
  return loadedUser;
};
