/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | targets | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let getTargetCount;
  const MANAGE_DROPDOWN_SELECTOR =
    '[data-test-manage-targets-dropdown] button:first-child';
  const DELETE_ACTION_SELECTOR =
    '[data-test-manage-targets-dropdown] ul li button';

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

  hooks.beforeEach(async function () {
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
    urls.newTarget = `${urls.targets}/new`;
    // Generate resource counter
    getTargetCount = () => this.server.schema.targets.all().models.length;
    await authenticateSession({});
  });

  test('can delete target', async function (assert) {
    const targetCount = getTargetCount();
    await visit(urls.targets);

    await click(`[href="${urls.target}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);
    assert.strictEqual(getTargetCount(), targetCount - 1);
  });

  test('can accept delete target via dialog', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const targetCount = getTargetCount();
    await visit(urls.targets);

    await click(`[href="${urls.target}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);
    await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN);

    assert
      .dom('[data-test-toast-notification] .hds-alert__description')
      .hasText('Deleted successfully.');
    assert.strictEqual(getTargetCount(), targetCount - 1);
    assert.strictEqual(currentURL(), urls.targets);
  });

  test('cannot cancel delete target via dialog', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const targetCount = getTargetCount();
    await visit(urls.targets);

    await click(`[href="${urls.target}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);
    await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

    assert.strictEqual(getTargetCount(), targetCount);
    assert.strictEqual(currentURL(), urls.target);
  });

  test('cannot delete target without proper authorization', async function (assert) {
    await visit(urls.targets);
    instances.target.authorized_actions =
      instances.target.authorized_actions.filter((item) => item !== 'delete');

    await click(`[href="${urls.target}"]`);

    assert
      .dom('.rose-layout-page-actions .rose-dropdown-button-danger')
      .doesNotExist();
  });

  test('deleting a target which errors displays error messages', async function (assert) {
    await visit(urls.targets);
    this.server.del('/targets/:id', () => {
      return new Response(
        490,
        {},
        {
          status: 490,
          code: 'error',
          message: 'Oops.',
        },
      );
    });

    await click(`[href="${urls.target}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_ACTION_SELECTOR);

    assert
      .dom('[data-test-toast-notification] .hds-alert__description')
      .hasText('Oops.');
  });
});
