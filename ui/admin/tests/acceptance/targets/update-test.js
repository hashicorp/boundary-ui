/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
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
    assert.expect(5);
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
      'random string'
    );
    assert.strictEqual(
      this.server.schema.targets.first().workerFilter,
      'random filter'
    );
  });

  test('updating a target shows the worker_filter deprecation message when "target-worker-filters-v2" is enabled', async function (assert) {
    featuresService.enable('target-worker-filters-v2');
    assert.expect(1);
    await visit(urls.target);

    assert.dom('.hds-alert').isVisible();
  });

  test('updating a target does not show the worker_filter deprecation message when "target-worker-filters-v2" is disabled', async function (assert) {
    assert.expect(2);
    await visit(urls.target);
    assert.false(featuresService.isEnabled('target-worker-filters-v2'));
    assert.dom('.hds-alert').doesNotExist();
  });

  test('cannot edit worker_filter when "target-worker-filters-v2" is enabled', async function (assert) {
    featuresService.enable('target-worker-filters-v2');
    assert.expect(1);
    await visit(urls.target);

    assert.dom('[name=worker_filter]').isDisabled();
  });

  test('show update filter button when the old worker filter field is has value', async function (assert) {
    featuresService.enable('target-worker-filters-v2');
    assert.expect(2);
    await visit(urls.target);
    assert.dom('[name=worker_filter]').isVisible();
    await click('.rose-form-actions [type="button"]', 'Activate edit mode');
    assert.dom('.hds-button').hasText('Update Filter');
  });

  test('onClick update filter should select the egress toggle and the worker_filter value is copied into egress_worker_filter', async function (assert) {
    featuresService.enable('target-worker-filters-v2');
    assert.expect(2);
    await visit(urls.target);
    assert.dom('[name=worker_filter]').isVisible();
    const worker_filter_value = this.server.schema.targets.first().workerFilter;
    await click('.rose-form-actions [type="button"]', 'Activate edit mode');
    await click('.hds-button[type="button"]', 'Update Filter');
    assert.strictEqual(
      this.server.schema.targets.first().egressWorkerFilter,
      worker_filter_value
    );
  });

  test('onClick update filter should select the egress and ingress toggle and the worker_filter value is copied into egress_worker_filter and ingress_worker_filter', async function (assert) {
    featuresService.enable('target-worker-filters-v2');
    featuresService.enable('target-worker-filters-v2-ingress');
    assert.expect(3);
    await visit(urls.target);
    assert.dom('[name=worker_filter]').isVisible();
    const worker_filter_value = this.server.schema.targets.first().workerFilter;
    await click('.rose-form-actions [type="button"]', 'Activate edit mode');
    await click('.hds-button[type="button"]', 'Update Filter');
    assert.strictEqual(
      this.server.schema.targets.first().egressWorkerFilter,
      worker_filter_value
    );
    assert.strictEqual(
      this.server.schema.targets.first().ingressWorkerFilter,
      worker_filter_value
    );
  });

  test('show filter input field when the `egress_worker_filter` toggle is on', async function (assert) {
    featuresService.enable('target-worker-filters-v2');
    assert.expect(1);
    await visit(urls.target);
    await click('.rose-form-actions [type="button"]', 'Activate edit mode');
    await click('.hds-button[type="button"]', 'Update Filter');
    assert.dom('[name=egress_worker_filter]').isVisible();
  });

  test('hide filter input field when the `egress_worker_filter` toggled is off', async function (assert) {
    featuresService.enable('target-worker-filters-v2');
    featuresService.enable('target-worker-filters-v2-ingress');
    assert.expect(1);
    await visit(urls.target);
    await click('.rose-form-actions [type="button"]', 'Activate edit mode');
    await click('.hds-button[type="button"]', 'Update Filter');
    await click(
      '[name="target-worker-filter-toggle-egress_worker_filter"]',
      'Egress toggle'
    );
    assert.dom('[name=egress_worker_filter]').isNotVisible();
  });

  test('clear `egress_worker_field` value from a target when the toggle is off and form is saved', async function (assert) {
    featuresService.enable('target-worker-filters-v2');
    featuresService.enable('target-worker-filters-v2-ingress');
    assert.expect(5);
    await visit(urls.target);
    await click('.rose-form-actions [type="button"]', 'Activate edit mode');
    await click('.hds-button[type="button"]', 'Update Filter');
    await fillIn('[name=egress_worker_filter]', 'random filter string');
    await click('.rose-form-actions [type="submit"]');
    assert.strictEqual(currentURL(), urls.target);
    assert.strictEqual(
      this.server.schema.targets.first().egressWorkerFilter,
      'random filter string'
    );
    await click('.rose-form-actions [type="button"]', 'Activate edit mode');
    await click(
      '[name="target-worker-filter-toggle-egress_worker_filter"]',
      'Egress toggle'
    );
    await click('.rose-form-actions [type="submit"]');
    //clear egress_worker_filter when the toggle is off
    assert.strictEqual(currentURL(), urls.target);
    assert.dom('[name=egress_worker_filter]').doesNotExist();
    assert.strictEqual(
      this.server.schema.targets.first().egressWorkerFilter,
      null
    );
  });

  test('show filter input field when the `ingress_worker_filter` toggle is on', async function (assert) {
    featuresService.enable('target-worker-filters-v2');
    featuresService.enable('target-worker-filters-v2-ingress');
    assert.expect(1);
    await visit(urls.target);
    await click('.rose-form-actions [type="button"]', 'Activate edit mode');
    await click('.hds-button[type="button"]', 'Update Filter');
    assert.dom('[name=ingress_worker_filter]').isVisible();
  });

  test('hide filter input field when the `ingress_worker_filter` toggled is off', async function (assert) {
    featuresService.enable('target-worker-filters-v2');
    featuresService.enable('target-worker-filters-v2-ingress');
    assert.expect(1);
    await visit(urls.target);
    await click('.rose-form-actions [type="button"]', 'Activate edit mode');
    await click('.hds-button[type="button"]', 'Update Filter');
    await click('.hds-form-toggle__control', 'Ingress worker filter');
    assert.dom('[name=ingress_worker_filter]').isNotVisible();
  });

  test('clear `ingress_worker_field` value from a target when the toggle is off and form is saved', async function (assert) {
    featuresService.enable('target-worker-filters-v2');
    featuresService.enable('target-worker-filters-v2-ingress');
    assert.expect(5);
    await visit(urls.target);
    await click('.rose-form-actions [type="button"]', 'Activate edit mode');
    await click('.hds-button[type="button"]', 'Update Filter');
    await fillIn('[name=ingress_worker_filter]', 'random filter string');
    await click('.rose-form-actions [type="submit"]');
    assert.strictEqual(currentURL(), urls.target);
    assert.strictEqual(
      this.server.schema.targets.first().ingressWorkerFilter,
      'random filter string'
    );
    await click('.rose-form-actions [type="button"]', 'Activate edit mode');
    await click('.hds-form-toggle__control', 'Ingress worker filter');
    await click('.rose-form-actions [type="submit"]');
    //clear egress_worker_filter when the toggle is off
    assert.strictEqual(currentURL(), urls.target);
    assert.dom('[name=ingress_worker_filter]').doesNotExist();
    assert.strictEqual(
      this.server.schema.targets.first().ingressWorkerFilter,
      null
    );
  });

  test('can cancel changes to existing target', async function (assert) {
    assert.expect(2);
    await visit(urls.targets);
    await click(`[href="${urls.target}"]`);
    await click('.rose-form-actions [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');

    assert.notEqual(instances.target.name, 'random string');
    assert.dom('[name="name"]').hasValue(instances.target.name);
  });

  test('saving an existing target with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
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
        }
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
    featuresService.enable('target-worker-filters-v2');
    assert.expect(7);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.target.name, 'random string');
    assert.notEqual(
      instances.target.egressWorkerFilter,
      'random worker string'
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
      'random worker string'
    );
  });

  test('can click cancel on discard dialog box for unsaved target changes', async function (assert) {
    featuresService.enable('target-worker-filters-v2');
    assert.expect(6);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.target.name, 'random string');
    await visit(urls.targets);

    await click(`[href="${urls.target}"]`);
    await click('.rose-form-actions [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');

    await click('.hds-button[type="button"]', 'Update Filter');
    await fillIn('[name="egress_worker_filter"]', 'random filter');
    assert.strictEqual(currentURL(), urls.target);
    await click(`[href="${urls.targets}"]`);
    assert.dom('.rose-dialog').exists();
    await click('.rose-dialog-footer button:last-child', 'Click Cancel');

    assert.strictEqual(currentURL(), urls.target);
    assert.notEqual(this.server.schema.targets.first().name, 'random string');
    assert.notEqual(
      this.server.schema.targets.first().egressWorkerFilter,
      'random string'
    );
  });

  test('cannot make changes to an existing target without proper authorization', async function (assert) {
    assert.expect(1);
    await visit(urls.targets);
    instances.target.authorized_actions =
      instances.target.authorized_actions.filter((item) => item !== 'update');

    await click(`[href="${urls.target}"]`);

    assert.dom('.rose-form-actions [type="button"]').doesNotExist();
  });

  test('saving address with existing host sources brings up confirmation modal and removes host sources', async function (assert) {
    assert.expect(4);
    featuresService.enable('ssh-target');
    featuresService.enable('target-network-address');
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    this.server.createList(
      'host-catalog',
      8,
      { scope: instances.scopes.project },
      'withChildren'
    );
    this.server.createList(
      'credential-store',
      3,
      { scope: instances.scopes.project },
      'withAssociations'
    );
    const target = this.server.create(
      'target',
      { scope: instances.scopes.project },
      'withAssociations'
    );
    assert.true(this.server.schema.targets.find(target.id).hostSets.length > 0);

    const url = `${urls.targets}/${target.id}`;
    await visit(urls.targets);
    await click(`[href="${url}"]`);

    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="address"]', '0.0.0.0');
    await click('[type="submit"]');

    assert.dom('.rose-dialog').isVisible();
    await click('.rose-dialog-footer .rose-button-primary', 'Remove resources');

    assert.strictEqual(
      this.server.schema.targets.find(target.id).address,
      '0.0.0.0'
    );
    assert.strictEqual(
      this.server.schema.targets.find(target.id).hostSets.length,
      0
    );
  });

  test('saving address with existing host sources brings up confirmation modal and can cancel', async function (assert) {
    assert.expect(4);
    featuresService.enable('ssh-target');
    featuresService.enable('target-network-address');
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    this.server.createList(
      'host-catalog',
      8,
      { scope: instances.scopes.project },
      'withChildren'
    );
    this.server.createList(
      'credential-store',
      3,
      { scope: instances.scopes.project },
      'withAssociations'
    );
    const target = this.server.create(
      'target',
      { scope: instances.scopes.project },
      'withAssociations'
    );
    assert.true(this.server.schema.targets.find(target.id).hostSets.length > 0);

    const url = `${urls.targets}/${target.id}`;
    await visit(urls.targets);
    await click(`[href="${url}"]`);

    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="address"]', '0.0.0.0');
    await click('[type="submit"]');

    assert.dom('.rose-dialog').isVisible();
    await click('.rose-dialog-footer .rose-button-secondary', 'Cancel');

    assert.strictEqual(
      this.server.schema.targets.find(target.id).address,
      undefined
    );
    assert.true(this.server.schema.targets.find(target.id).hostSets.length > 0);
  });
});
