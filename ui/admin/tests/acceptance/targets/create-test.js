/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  find,
  click,
  fillIn,
  getContext,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';
import { TYPE_TARGET_TCP, TYPE_TARGET_SSH } from 'api/models/target';

module('Acceptance | targets | create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let getTargetCount;
  let getTCPTargetCount;
  let getSSHTargetCount;
  let featuresService;

  const SAVE_BTN_SELECTOR = '[type="submit"]';

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    target: null,
  };
  const urls = {
    orgScope: null,
    projectScope: null,
    targets: null,
    target: null,
    newTarget: null,
    newTCPTarget: null,
    newSSHTarget: null,
  };

  hooks.beforeEach(function () {
    const { owner } = getContext();
    featuresService = owner.lookup('service:features');
    instances.scopes.global = this.server.create('scope', { id: 'global' });
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
    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;
    urls.unknownTarget = `${urls.targets}/foo`;
    urls.newTarget = `${urls.targets}/new`;
    urls.newTCPTarget = `${urls.targets}/new?type=tcp`;
    urls.newSSHTarget = `${urls.targets}/new?type=ssh`;
    // Generate resource counter
    getTargetCount = () => this.server.schema.targets.all().models.length;
    getSSHTargetCount = () =>
      this.server.schema.targets.where({ type: TYPE_TARGET_SSH }).models.length;
    getTCPTargetCount = () =>
      this.server.schema.targets.where({ type: TYPE_TARGET_TCP }).models.length;
    authenticateSession({});
  });

  test('defaults to type `ssh` when no query param provided', async function (assert) {
    featuresService.enable('ssh-target');
    await visit(urls.newTarget);
    assert.strictEqual(find('[name="type"]:checked').value, TYPE_TARGET_SSH);
  });

  test('can create type `ssh` when `target-worker-filters-v2` is disabled', async function (assert) {
    featuresService.enable('ssh-target');

    assert.false(featuresService.isEnabled('target-worker-filters-v2'));

    const targetCount = getTargetCount();
    const sshTargetCount = getSSHTargetCount();
    await visit(urls.targets);

    await click(`[href="${urls.newTarget}"]`);
    await click('[value="ssh"]');
    await fillIn('[name="name"]', 'random string');
    await fillIn('[name="worker_filter"]', 'random filter');
    await click(SAVE_BTN_SELECTOR);

    assert.strictEqual(getSSHTargetCount(), sshTargetCount + 1);
    assert.strictEqual(getTargetCount(), targetCount + 1);
    assert.strictEqual(
      this.server.schema.targets.all().models[getTargetCount() - 1].name,
      'random string',
    );
    assert.strictEqual(
      this.server.schema.targets.all().models[getTargetCount() - 1]
        .workerFilter,
      'random filter',
    );
  });

  test('can create type `ssh` when `target-worker-filters-v2` is enabled', async function (assert) {
    featuresService.enable('ssh-target');
    featuresService.enable('target-worker-filters-v2');

    const targetCount = getTargetCount();
    const sshTargetCount = getSSHTargetCount();
    await visit(urls.targets);

    await click(`[href="${urls.newTarget}"]`);
    await click('[value="ssh"]');
    await fillIn('[name="name"]', 'random string');
    await click(
      '[name="target-worker-filter-toggle-egress_worker_filter"]',
      'Egress toggle',
    );
    await fillIn('[name="egress_worker_filter"]', 'random filter');
    await click(SAVE_BTN_SELECTOR);

    assert.strictEqual(getSSHTargetCount(), sshTargetCount + 1);
    assert.strictEqual(getTargetCount(), targetCount + 1);
    assert.strictEqual(
      this.server.schema.targets.all().models[getTargetCount() - 1].name,
      'random string',
    );
    assert.strictEqual(
      this.server.schema.targets.all().models[getTargetCount() - 1]
        .egressWorkerFilter,
      'random filter',
    );
  });

  test('can create type `tcp` when `target-worker-filters-v2` is disabled', async function (assert) {
    featuresService.enable('ssh-target');

    assert.false(featuresService.isEnabled('target-worker-filters-v2'));

    const targetCount = getTargetCount();
    const tcpTargetCount = getTCPTargetCount();
    await visit(urls.targets);

    await click(`[href="${urls.newTarget}"]`);
    await click('[value="tcp"]');
    await fillIn('[name="name"]', 'random string');
    await fillIn('[name="worker_filter"]', 'random filter');
    await click(SAVE_BTN_SELECTOR);

    assert.strictEqual(getTargetCount(), targetCount + 1);
    assert.strictEqual(getTCPTargetCount(), tcpTargetCount + 1);
    assert.strictEqual(
      this.server.schema.targets.all().models[getTargetCount() - 1].name,
      'random string',
    );
    assert.strictEqual(
      this.server.schema.targets.all().models[getTargetCount() - 1]
        .workerFilter,
      'random filter',
    );
  });

  test('can create type `tcp` when `target-worker-filters-v2` is enabled', async function (assert) {
    featuresService.enable('ssh-target');
    featuresService.enable('target-worker-filters-v2');

    const targetCount = getTargetCount();
    const tcpTargetCount = getTCPTargetCount();
    await visit(urls.targets);

    await click(`[href="${urls.newTarget}"]`);
    await click('[value="tcp"]');
    await fillIn('[name="name"]', 'random string');
    await click(
      '[name="target-worker-filter-toggle-egress_worker_filter"]',
      'Egress toggle',
    );
    await fillIn('[name="egress_worker_filter"]', 'random filter');

    await click(SAVE_BTN_SELECTOR);

    assert.strictEqual(getTargetCount(), targetCount + 1);
    assert.strictEqual(getTCPTargetCount(), tcpTargetCount + 1);
    assert.strictEqual(
      this.server.schema.targets.all().models[getTargetCount() - 1].name,
      'random string',
    );
    assert.strictEqual(
      this.server.schema.targets.all().models[getTargetCount() - 1]
        .egressWorkerFilter,
      'random filter',
    );
  });

  test('can create type `tcp` when `target-worker-filters-v2` and `target-worker-filters-v2-ingress` is enabled', async function (assert) {
    featuresService.enable('ssh-target');
    featuresService.enable('target-worker-filters-v2');
    featuresService.enable('target-worker-filters-v2-ingress');

    const targetCount = getTargetCount();
    const tcpTargetCount = getTCPTargetCount();
    await visit(urls.targets);

    await click(`[href="${urls.newTarget}"]`);
    await click('[value="tcp"]');
    await fillIn('[name="name"]', 'random string');
    await click(
      '[data-test-filter="egress_worker_filter"] .hds-form-toggle__control',
    );
    await fillIn('[name="egress_worker_filter"]', 'random filter');
    await click(
      '[data-test-filter="ingress_worker_filter"] .hds-form-toggle__control',
    );
    await fillIn('[name="ingress_worker_filter"]', 'random filter');

    await click(SAVE_BTN_SELECTOR);

    assert.strictEqual(getTargetCount(), targetCount + 1);
    assert.strictEqual(getTCPTargetCount(), tcpTargetCount + 1);
    assert.strictEqual(
      this.server.schema.targets.all().models[getTargetCount() - 1].name,
      'random string',
    );
    assert.strictEqual(
      this.server.schema.targets.all().models[getTargetCount() - 1]
        .egressWorkerFilter,
      'random filter',
    );
  });

  test('default port is not marked required for SSH targets', async function (assert) {
    featuresService.enable('ssh-target');
    await visit(urls.newTarget);
    assert.dom('[data-test-default-port-label]').includesText('Optional');
  });

  test('default port is marked required for TCP targets', async function (assert) {
    featuresService.enable('ssh-target');
    await visit(urls.newTarget);
    await click('[value="tcp"]');
    assert.dom('[data-test-default-port-label]').includesText('Required');
  });

  test('can navigate to new targets route with proper authorization', async function (assert) {
    await visit(urls.projectScope);

    await click(`[href="${urls.targets}"]`);

    assert.true(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create',
      ),
    );
    assert.dom(`[href="${urls.newTarget}"]`).exists();
  });

  test('cannot navigate to new targets route without proper authorization', async function (assert) {
    instances.scopes.project.authorized_collection_actions.targets =
      instances.scopes.project.authorized_collection_actions.targets.filter(
        (item) => item !== 'create',
      );
    await visit(urls.projectScope);

    await click(`[href="${urls.targets}"]`);

    assert.false(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create',
      ),
    );
    assert.dom('.rose-layout-page-actions a').doesNotExist();
  });

  test('cannot navigate to new SSH targets route when ssh feature is disabled', async function (assert) {
    await visit(urls.targets);

    await click(`[href="${urls.newTarget}"]`);
    assert.false(featuresService.isEnabled('ssh-target'));
    assert.true(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create',
      ),
    );
    assert.dom('.info-field').exists({ count: 1 });
    assert.dom('.info-field .hds-form-helper-text').includesText('TCP');
  });

  test('can cancel create new TCP target', async function (assert) {
    featuresService.enable('target-worker-filters-v2');
    featuresService.enable('target-worker-filters-v2-ingress');

    const targetCount = getTargetCount();
    const tcpTargetCount = getTCPTargetCount();
    await visit(urls.targets);

    await click(`[href="${urls.newTarget}"]`);
    await fillIn('[name="name"]', 'random string');
    await click(
      '[name="target-worker-filter-toggle-egress_worker_filter"]',
      'Egress toggle',
    );
    await fillIn('[name="egress_worker_filter"]', 'random filter');
    await click('.rose-form-actions [type="button"]');

    assert.strictEqual(currentURL(), urls.targets);
    assert.strictEqual(getTargetCount(), targetCount);
    assert.strictEqual(getTCPTargetCount(), tcpTargetCount);
  });

  test('can add aliases during target creation', async function (assert) {
    const targetCount = getTargetCount();
    const tcpTargetCount = getTCPTargetCount();
    await visit(urls.targets);
    const name = 'target';

    await click(`[href="${urls.newTarget}"]`);
    await fillIn('[name="name"]', name);

    assert.ok(
      instances.scopes.global.authorized_collection_actions.aliases.includes(
        'create',
      ),
    );

    await fillIn('[name="with_aliases"] input', 'alias 1');
    await click('[name="with_aliases"] button');
    await click(SAVE_BTN_SELECTOR);

    assert.strictEqual(getTargetCount(), targetCount + 1);
    const target = this.server.schema.targets.findBy({ name });
    assert.deepEqual(target.withAliases, [
      { value: 'alias 1', scope_id: 'global' },
    ]);
    assert.strictEqual(getTCPTargetCount(), tcpTargetCount + 1);
  });

  test('can cancel create new SSH target', async function (assert) {
    featuresService.enable('ssh-target');
    featuresService.enable('target-worker-filters-v2');
    featuresService.enable('target-worker-filters-v2-ingress');

    const targetCount = getTargetCount();
    const sshTargetCount = getSSHTargetCount();
    await visit(urls.targets);
    await click(`[href="${urls.newTarget}"]`);
    await fillIn('[name="name"]', 'random string');
    await click('[value="ssh"]');
    await click(
      '[name="target-worker-filter-toggle-egress_worker_filter"]',
      'Egress toggle',
    );
    await fillIn('[name="egress_worker_filter"]', 'random filter');
    await click('.rose-form-actions [type="button"]');

    assert.strictEqual(currentURL(), urls.targets);
    assert.strictEqual(getTargetCount(), targetCount);
    assert.strictEqual(getSSHTargetCount(), sshTargetCount);
  });

  test('saving a new TCP target with invalid fields displays error messages', async function (assert) {
    this.server.post('/targets', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {
            request_fields: [
              {
                name: 'name',
                description: 'Name is required.',
              },
            ],
          },
        },
      );
    });

    await visit(urls.newTCPTarget);
    await click(SAVE_BTN_SELECTOR);

    assert.dom('[role="alert"] div').hasText('The request was invalid.');
    assert.dom('.hds-form-error__message').hasText('Name is required.');
  });

  test('saving a new SSH target with invalid fields displays error messages', async function (assert) {
    this.server.post('/targets', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {
            request_fields: [
              {
                name: 'name',
                description: 'Name is required.',
              },
            ],
          },
        },
      );
    });
    await visit(urls.newSSHTarget);
    await click(SAVE_BTN_SELECTOR);

    assert.dom('[role="alert"] div').hasText('The request was invalid.');
    assert.dom('.hds-form-error__message').hasText('Name is required.');
  });

  test('can save address', async function (assert) {
    featuresService.enable('target-network-address');

    const targetCount = getTargetCount();
    await visit(urls.targets);

    await click(`[href="${urls.newTarget}"]`);

    await fillIn('[name="name"]', 'random string');
    await fillIn('[name="address"]', '0.0.0.0');
    await click(SAVE_BTN_SELECTOR);

    assert.strictEqual(getTargetCount(), targetCount + 1);
    assert.strictEqual(
      this.server.schema.targets.all().models[getTargetCount() - 1].address,
      '0.0.0.0',
    );
  });

  test('address field does not exist when target network address feature is disabled', async function (assert) {
    await visit(urls.targets);
    await click(`[href="${urls.newTarget}"]`);
    assert.false(featuresService.isEnabled('target-network-address'));
    assert.dom('[name="address"]').doesNotExist();
  });

  test('users cannot directly navigate to new storage bucket route without proper authorization', async function (assert) {
    instances.scopes.project.authorized_collection_actions.targets =
      instances.scopes.project.authorized_collection_actions.targets.filter(
        (item) => item !== 'create',
      );

    await visit(urls.newSSHTarget);

    assert.false(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create',
      ),
    );
    // assert.strictEqual(currentURL(), urls.targets);
  });
});
