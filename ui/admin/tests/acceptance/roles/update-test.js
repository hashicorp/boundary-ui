/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | roles | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);

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

  test('can save changes to an existing role', async function (assert) {
    await visit(urls.role);

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.role);
    assert.strictEqual(
      this.server.schema.roles.all().models[0].name,
      commonSelectors.FIELD_NAME_VALUE,
    );
  });

  test('cannot make changes to an existing role without proper authorization', async function (assert) {
    instances.role.authorized_actions =
      instances.role.authorized_actions.filter((item) => item !== 'update');
    await visit(urls.role);

    assert.dom(commonSelectors.EDIT_BTN).doesNotExist();
  });

  test('can cancel changes to an existing role', async function (assert) {
    await visit(urls.role);

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.notEqual(
      this.server.schema.roles.all().models[0].name,
      commonSelectors.FIELD_NAME_VALUE,
    );
  });

  test('saving an existing role with invalid fields displays error messages', async function (assert) {
    const errorMessage = 'Error in provided request.';
    const errorDescription = 'Must be all lowercase.';
    this.server.patch('/roles/:id', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: errorMessage,
          details: {
            request_fields: [
              {
                name: 'name',
                description: errorDescription,
              },
            ],
          },
        },
      );
    });
    await visit(urls.role);
    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(errorMessage);
    assert.dom(commonSelectors.FIELD_NAME_ERROR).hasText(errorDescription);
  });
});
