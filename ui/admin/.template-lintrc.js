'use strict';

module.exports = {
  extends: 'octane',
  rules: {
    'no-bare-strings': true,
    'no-curly-component-invocation': { allow: ['app-name', 'company-name', 'company-copyright'] },
    'no-implicit-this': { allow: ['app-name', 'company-name', 'company-copyright', 'doc-url'] }
  }
};
