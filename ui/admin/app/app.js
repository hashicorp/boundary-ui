/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from 'admin/config/environment';
import {
  macroCondition,
  importSync,
  getOwnConfig,
  isTesting,
} from '@embroider/macros';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);

if (macroCondition(getOwnConfig().startMirageWithApp && !isTesting())) {
  const startServer = importSync('api/mirage/config').default;
  startServer({});
}
