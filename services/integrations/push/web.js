const settings = require('../../../configs/settings');
const axios = require('axios');

const webcmClient = axios.create({
  baseURL: settings.webcmUrl,
});

exports.push = async (configuration, user, device, event, message) => {
  await webcmClient.post(`/push/${user.id}`, {event, message});
};
