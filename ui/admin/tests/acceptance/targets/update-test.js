/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | targets | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let featuresService;

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
  };

  hooks.beforeEach(function () {
    featuresService = this.owner.lookup('service:features');
    // Generate resources
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

    authenticateSession({});
  });

  test('can save changes to existing target', async function (assert) {
    await visit(urls.targets);
    assert.notEqual(instances.target.name, 'random string');
    assert.notEqual(instances.target.worker_filter, 'random filter');

    await click(`[href="${urls.target}"]`);
    await click('.rose-form-actions [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await fillIn('[name="worker_filter"]', 'random filter');
    await click('.rose-form-actions [type="submit"]');

    assert.strictEqual(currentURL(), urls.target);
    assert.strictEqual(
      this.server.schema.targets.first().name,
      'random string',
    );
    assert.strictEqual(
      this.server.schema.targets.first().workerFilter,
      'random filter',
    );
  });

  test('can cancel changes to existing target', async function (assert) {
    await visit(urls.targets);
    await click(`[href="${urls.target}"]`);
    await click('.rose-form-actions [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');

    assert.notEqual(instances.target.name, 'random string');
    assert.dom('[name="name"]').hasValue(instances.target.name);
  });

  test('saving an existing target with invalid fields displays error messages', async function (assert) {
    await visit(urls.targets);
    this.server.patch('/targets/:id', () => {
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

    await click(`[href="${urls.target}"]`);
    await click('.rose-form-actions [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');

    assert.dom('[role="alert"] div').hasText('The request was invalid.');
    assert.dom('.hds-form-error__message').hasText('Name is required.');
  });

  test('can discard unsaved target changes via dialog', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.target.name, 'random string');
    assert.notEqual(
      instances.target.egressWorkerFilter,
      'random worker string',
    );
    await visit(urls.targets);

    await click(`[href="${urls.target}"]`);
    await click('.rose-form-actions [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.hds-button[type="button"]', 'Update Filter');
    await fillIn('[name="egress_worker_filter"]', 'random worker string');
    assert.strictEqual(currentURL(), urls.target);
    await click(`[href="${urls.targets}"]`);
    assert.dom('.rose-dialog').exists();
    await click('.rose-dialog-footer button:first-child', 'Click Discard');

    assert.strictEqual(currentURL(), urls.targets);
    assert.notEqual(this.server.schema.targets.first().name, 'random string');
    assert.notEqual(
      this.server.schema.targets.first().egressWorkerFilter,
      'random worker string',
    );
  });

  test('can click cancel on discard dialog box for unsaved target changes', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.target.name, 'random string');
    await visit(urls.targets);

    await click(`[href="${urls.target}"]`);
    await click('.rose-form-actions [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');

    assert.strictEqual(currentURL(), urls.target);
    await click(`[href="${urls.targets}"]`);
    assert.dom('.rose-dialog').exists();
    await click('.rose-dialog-footer button:last-child', 'Click Cancel');

    assert.strictEqual(currentURL(), urls.target);
    assert.notEqual(this.server.schema.targets.first().name, 'random string');
    assert.notEqual(
      this.server.schema.targets.first().egressWorkerFilter,
      'random string',
    );
  });

  test('cannot make changes to an existing target without proper authorization', async function (assert) {
    await visit(urls.targets);
    instances.target.authorized_actions =
      instances.target.authorized_actions.filter((item) => item !== 'update');

    await click(`[href="${urls.target}"]`);

    assert.dom('.rose-form-actions [type="button"]').doesNotExist();
  });

  test('saving address with existing host sources brings up confirmation modal and removes host sources', async function (assert) {
    featuresService.enable('ssh-target');
    featuresService.enable('target-network-address');
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    this.server.createList(
      'host-catalog',
      8,
      { scope: instances.scopes.project },
      'withChildren',
    );
    this.server.createList(
      'credential-store',
      3,
      { scope: instances.scopes.project },
      'withAssociations',
    );
    const target = this.server.create(
      'target',
      { scope: instances.scopes.project },
      'withAssociations',
    );
    assert.true(this.server.schema.targets.find(target.id).hostSets.length > 0);

    const url = `${urls.targets}/${target.id}`;
    await visit(urls.targets);
    await click(`[href="${url}"]`);

    await click('.rose-form-actions [type="button"]', 'Activate edit mode');
    await fillIn('[name="address"]', '0.0.0.0');
    await click('[type="submit"]');

    assert.dom('.rose-dialog').isVisible();
    await click('.rose-dialog-footer .rose-button-primary', 'Remove resources');

    assert.strictEqual(
      this.server.schema.targets.find(target.id).address,
      '0.0.0.0',
    );
    assert.strictEqual(
      this.server.schema.targets.find(target.id).hostSets.length,
      0,
    );
  });

  test('saving address with existing host sources brings up confirmation modal and can cancel', async function (assert) {
    featuresService.enable('ssh-target');
    featuresService.enable('target-network-address');
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    this.server.createList(
      'host-catalog',
      8,
      { scope: instances.scopes.project },
      'withChildren',
    );
    this.server.createList(
      'credential-store',
      3,
      { scope: instances.scopes.project },
      'withAssociations',
    );
    const target = this.server.create(
      'target',
      { scope: instances.scopes.project },
      'withAssociations',
    );
    assert.true(this.server.schema.targets.find(target.id).hostSets.length > 0);

    const url = `${urls.targets}/${target.id}`;
    await visit(urls.targets);
    await click(`[href="${url}"]`);

    await click('.rose-form-actions [type="button"]', 'Activate edit mode');
    await fillIn('[name="address"]', '0.0.0.0');
    await click('[type="submit"]');

    assert.dom('.rose-dialog').isVisible();
    await click('.rose-dialog-footer .rose-button-secondary', 'Cancel');

    assert.strictEqual(
      this.server.schema.targets.find(target.id).address,
      undefined,
    );
    assert.true(this.server.schema.targets.find(target.id).hostSets.length > 0);
  });
});
