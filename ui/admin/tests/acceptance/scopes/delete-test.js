/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { Response } from 'miragejs';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | scopes | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  let getScopeCount;
  let confirmService;

  const instances = {
    scopes: {
      org: null,
      project: null,
    },
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    orgScopeEdit: null,
    projectScope: null,
    projectScopeEdit: null,
  };

  hooks.beforeEach(async function () {
    // Generate resources
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.orgScopeEdit = `/scopes/${instances.scopes.org.id}/edit`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    // Generate resource counter
    getScopeCount = (type) => this.server.schema.scopes.where({ type }).length;
    confirmService = this.owner.lookup('service:confirm');
  });

  test('can delete scope', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const orgScopeCount = getScopeCount('org');
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.orgScopeEdit));
    await click(selectors.MANAGE_PROJECTS_DROPDOWN);
    await click(selectors.MANAGE_PROJECTS_DROPDOWN_DELETE);

    assert.strictEqual(getScopeCount('org'), orgScopeCount - 1);
  });

  test('cannot delete scope without proper authorization', async function (assert) {
    instances.scopes.org.update({
      authorized_actions: instances.scopes.org.authorized_actions.filter(
        (item) => item !== 'delete',
      ),
    });
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.orgScopeEdit));

    assert.false(instances.scopes.org.authorized_actions.includes('delete'));
    assert.dom(selectors.MANAGE_PROJECTS_DROPDOWN).doesNotExist();
  });

  test('can accept delete scope via dialog', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    confirmService.enabled = true;
    const orgScopeCount = getScopeCount('org');
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.orgScopeEdit));
    await click(selectors.MANAGE_PROJECTS_DROPDOWN);
    await click(selectors.MANAGE_PROJECTS_DROPDOWN_DELETE);
    await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN);

    assert.strictEqual(getScopeCount('org'), orgScopeCount - 1);
    assert.strictEqual(currentURL(), urls.globalScope);
  });

  test('can cancel delete scope via dialog', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    confirmService.enabled = true;
    const orgScopeCount = getScopeCount('org');
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.orgScopeEdit));
    await click(selectors.MANAGE_PROJECTS_DROPDOWN);
    await click(selectors.MANAGE_PROJECTS_DROPDOWN_DELETE);
    await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

    assert.strictEqual(getScopeCount('org'), orgScopeCount);
    assert.strictEqual(currentURL(), urls.orgScopeEdit);
  });

  test('deleting a scope which errors displays error messages', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.orgScope);
    this.server.del('/scopes/:id', () => {
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

    await click(commonSelectors.HREF(urls.orgScopeEdit));
    await click(selectors.MANAGE_PROJECTS_DROPDOWN);
    await click(selectors.MANAGE_PROJECTS_DROPDOWN_DELETE);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText('Oops.');
  });
});
