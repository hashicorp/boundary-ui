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

  let orgScope;
  let rolesURL;
  let roleURL;
  let newRoleURL;

  hooks.beforeEach(function () {
    orgScope = this.server.create(
      'scope',
      {
        type: 'org',
      },
      'withChildren'
    );

    const role = this.server.create('role', {
      scope: {
        id: orgScope.id,
        type: orgScope.type,
      },
    });

    rolesURL = `/scopes/${orgScope.id}/roles`;
    roleURL = `${rolesURL}/${role.id}`;
    newRoleURL = `${rolesURL}/new`;

    authenticateSession({});
  });

  test('visiting roles', async function (assert) {
    assert.expect(1);
    await visit(rolesURL);
    await a11yAudit();
    assert.equal(currentURL(), rolesURL);
  });

  test('visiting a role', async function (assert) {
    assert.expect(1);
    await visit(newRoleURL);
    await a11yAudit();
    assert.equal(currentURL(), newRoleURL);
  });

  test('can create new role', async function (assert) {
    assert.expect(1);
    const rolesCount = this.server.db.roles.length;
    await visit(newRoleURL);
    await fillIn('[name="name"]', 'role name');
    await click('[type="submit"]');
    assert.equal(this.server.db.roles.length, rolesCount + 1);
  });

  test('can cancel new role creation', async function (assert) {
    assert.expect(2);
    const rolesCount = this.server.db.roles.length;
    await visit(newRoleURL);
    await fillIn('[name="name"]', 'role name');
    await click('.rose-form-actions [type="button"]');
    assert.equal(currentURL(), rolesURL);
    assert.equal(this.server.db.roles.length, rolesCount);
  });

  test('saving a new role with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.post('/scopes/:scope_id/roles', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {
            fields: [
              {
                name: 'name',
                message: 'Name is required.',
              },
            ],
          },
        }
      );
    });
    await visit(newRoleURL);
    await fillIn('[name="name"]', 'role name');
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

  test('can save changes to an existing role', async function (assert) {
    assert.expect(2);
    await visit(roleURL);
    await fillIn('[name="name"]', 'Updated admin role');
    await click('.rose-form-actions [type="submit"]');
    assert.equal(currentURL(), roleURL);
    assert.equal(this.server.db.roles[0].name, 'Updated admin role');
  });

  test('can cancel changes to an existing role', async function (assert) {
    assert.expect(1);
    await visit(roleURL);
    await fillIn('[name="name"]', 'Updated admin role');
    await click('.rose-form-actions [type="button"]');
    assert.notEqual(find('[name="name"]').value, 'Updated admin role');
  });

  test('can delete a role', async function (assert) {
    assert.expect(1);
    const rolesCount = this.server.db.roles.length;
    await visit(roleURL);
    await click('.rose-button-warning');
    assert.equal(this.server.db.roles.length, rolesCount - 1);
  });

  test('saving an existing role with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.patch('/scopes/:scope_id/roles/:id', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {
            fields: [
              {
                name: 'name',
                message: 'Name is required.',
              },
            ],
          },
        }
      );
    });
    await visit(roleURL);
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

  test('errors are displayed when save project fails', async function (assert) {
    assert.expect(1);
    this.server.patch('/scopes/:scope_id/roles/:id', () => {
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
    await visit(roleURL);
    await fillIn('[name="name"]', 'Role name');
    await click('[type="submit"]');
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'Oops.',
      'Displays primary error message.'
    );
  });

  test('errors are displayed when delete project fails', async function (assert) {
    assert.expect(1);
    this.server.del('/scopes/:scope_id/roles/:id', () => {
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
    await visit(roleURL);
    await click('.rose-button-warning');
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'Oops.',
      'Displays primary error message.'
    );
  });

  test('principals may be viewed in principals tab', async function (assert) {
    assert.expect(0);
  });

  test('grants can be updated and saved or canceled', async function (assert) {
    assert.expect(0);
  });

  test('grants can be removed and saved or canceled', async function (assert) {
    assert.expect(0);
  });

  test('new grants can be added and saved or canceled', async function (assert) {
    assert.expect(0);
  });
});
