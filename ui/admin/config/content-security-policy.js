'use strict';

module.exports = function (env) {
  // some defaults
  let policy = {
    // Deny everything by default
    'default-src': ["'none'"],
    'script-src': ["'self'"],
    'font-src': ["'self'"],
    'connect-src': ["'self'"],
    'img-src': ["'self'"],
    'style-src': ["'self'"],
    'media-src': ["'self'"],
  };

  return {
    delivery: ['header'],
    enabled: env !== 'test',
    failTests: true,
    policy,
    reportOnly: true,
  };
};
