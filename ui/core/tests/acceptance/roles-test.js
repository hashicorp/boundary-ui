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
    instances.role = this.server.create('role', {
      scope: instances.scopes.org,
    }, 'withPrincipals');
    urls.roles = `/scopes/${instances.scopes.org.id}/roles`;
    urls.role = `${urls.roles}/${instances.role.id}`;
    urls.newRole = `${urls.roles}/new`;
  });

  test('visiting roles', async function (assert) {
    assert.expect(1);
    await visit(urls.roles);
    await a11yAudit();
    assert.equal(currentURL(), urls.roles);
  });

  test('can navigate to a role form', async function (assert) {
    assert.expect(1);
    await visit(urls.roles);
    await click('main tbody .rose-table-header-cell:nth-child(1) a');
    await a11yAudit();
    assert.equal(currentURL(), urls.role);
  });

  test('can save changes to an existing role', async function (assert) {
    assert.expect(2);
    await visit(urls.role);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'Updated admin role');
    await click('.rose-form-actions [type="submit"]');
    assert.equal(currentURL(), urls.role);
    assert.equal(this.server.db.roles[0].name, 'Updated admin role');
  });

  test('can cancel changes to an existing role', async function (assert) {
    assert.expect(1);
    await visit(urls.role);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'Updated admin role');
    await click('.rose-form-actions [type="button"]');
    assert.notEqual(find('[name="name"]').value, 'Updated admin role');
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

  test('can delete a role', async function (assert) {
    assert.expect(1);
    const rolesCount = this.server.db.roles.length;
    await visit(urls.role);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(this.server.db.roles.length, rolesCount - 1);
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

  test('saving an existing role with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.patch('/roles/:id', () => {
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
    await visit(urls.role);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'The request was invalid.',
      'Displays primary error message.'
    );
    assert.ok(
      find('.rose-form-error-message').textContent.trim(),
      'Name is required.',
      'Displays field-level errors.'
    );
  });

  test('errors are displayed when delete project fails', async function (assert) {
    assert.expect(1);
    this.server.del('/roles/:id', () => {
      return new Response(
        490,
        {},
        {
          status: 490,
          code: 'error',
          message: 'Oops.',
        }
      );
    });
    await visit(urls.role);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'Oops.',
      'Displays primary error message.'
    );
  });
});
