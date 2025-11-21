/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';
import {
  macroCondition,
  isDevelopingApp,
  isTesting,
  importSync,
} from '@embroider/macros';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);

if (macroCondition(isDevelopingApp() && !isTesting())) {
  if (config.mirage?.enabled) {
    const startServer = importSync('api/mirage/config').default;
    startServer({});
  }
}
