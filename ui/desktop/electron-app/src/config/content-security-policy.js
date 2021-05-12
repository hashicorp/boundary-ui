const origin = require('../origin/index.js');
const isDev = require('electron-is-dev');

const csp = {
  'default-src': ["'none'"],
  'script-src': ["'self'"],
  'frame-src': ["'self'"],
  'font-src': ["'self'"],
  'connect-src': ["'self'"],
  'img-src': ["'self'", 'data:'],
  'style-src': ["'self'"],
  'media-src': ["'self'"],
  'manifest-src': ["'self'"],
};

// Dev policy is necessary for Ember live reload.
// Unsafe policy is necessary in development and test environments, but should
// not be used in production.
const enableDevCSP = () => {
  csp['style-src'].push("'unsafe-inline'");
  csp['script-src'].push("'unsafe-eval'");
  csp['script-src'].push("'unsafe-inline'");
  csp['script-src'].push('http://localhost:7020');
  csp['connect-src'].push('ws://localhost:7020');
};

const generateCSPHeader = () => {
  const policy = Object.assign({}, csp);

  // If an origin is specified, add it to the connect-src directive
  if (origin.origin) {
    policy['connect-src'] = policy['connect-src'].slice();
    policy['connect-src'].push(origin.origin);
  }

  return Object.keys(policy)
    .map((key) => `${key} ${policy[key].join(' ')};`)
    .join(' ');
};

if (isDev) enableDevCSP();

module.exports = {
  generateCSPHeader: generateCSPHeader,
};
