'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    hinting: false,
    'ember-cli-babel': {
      includeExternalHelpers: true,
    },
    babel: {
      sourceMaps: 'inline',
    },
    sourcemaps: {
      enabled: true,
      extensions: ['js'],
    },
    sassOptions: {
      onlyIncluded: true,
      extension: 'scss',
    },
    emberNotify: {
      importCss: false,
    },
    svg: {
      paths: ['../../addons/core/public', '../../addons/rose/public'],
    },
  });

  // Only import when in development or test mode
  if (app.env.match(/(development)|(test)/i)) {
    app.import('node_modules/clipboard/dist/clipboard.js');
  } else {
    app.import('node_modules/clipboard/dist/clipboard.min.js');
  }

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  return app.toTree();
};
