'use strict';

const types = Object.freeze({
  USER: 'user',
  BUSINESS: 'business',
});
const channels = Object.freeze({
  WEBSITE: 'website',
  WORDPRESS: 'wordpress',
  ANDROID: 'android',
  MESSENGER: 'messenger',
  SLACK: 'slack',
});
const userChannels = [channels.WEBSITE, channels.WORDPRESS, channels.ANDROID, channels.MESSENGER];
const businessChannels = [channels.SLACK];

module.exports = Object.freeze({
  integration: Object.freeze({
    types,
    channels,
    userChannels,
    businessChannels,
  }),
  plugin: Object.freeze({
    types: Object.freeze({
      GREETINGS_MESSAGE: 'greetings_message',
      OFFICE_HOURS: 'office_hours',
    }),
  }),
  device: Object.freeze({
    platforms: Object.freeze({
      BROWSER: Object.freeze({
        id: 'browser',
        name: 'Browser',
      }),
      ANDROID: Object.freeze({
        id: 'android',
        name: 'Android',
      }),
      MESSENGER: Object.freeze({
        id: 'messenger',
        name: 'Facebook Messenger',
      }),
    }),
  }),
  chatMessage: Object.freeze({
    directions: Object.freeze({
      INCOMING: 'incoming',
      OUTGOING: 'outgoing',
    }),
  }),
  genders: Object.freeze({
    MALE: 'Masculino',
    FEMALE: 'Feminino',
  }),
});
