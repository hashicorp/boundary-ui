/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { GRANT_SCOPE_THIS } from 'api/models/role';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | roles | project-scope', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  const instances = {
    scopes: {
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

  hooks.beforeEach(async function () {
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
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.role);

    await click(commonSelectors.HREF(urls.roleScopes));

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.dom(selectors.GRANT_SCOPE_ROW(GRANT_SCOPE_THIS)).isVisible();
    assert
      .dom(commonSelectors.TABLE_ROWS)
      .exists({ count: instances.role.grant_scope_ids.length });
  });

  test('search and pagination is not visible for project role scopes', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.role);

    await click(commonSelectors.HREF(urls.roleScopes));

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.dom(commonSelectors.SEARCH_INPUT).doesNotExist();
    assert.dom(commonSelectors.PAGINATION).doesNotExist();
  });

  test('user cannot manage scopes for project role scopes', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.role);

    await click(commonSelectors.HREF(urls.roleScopes));
    await click(selectors.MANAGE_DROPDOWN_ROLES);

    assert.dom(selectors.MANAGE_DROPDOWN_ROLES_SCOPES).doesNotExist();
  });

  test('user sees no scopes message without action when role has no grant scopes', async function (assert) {
    instances.role.update({ grant_scope_ids: [] });
    await visit(urls.role);

    await click(commonSelectors.HREF(urls.roleScopes));

    assert.dom(selectors.NO_SCOPES_MSG).includesText('No scopes added');
    assert.dom(selectors.NO_SCOPES_MSG_LINK).doesNotExist();
  });
});
