/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { currentURL, waitUntil, visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Unit | Controller | onboarding/success', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);
  setupSqlite(hooks);

  let controller;
  let store;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    target: null,
  };

  const urls = {
    success: null,
    target: null,
  };

  hooks.beforeEach(async function () {
    await authenticateSession({});
    controller = this.owner.lookup('controller:onboarding/success');
    store = this.owner.lookup('service:store');

    instances.scopes.global = this.server.create('scope', {
      id: 'global',
      type: 'global',
    });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.target = this.server.create('target', {
      scope: instances.scopes.project,
    });

    urls.success = '/onboarding/success';
    urls.target = `/scopes/${instances.scopes.project.id}/targets/${instances.target.id}`;
  });

  test('it exists', function (assert) {
    assert.ok(controller);
  });

  test('showTargetList action redirects user a target', async function (assert) {
    await visit(urls.success);
    const target = await store.findRecord('target', instances.target.id);
    const project = await store.findRecord(
      'scope',
      instances.scopes.project.id,
    );
    const model = { target, project };

    controller.showTargetList(model);
    await waitUntil(() => currentURL() === urls.target);

    assert.strictEqual(currentURL(), urls.target);
  });
});
