/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Application from '@ember/application';

import config from 'admin/config/environment';
import { initialize } from 'admin/instance-initializers/feature-edition';
import { module, test } from 'qunit';
import Resolver from 'ember-resolver';
import { run } from '@ember/runloop';

module('Unit | Instance Initializer | feature-edition', function (hooks) {
  hooks.beforeEach(function () {
    this.TestApplication = class TestApplication extends Application {
      modulePrefix = config.modulePrefix;
      podModulePrefix = config.podModulePrefix;
      Resolver = Resolver;
    };

    this.TestApplication.instanceInitializer({
      name: 'initializer under test',
      initialize,
    });

    this.application = this.TestApplication.create({
      autoboot: false,
    });

    this.instance = this.application.buildInstance();
  });

  hooks.afterEach(function () {
    // eslint-disable-next-line ember/no-runloop
    run(this.instance, 'destroy');
    // eslint-disable-next-line ember/no-runloop
    run(this.application, 'destroy');
  });

  test('it works', async function (assert) {
    await this.instance.boot();

    assert.ok(true);
  });
});
