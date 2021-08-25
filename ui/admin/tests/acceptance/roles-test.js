import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | roles', function (hooks) {
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
    orgScope: null,
    roles: null,
    role: null,
    newRole: null,
  };

  hooks.beforeEach(function () {
    authenticateSession({});
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
      'withPrincipals'
    );
    urls.roles = `/scopes/${instances.scopes.org.id}/roles`;
    urls.role = `${urls.roles}/${instances.role.id}`;
    urls.newRole = `${urls.roles}/new`;
  });

  test('can create new role', async function (assert) {
    assert.expect(1);
    const rolesCount = this.server.db.roles.length;
    await visit(urls.newRole);
    await fillIn('[name="name"]', 'role name');
    await click('[type="submit"]');
    assert.equal(this.server.db.roles.length, rolesCount + 1);
  });

  test('can cancel new role creation', async function (assert) {
    assert.expect(2);
    const rolesCount = this.server.db.roles.length;
    await visit(urls.newRole);
    await fillIn('[name="name"]', 'role name');
    await click('.rose-form-actions [type="button"]');
    assert.equal(currentURL(), urls.roles);
    assert.equal(this.server.db.roles.length, rolesCount);
  });

  test('saving a new role with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
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
        }
      );
    });
    await visit(urls.newRole);
    await fillIn('[name="name"]', 'new target');
    await click('form [type="submit"]');
    await a11yAudit();
    assert.ok(find('[role="alert"]'));
    assert.ok(find('.rose-form-error-message'));
  });
});
