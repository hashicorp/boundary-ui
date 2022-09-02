'use strict';

module.exports = {
  extends: ['recommended', 'stylistic'],
  rules: {
    'no-passed-in-event-handlers': false,
    'no-bare-strings': true,
    'no-curly-component-invocation': { allow: ['app-name'] },
    'no-implicit-this': { allow: ['app-name', 'is-loading'] },
    quotes: 'single',
    'self-closing-void-elements': false,
    'block-indentation': false,
  },
};
