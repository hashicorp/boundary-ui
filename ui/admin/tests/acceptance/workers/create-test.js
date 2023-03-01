/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, fillIn, click, find, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | workers | create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let globalScope;
  let workersURL;
  let newWorkerURL;
  let getWorkersCount;

  hooks.beforeEach(function () {
    globalScope = this.server.create('scope', { id: 'global' });

    workersURL = `/scopes/global/workers`;
    newWorkerURL = `${workersURL}/new`;
    getWorkersCount = () => this.server.schema.workers.all().length;

    authenticateSession({});
  });

  test('can create new workers', async function (assert) {
    assert.expect(1);
    const workersCount = getWorkersCount();
    await visit(newWorkerURL);
    await fillIn('[name="worker_auth_registration_request"]', 'token');
    await click('[type="submit"]');
    assert.strictEqual(getWorkersCount(), workersCount + 1);
  });

  test('cluster id input field is visible for `hcp` binary', async function (assert) {
    assert.expect(2);
    const featuresService = this.owner.lookup('service:features');
    featuresService.enable('byow-pki-hcp-cluster-id');
    featuresService.disable('byow-pki-upstream');
    await visit(newWorkerURL);
    const labels = findAll('label.rose-form-label');
    assert.dom(labels[0]).hasText('Boundary Cluster ID');
    assert.dom(labels[2]).doesNotIncludeText('Initial Upstreams');
  });

  test('initial upstreams input field is visible for `oss` binary', async function (assert) {
    assert.expect(2);
    const featuresService = this.owner.lookup('service:features');
    featuresService.disable('byow-pki-hcp-cluster-id');
    featuresService.enable('byow-pki-upstream');
    await visit(newWorkerURL);
    const labels = findAll('label.rose-form-label');
    assert.dom(labels[0]).doesNotIncludeText('Boundary Cluster ID');
    assert.dom(labels[2]).hasText('Initial Upstreams');
  });

  test('download and install step shows correct oss instructions', async function (assert) {
    assert.expect(2);
    const featuresService = this.owner.lookup('service:features');
    featuresService.disable('byow-pki-hcp-cluster-id');
    await visit(newWorkerURL);
    const createSection = findAll('.worker-create-section');
    assert.dom(createSection[1]).includesText('curl -fsSL');
    assert.dom(createSection[1]).doesNotIncludeText('wget -q');
  });

  test('download and install step shows correct hcp instructions', async function (assert) {
    assert.expect(2);
    const featuresService = this.owner.lookup('service:features');
    featuresService.enable('byow-pki-hcp-cluster-id');
    await visit(newWorkerURL);
    const createSection = findAll('.worker-create-section');
    assert.dom(createSection[1]).includesText('wget -q');
    assert.dom(createSection[1]).doesNotIncludeText('curl -fsSL');
  });

  test('Users can navigate to new workers route with proper authorization', async function (assert) {
    assert.expect(2);
    await visit(newWorkerURL);
    assert.ok(
      globalScope.authorized_collection_actions.workers.includes(
        'create:worker-led'
      )
    );
    assert.dom(`[href="${newWorkerURL}"]`).isVisible();
  });

  test('Users cannot navigate to new workers route without proper authorization', async function (assert) {
    assert.expect(2);
    globalScope.authorized_collection_actions.workers = [];
    await visit(workersURL);
    assert.notOk(
      globalScope.authorized_collection_actions.users.includes(
        'create:worker-led'
      )
    );
    assert.dom(`[href="${newWorkerURL}"]`).isNotVisible();
  });

  test('saving a new user with invalid fields displays error messages', async function (assert) {
    assert.expect(1);
    this.server.post('/workers:create:worker-led', () => {
      return new Response(
        500,
        {},
        {
          status: 500,
          code: 'api_error',
          message: 'rpc error: code = Unknown',
        }
      );
    });
    await visit(newWorkerURL);
    await fillIn('[name="worker_auth_registration_request"]', 'token');
    await click('[type="submit"]');
    assert.strictEqual(
      find('.rose-notification-body').textContent.trim(),
      'rpc error: code = Unknown',
      'Displays primary error message.'
    );
  });
});
