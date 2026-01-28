/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { Response } from 'miragejs';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | roles | create', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  let getRolesCount;

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
    newRole: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.org = this.server.create(
      'scope',
      {
        type: 'org',
        scope: { id: 'global', type: 'global' },
      },
      'withChildren',
    );

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
    getRolesCount = () => this.server.schema.roles.all().models.length;
  });

  test('can create new role', async function (assert) {
    const rolesCount = getRolesCount();
    await visit(urls.newRole);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(getRolesCount(), rolesCount + 1);
  });

  test('Users can navigate to new roles route with proper authorization', async function (assert) {
    await visit(urls.roles);

    assert.ok(
      instances.scopes.org.authorized_collection_actions.roles.includes(
        'create',
      ),
    );
    assert.dom(selectors.NEW_ROLE_BTN).isVisible();
    assert.dom(commonSelectors.SIDEBAR_NAV_LINK(urls.roles)).isVisible();
    assert.dom(commonSelectors.HREF(urls.newRole)).isVisible();
  });

  test('Users cannot navigate to new roles route without proper authorization', async function (assert) {
    instances.scopes.org.authorized_collection_actions.roles = [];
    await visit(urls.roles);

    assert.notOk(
      instances.scopes.org.authorized_collection_actions.roles.includes(
        'create',
      ),
    );
    assert.dom(selectors.NEW_ROLE_BTN).doesNotExist();
    assert.dom(commonSelectors.SIDEBAR_NAV_LINK(urls.roles)).doesNotExist();
    assert.dom(commonSelectors.HREF(urls.newRole)).doesNotExist();
  });

  test('can cancel new role creation', async function (assert) {
    const rolesCount = getRolesCount();
    await visit(urls.newRole);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.roles);
    assert.strictEqual(getRolesCount(), rolesCount);
  });

  test('saving a new role with invalid fields displays error messages', async function (assert) {
    const errorMsg =
      'Invalid request. Request attempted to make second resource with the same field value that must be unique.';
    this.server.post('/roles', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: errorMsg,
          details: {
            request_fields: [
              {
                name: 'name',
                description: errorMsg,
              },
            ],
          },
        },
      );
    });
    await visit(urls.newRole);

    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(errorMsg);
  });

  test('users cannot directly navigate to new role route without proper authorization', async function (assert) {
    instances.scopes.org.authorized_collection_actions.roles =
      instances.scopes.org.authorized_collection_actions.roles.filter(
        (item) => item !== 'create',
      );

    await visit(urls.newRole);

    assert.false(
      instances.scopes.org.authorized_collection_actions.roles.includes(
        'create',
      ),
    );
    assert.strictEqual(currentURL(), urls.roles);
  });
});
