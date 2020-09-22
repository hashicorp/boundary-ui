import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn, find, findAll } from '@ember/test-helpers';
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
    await visit(urls.role);
    await fillIn('[name="name"]', 'Updated admin role');
    await click('.rose-form-actions [type="submit"]');
    assert.equal(currentURL(), urls.role);
    assert.equal(this.server.db.roles[0].name, 'Updated admin role');
  });

  test('can cancel changes to an existing role', async function (assert) {
    assert.expect(1);
    await visit(urls.role);
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
    this.server.patch('/roles/:id', () => {
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

  module('principals', function(hooks) {
    let principalsCount;

    hooks.beforeEach(function() {
      principalsCount = this.server.db.roles[0].userIds.length + this.server.db.roles[0].groupIds.length;
      urls.rolePrincipals = `${urls.role}/principals`;
      urls.addPrincipals = `${urls.role}/add-principals`;
    });

    test('visiting role principals', async function (assert) {
      assert.expect(2);
      await visit(urls.rolePrincipals);
      await a11yAudit();
      assert.equal(currentURL(), urls.rolePrincipals);
      assert.equal(findAll('tbody tr').length, principalsCount);
    });

    test('principal can be removed from a role', async function (assert) {
      assert.expect(2);
      await visit(urls.rolePrincipals);
      assert.equal(findAll('tbody tr').length, principalsCount);
      await click('tbody tr .rose-dropdown-button-danger');
      assert.equal(findAll('tbody tr').length, principalsCount - 1);
    });

    test('shows error message on principal remove', async function (assert) {
      assert.expect(2);
      this.server.post('/roles/:idMethod', () => {
        return new Response(
          400,
          {},
          {
            status: 400,
            code: 'invalid_argument',
            message: 'The request was invalid.',
            details: {},
          }
        );
      });
      await visit(urls.rolePrincipals);
      assert.equal(findAll('tbody tr').length, principalsCount);
      await click('tbody tr .rose-dropdown-button-danger');
      assert.ok(find('[role="alert"]'));
    });

    test('select and save principals to add', async function (assert) {
      assert.expect(3);
      instances.role.update({ userIds: [], groupIds: [] });
      await visit(urls.rolePrincipals);
      assert.equal(findAll('tbody tr').length, 0);
      await click('.rose-layout-page-actions a')
      assert.equal(currentURL(), urls.addPrincipals);
      await click('tbody label');
      await click('form [type="submit"]');
      await visit(urls.rolePrincipals);
      assert.equal(findAll('tbody tr').length, 1);
    });

    test('select and cancel principals to add', async function (assert) {
      assert.expect(4);
      await visit(urls.rolePrincipals);
      assert.equal(findAll('tbody tr').length, principalsCount);
      // Remove a principal to populate association view
      await click('tbody tr .rose-dropdown-button-danger');
      assert.equal(findAll('tbody tr').length, principalsCount - 1);
      await click('.rose-layout-page-actions a')
      assert.equal(currentURL(), urls.addPrincipals);
      await click('tbody label');
      await click('form [type="button"]');
      await visit(urls.rolePrincipals);
      assert.equal(findAll('tbody tr').length, principalsCount - 1);
    });

    test('shows error message on principal add', async function (assert) {
      assert.expect(1);
      this.server.post('/roles/:idMethod', () => {
        return new Response(
          400,
          {},
          {
            status: 400,
            code: 'invalid_argument',
            message: 'The request was invalid.',
            details: {},
          }
        );
      });
      instances.role.update({ userIds: [], groupIds: [] });
      await visit(urls.addPrincipals);
      await click('tbody label');
      await click('form [type="submit"]');
      assert.ok(find('[role="alert"]'));
    });
  });

  module('grants', function(hooks) {
    let grantsCount;
    const newGrantForm = 'form:nth-child(1)',
      grantsForm = 'form:nth-child(2)';

    hooks.beforeEach(function() {
      grantsCount = this.server.db.roles[0].grant_strings.length;
      urls.grants = `${urls.role}/grants`;
    });

    test('visiting role grants', async function (assert) {
      assert.expect(2);
      await visit(urls.grants);
      await a11yAudit();
      assert.equal(currentURL(), urls.grants);
      assert.equal(findAll(`${grantsForm} [name="grant"]`).length, grantsCount);
    });

    test('update a grant', async function(assert) {
      assert.expect(1);
      this.server.post('/roles/:id', (_, { requestBody }) => {
        const attrs = JSON.parse(requestBody);
        assert.equal(attrs.grant_strings[0], 'id=123,action=delete', "A grant is updated");
      });
      await visit(urls.grants);
      await fillIn(`${grantsForm} [name="grant"]`, 'id=123,action=delete');
      await click('.rose-form-actions [type="submit"]:not(:disabled)');
    });

    test('cancel a grant update', async function(assert) {
      assert.expect(1);
      await visit(urls.grants);
      await fillIn(`${grantsForm} [name="grant"]`, 'id=123,action=delete');
      await click('.rose-form-actions button:not([type="submit"])');
      assert.notEqual(find(`${grantsForm} [name="grant"]`).value, 'id=123,action=delete');
    });

    test('shows error message on grant update', async function (assert) {
      assert.expect(2);
      this.server.post('/roles/:idMethod', () => {
        return new Response(
          400,
          {},
          {
            status: 400,
            code: 'invalid_argument',
            message: 'The request was invalid.',
            details: {},
          }
        );
      });
      await visit(urls.grants);
      assert.equal(findAll(`${grantsForm} [name="grant"]`).length, 
      grantsCount);
      await fillIn(`${grantsForm} [name="grant"]`, 'id=123,action=delete');
      await click('.rose-form-actions [type="submit"]:not(:disabled)');
      assert.ok(find('[role="alert"]'));
    });

    test('create a grant', async function(assert) {
      assert.expect(1);
      this.server.post('/roles/:id', (_, { requestBody }) => {
        const attrs = JSON.parse(requestBody);
        assert.equal(attrs.grant_strings.length, grantsCount + 1, "A grant is created");
      });
      await visit(urls.grants);
      await fillIn(`${newGrantForm} [name="grant"]`, 'id=123,action=delete');
      await click(`${newGrantForm} [type="submit"]:not(:disabled)`);
      await click('.rose-form-actions [type="submit"]:not(:disabled)');
    });

    test('cancel a grant creation', async function(assert) {
      assert.expect(1);
      await visit(urls.grants);
      await fillIn(`${newGrantForm} [name="grant"]`, 'id=123,action=delete');
      await click(`${newGrantForm} [type="submit"]:not(:disabled)`);
      await click('.rose-form-actions button:not([type="submit"])');
      assert.notOk(find(`${newGrantForm} [name="grant"]`).value);
    });

    test('shows error message on grant create', async function (assert) {
      assert.expect(2);
      this.server.post('/roles/:idMethod', () => {
        return new Response(
          400,
          {},
          {
            status: 400,
            code: 'invalid_argument',
            message: 'The request was invalid.',
            details: {},
          }
        );
      });
      await visit(urls.grants);
      assert.equal(findAll(`${grantsForm} [name="grant"]`).length, 
      grantsCount);
      await fillIn(`${newGrantForm} [name="grant"]`, 'id=123,action=delete');
      await click(`${newGrantForm} [type="submit"]:not(:disabled)`);
      await click('.rose-form-actions [type="submit"]:not(:disabled)');
      assert.ok(find('[role="alert"]'));
    });

    test('delete a grant', async function(assert) {
      assert.expect(1);
      await visit(urls.grants);
      await click(`${grantsForm} button:not([type="submit"])`);
      await click('.rose-form-actions [type="submit"]:not(:disabled)');
      assert.equal(findAll(`${grantsForm} [name="grant"]`).length, 
      grantsCount - 1);
    });

    test('cancel a grant remove', async function(assert) {
      assert.expect(1);
      await visit(urls.grants);
      await click(`${grantsForm} button`);
      await click('.rose-form-actions button:not([type="submit"])');
      assert.equal(findAll(`${grantsForm} [name="grant"]`).length, grantsCount);
    });

    test('shows error message on grant remove', async function (assert) {
      assert.expect(2);
      this.server.post('/roles/:idMethod', () => {
        return new Response(
          400,
          {},
          {
            status: 400,
            code: 'invalid_argument',
            message: 'The request was invalid.',
            details: {},
          }
        );
      });
      await visit(urls.grants);
      assert.equal(findAll(`${grantsForm} [name="grant"]`).length, 
      grantsCount);
      await click(`${grantsForm} button:not([type="submit"])`);
      await click('.rose-form-actions [type="submit"]:not(:disabled)');
      assert.ok(find('[role="alert"]'));
    });
  });
});
