/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | roles | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const MANAGE_DROPDOWN_SELECTOR = '.hds-dropdown-toggle-button';
  const DELETE_DROPDOWN_SELECTOR =
    '.hds-dropdown-list-item--color-critical button';

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    role: null,
  };
  const urls = {
    orgScope: null,
    roles: null,
    role: null,
    newRole: null,
  };

  hooks.beforeEach(async function () {
    await authenticateSession({});
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    // The project scope is not yet used for role tests (though it will be
    // in the future).  This is created simply to test the grant scope loading
    // mechanism.
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: instances.scopes.org.type },
    });
    instances.role = this.server.create(
      'role',
      {
        scope: instances.scopes.org,
      },
      'withPrincipals',
    );
    urls.roles = `/scopes/${instances.scopes.org.id}/roles`;
    urls.role = `${urls.roles}/${instances.role.id}`;
    urls.newRole = `${urls.roles}/new`;
  });

  test('can delete a role', async function (assert) {
    const rolesCount = this.server.db.roles.length;
    await visit(urls.role);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_DROPDOWN_SELECTOR);
    assert.strictEqual(this.server.db.roles.length, rolesCount - 1);
  });

  test('cannot delete a role without proper authorization', async function (assert) {
    instances.role.authorized_actions =
      instances.role.authorized_actions.filter((item) => item !== 'delete');
    await visit(urls.role);
    assert.notOk(
      find('.rose-layout-page-actions .rose-dropdown-button-danger'),
    );
  });

  test('errors are displayed when delete project fails', async function (assert) {
    this.server.del('/roles/:id', () => {
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
    await visit(urls.role);
    await click(MANAGE_DROPDOWN_SELECTOR);
    await click(DELETE_DROPDOWN_SELECTOR);
    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText('Oops.');
  });
});
