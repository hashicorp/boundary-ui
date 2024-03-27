/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | roles | create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

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
    orgScope: null,
  };

  hooks.beforeEach(function () {
    authenticateSession({});
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
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
  });

  test('can create new role', async function (assert) {
    const rolesCount = this.server.db.roles.length;
    await visit(urls.newRole);
    await fillIn('[name="name"]', 'role name');
    await click('[type="submit"]');
    assert.strictEqual(this.server.db.roles.length, rolesCount + 1);
  });

  test('Users can navigate to new roles route with proper authorization', async function (assert) {
    await visit(urls.roles);
    assert.ok(
      instances.scopes.org.authorized_collection_actions.roles.includes(
        'create',
      ),
    );
    assert.ok(find(`[href="${urls.newRole}"]`));
  });

  test('Users cannot navigate to new roles route without proper authorization', async function (assert) {
    instances.scopes.org.authorized_collection_actions.roles = [];
    await visit(urls.roles);
    assert.notOk(
      instances.scopes.org.authorized_collection_actions.roles.includes(
        'create',
      ),
    );
    assert.notOk(find(`[href="${urls.newRole}"]`));
  });

  test('can cancel new role creation', async function (assert) {
    const rolesCount = this.server.db.roles.length;
    await visit(urls.newRole);
    await fillIn('[name="name"]', 'role name');
    await click('.rose-form-actions [type="button"]');
    assert.strictEqual(currentURL(), urls.roles);
    assert.strictEqual(this.server.db.roles.length, rolesCount);
  });

  test('saving a new role with invalid fields displays error messages', async function (assert) {
    this.server.post('/roles', () => {
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
        },
      );
    });
    await visit(urls.newRole);
    await fillIn('[name="name"]', 'new target');
    await click('form [type="submit"]');
    await a11yAudit();
    assert.ok(find('[role="alert"]'));
    assert.ok(find('.hds-form-error__message'));
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
