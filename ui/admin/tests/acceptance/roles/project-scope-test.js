/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { GRANT_SCOPE_THIS } from 'api/models/role';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | roles | project-scope', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

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

  hooks.beforeEach(async function () {
    await authenticateSession({ username: 'admin' });
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

    await click(commonSelectors.HREF(urls.roleScopes));
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.dom(selectors.GRANT_SCOPE_ROW(GRANT_SCOPE_THIS)).isVisible();
    assert
      .dom(commonSelectors.TABLE_ROWS)
      .exists({ count: instances.role.grant_scope_ids.length });
  });

  test('search and pagination is not visible for project role scopes', async function (assert) {
    await visit(urls.role);

    await click(commonSelectors.HREF(urls.roleScopes));

    assert.strictEqual(currentURL(), urls.roleScopes);
    assert.dom(commonSelectors.SEARCH_INPUT).doesNotExist();
    assert.dom(commonSelectors.PAGINATION).doesNotExist();
  });

  test('user cannot manage scopes for project role scopes', async function (assert) {
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
