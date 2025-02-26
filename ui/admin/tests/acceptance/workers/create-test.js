/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, fillIn, click, findAll, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | workers | create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let globalScope;
  let workersURL;
  let newWorkerURL;
  let getWorkersCount;

  hooks.beforeEach(async function () {
    globalScope = this.server.create('scope', { id: 'global' });

    workersURL = `/scopes/global/workers`;
    newWorkerURL = `${workersURL}/new`;
    getWorkersCount = () => this.server.schema.workers.all().length;

    await authenticateSession({});
  });

  test('can create new workers', async function (assert) {
    const workersCount = getWorkersCount();
    await visit(newWorkerURL);
    await fillIn('[name="worker_auth_registration_request"]', 'token');
    await click('[type="submit"]');
    assert.strictEqual(getWorkersCount(), workersCount + 1);
  });

  test('cluster id input field is visible for `hcp` binary', async function (assert) {
    const featuresService = this.owner.lookup('service:features');
    featuresService.enable('byow-pki-hcp-cluster-id');
    await visit(newWorkerURL);
    const labels = findAll('.worker-create-section label.hds-form-label');
    assert.dom(labels[0]).hasText('Boundary Cluster ID (Optional)');
    assert.dom(labels[2]).doesNotIncludeText('Initial Upstreams');
  });

  test('initial upstreams input field is visible for `oss` binary', async function (assert) {
    const featuresService = this.owner.lookup('service:features');
    await visit(newWorkerURL);
    const labels = findAll('.worker-create-section label.hds-form-label');
    assert.false(featuresService.isEnabled('byow-pki-hcp-cluster-id'));
    assert.dom(labels[0]).doesNotIncludeText('Boundary Cluster ID');
    assert.dom(labels[2]).hasText('Initial Upstreams (Optional)');
  });

  test('download and install step shows correct oss instructions', async function (assert) {
    const featuresService = this.owner.lookup('service:features');
    await visit(newWorkerURL);
    const createSection = findAll('.worker-create-section');
    assert.false(featuresService.isEnabled('byow-pki-hcp-cluster-id'));
    assert
      .dom(createSection[1])
      .includesText(
        'curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add - ;',
      );
    assert
      .dom(createSection[1])
      .doesNotIncludeText(
        'wget -q "$(curl -fsSL "https://api.releases.hashicorp.com/v1/releases/boundary/latest?license_class=enterprise"',
      );
  });

  test('download and install step shows correct hcp instructions', async function (assert) {
    const featuresService = this.owner.lookup('service:features');
    featuresService.enable('byow-pki-hcp-cluster-id');
    await visit(newWorkerURL);
    const createSection = findAll('.worker-create-section');
    assert
      .dom(createSection[1])
      .includesText(
        'wget -q "$(curl -fsSL "https://api.releases.hashicorp.com/v1/releases/boundary/latest?license_class=enterprise"',
      );
    assert
      .dom(createSection[1])
      .doesNotIncludeText(
        'curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add - ;',
      );
  });

  test('Users can navigate to new workers route with proper authorization', async function (assert) {
    await visit(workersURL);
    assert.ok(
      globalScope.authorized_collection_actions.workers.includes(
        'create:worker-led',
      ),
    );
    assert.dom(`[href="${newWorkerURL}"]`).isVisible();
  });

  test('Users cannot navigate to new workers route without proper authorization', async function (assert) {
    globalScope.authorized_collection_actions.workers = [];
    await visit(workersURL);
    assert.notOk(
      globalScope.authorized_collection_actions.users.includes(
        'create:worker-led',
      ),
    );
    assert.dom(`[href="${newWorkerURL}"]`).isNotVisible();
  });

  test('saving a new worker with invalid fields displays error messages', async function (assert) {
    this.server.post('/workers:create:worker-led', () => {
      return new Response(
        500,
        {},
        {
          status: 500,
          code: 'api_error',
          message: 'rpc error: code = Unknown',
        },
      );
    });
    await visit(newWorkerURL);
    await fillIn('[name="worker_auth_registration_request"]', 'token');
    await click('[type="submit"]');
    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('rpc error: code = Unknown');
  });

  test('users cannot directly navigate to new worker route without proper authorization', async function (assert) {
    globalScope.authorized_collection_actions.workers =
      globalScope.authorized_collection_actions.workers.filter(
        (item) => item !== 'create:worker-led',
      );

    await visit(newWorkerURL);

    assert.false(
      globalScope.authorized_collection_actions.workers.includes(
        'create:worker-led',
      ),
    );
    assert.strictEqual(currentURL(), workersURL);
  });
});
