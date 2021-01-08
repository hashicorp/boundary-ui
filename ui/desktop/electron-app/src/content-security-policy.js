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
  csp['script-src'].push("http://localhost:7020");
  csp['connect-src'].push("ws://localhost:7020");
};

const generateCSPHeader = () => Object
  .keys(csp)
  .map(key => `${key} ${csp[key].join(' ')};`)
  .join(' ');

if (isDev) enableDevCSP();

module.exports = {
  generateCSPHeader: generateCSPHeader
};
