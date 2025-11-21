/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = async function (defaults) {
  const { setConfig } = await import('@warp-drive/build-config');
  const { EMBER_ENV } = process.env;
  var config = require('./config/environment')(EMBER_ENV);
  const exclude = [
    ...(!config.mirage?.enabled ? ['miragejs', '@faker-js/faker'] : []),
  ];

  console.log({ exclude });

  const app = new EmberApp(defaults, {
    hinting: false,
    autoImport: { exclude },
    'ember-simple-auth': {
      useSessionSetupMethod: true,
    },
    babel: {
      sourceMaps: 'inline',
      plugins: [
        require.resolve('ember-concurrency/async-arrow-task-transform'),
      ],
    },
    sourcemaps: {
      enabled: true,
      extensions: ['js'],
    },
    svg: {
      paths: ['../../addons/core/public'],
    },
    api: {
      enableSqlite: true,
    },
  });

  // TODO: The deprecations object can be removed in ember-data 6.0.
  // This silences ember-data deprecate warnings by setting to false to
  // strip the deprecated code (thereby opting into the new behavior).
  setConfig(app, __dirname, {
    deprecations: {
      DEPRECATE_STORE_EXTENDS_EMBER_OBJECT: false,
      DEPRECATE_RELATIONSHIP_REMOTE_UPDATE_CLEARING_LOCAL_STATE: false,
    },
    polyfillUUID: true,
  });

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
