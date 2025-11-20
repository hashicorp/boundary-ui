/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { currentURL, waitUntil, visit } from '@ember/test-helpers';
import { setupMirage } from 'api/test-support/helpers/mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { TYPE_TARGET_TCP } from 'api/models/target';

module('Unit | Controller | onboarding/index', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);

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
    store = this.owner.lookup('service:store');
    controller = this.owner.lookup('controller:onboarding/index');

    instances.scopes.global = this.server.create(
      'scope',
      { id: 'global' },
      'withGlobalAuth',
    );
    instances.authMethod = this.server.schema.authMethods.first();
    instances.account = this.server.schema.accounts.first();
    await authenticateSession({
      isGlobal: true,
      account_id: instances.account.id,
    });

    urls.onboarding = '/onboarding';
    urls.success = '/onboarding/success';
    urls.globalScope = '/scopes/global/scopes';
  });

  test('it exists', function (assert) {
    assert.ok(controller);
  });

  test('createResources action creates and saves resources', async function (assert) {
    await visit(urls.onboarding);
    const global = await store.findRecord('scope', instances.scopes.global.id);
    const org = store.createRecord('scope', { type: 'org' });
    org.scopeModel = global;
    const project = store.createRecord('scope', { type: 'project' });
    const target = store.createRecord('target', {
      type: TYPE_TARGET_TCP,
      scope: project,
    });
    const role = store.createRecord('role', { scope: org });

    await controller.createResources(
      { org, project, target, role },
      'localhost',
      '22',
    );

    assert.strictEqual(project.scopeID, org.id);
    assert.strictEqual(target.address, 'localhost');
    assert.strictEqual(target.default_port, 22);
    assert.strictEqual(target.scopeID, project.id);
    assert.strictEqual(role.scopeID, org.id);
    assert.deepEqual(role.grant_strings, [
      'type=target;actions=list',
      'ids=1;actions=authorize-session',
    ]);
    assert.strictEqual(currentURL(), urls.success);
  });

  test('doLater action redirects user to correct page', async function (assert) {
    await visit(urls.onboarding);

    controller.doLater();
    await waitUntil(() => currentURL() === urls.globalScope);

    assert.strictEqual(currentURL(), urls.globalScope);
  });
});
