/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { currentURL, waitUntil, visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { TYPE_TARGET_TCP } from 'api/models/target';

module('Unit | Controller | onboarding/index', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let store;
  let controller;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    target: null,
    role: null,
  };

  const urls = {
    onboarding: null,
    success: null,
    globalScope: null,
  };

  hooks.beforeEach(async function () {
    authenticateSession({});
    store = this.owner.lookup('service:store');
    controller = this.owner.lookup('controller:onboarding/index');

    instances.scopes.global = this.server.create('scope', {
      id: 'global',
      type: 'global',
    });

    urls.onboarding = '/onboarding';
    (urls.success = '/onboarding/success'),
      (urls.globalScope = '/scopes/global/scopes');
  });

  test('it exists', function (assert) {
    assert.ok(controller);
  });

  test('doLater action causes transition to expected route', async function (assert) {
    await visit(urls.onboarding);

    controller.doLater();
    await waitUntil(() => currentURL() === urls.globalScope);

    assert.strictEqual(currentURL(), urls.globalScope);
  });

  test('createResources action creates and saves resources', async function (assert) {
    await visit(urls.onboarding);
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.target = this.server.create('target', {
      type: TYPE_TARGET_TCP,
      scope: instances.scopes.project,
    });
    instances.role = this.server.create('role', {
      scope: instances.scopes.org,
    });
    const org = await store.findRecord('scope', instances.scopes.org.id);
    const project = await store.findRecord(
      'scope',
      instances.scopes.project.id,
    );
    const target = await store.findRecord('target', instances.target.id);
    const role = await store.findRecord('role', instances.role.id);

    await controller.createResources(
      { org, project, target, role },
      'localhost',
      '22',
    );

    assert.strictEqual(target.address, 'localhost');
    assert.strictEqual(target.default_port, 22);
    assert.strictEqual(currentURL(), urls.success);
  });
});
