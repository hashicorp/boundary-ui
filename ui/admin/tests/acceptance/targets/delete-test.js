/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { setupIntl } from 'ember-intl/test-support';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | targets | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);
  setupIndexedDb(hooks);
  setupIntl(hooks, 'en-us');

  let getTargetCount;

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
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const targetCount = getTargetCount();
    await visit(urls.targets);

    await click(commonSelectors.HREF(urls.target));
    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.MANAGE_DROPDOWN_DELETE);

    assert.strictEqual(getTargetCount(), targetCount - 1);
  });

  test('can accept delete target via dialog', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const targetCount = getTargetCount();
    await visit(urls.targets);

    await click(commonSelectors.HREF(urls.target));
    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.MANAGE_DROPDOWN_DELETE);
    await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('Deleted successfully.');
    assert.strictEqual(getTargetCount(), targetCount - 1);
    assert.strictEqual(currentURL(), urls.targets);
  });

  test('cannot cancel delete target via dialog', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const targetCount = getTargetCount();
    await visit(urls.targets);

    await click(commonSelectors.HREF(urls.target));
    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.MANAGE_DROPDOWN_DELETE);
    await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

    assert.strictEqual(getTargetCount(), targetCount);
    assert.strictEqual(currentURL(), urls.target);
  });

  test('cannot delete target without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.targets);
    instances.target.authorized_actions =
      instances.target.authorized_actions.filter((item) => item !== 'delete');

    await click(commonSelectors.HREF(urls.target));

    assert.dom(selectors.MANAGE_DROPDOWN_DELETE).doesNotExist();
  });

  test('deleting a target which errors displays error messages', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

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

    await click(commonSelectors.HREF(urls.target));
    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.MANAGE_DROPDOWN_DELETE);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText('Oops.');
  });
});
