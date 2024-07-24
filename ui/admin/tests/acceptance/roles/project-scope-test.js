/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { GRANT_SCOPE_THIS } from 'api/models/role';

module('Acceptance | roles | project-scope', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const GRANT_SCOPE_ROW_SELECTOR = (id) =>
    `tbody [data-test-grant-scope-row="${id}"]`;
  const TABLE_ROW_SELECTOR = 'tbody tr';
  const MANAGE_DROPDOWN_SELECTOR = '.hds-dropdown-toggle-button';
  const MANAGE_SCOPES_SELECTOR = '[data-test-manage-dropdown-scopes]';
  const SEARCH_INPUT_SELECTOR = '.search-filtering [type="search"]';
  const NO_SCOPES_MSG_SELECTOR = '.role-grant-scopes div';
  const NO_SCOPES_MSG_LINK_SELECTOR =
    '.role-grant-scopes div div:nth-child(3) a';

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    role: null,
  };
  const urls = {
    roles: null,
    role: null,
    roleScopes: null,
  };

  hooks.beforeEach(function () {
    authenticateSession({});
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.role = this.server.create('role', {
      scope: instances.scopes.project,
    });

    urls.roles = `/scopes/${instances.scopes.project.id}/roles`;
    urls.role = `${urls.roles}/${instances.role.id}`;
    urls.roleScopes = `${urls.role}/scopes`;
    urls.manageScopes = `${urls.role}/manage-scopes`;
  });

  test('visiting role scopes', async function (assert) {
    await visit(urls.role);

    await click(`[href="${urls.roleScopes}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.dom(GRANT_SCOPE_ROW_SELECTOR(GRANT_SCOPE_THIS)).isVisible();
    assert
      .dom(TABLE_ROW_SELECTOR)
      .exists({ count: instances.role.grant_scope_ids.length });
  });

  test('search is not visible for project role scopes', async function (assert) {
    await visit(urls.role);

    await click(`[href="${urls.roleScopes}"]`);

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.dom(SEARCH_INPUT_SELECTOR).doesNotExist();
  });

  test('user cannot manage scopes for project role scopes', async function (assert) {
    await visit(urls.role);

    await click(`[href="${urls.roleScopes}"]`);
    await click(MANAGE_DROPDOWN_SELECTOR);

    assert.dom(MANAGE_SCOPES_SELECTOR).doesNotExist();
  });

  test('user sees no scopes message without action when role has no grant scopes', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    await visit(urls.role);

    await click(`[href="${urls.roleScopes}"]`);

    assert.dom(NO_SCOPES_MSG_SELECTOR).includesText('No scopes added');
    assert.dom(NO_SCOPES_MSG_LINK_SELECTOR).doesNotExist();
  });
});
