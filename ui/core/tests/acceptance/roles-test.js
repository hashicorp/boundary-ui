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

  test('visiting a role', async function (assert) {
    assert.expect(1);
    await visit(urls.newRole);
    await a11yAudit();
    assert.equal(currentURL(), urls.newRole);
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

  test('can delete a role', async function (assert) {
    assert.expect(1);
    const rolesCount = this.server.db.roles.length;
    await visit(urls.role);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(this.server.db.roles.length, rolesCount - 1);
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
      instances.addPrincipals = urls.addPrincipals = `${urls.role}/add-principals`;
      urls.rolePrincipals = `${urls.role}/principals`;
      this.server.create('user', { scope: instances.scopes.org });
    });

    test('visiting role principals', async function (assert) {
      assert.expect(1);
      await visit(urls.rolePrincipals);
      await a11yAudit();
      assert.equal(currentURL(), urls.rolePrincipals);
    });

    test('principal can be removed from a role', async function (assert) {
      assert.expect(1);
      await visit(urls.rolePrincipals);
      await click('main tbody .rose-table-row:nth-child(1) .rose-table-cell:nth-child(4) .rose-dropdown-button-danger');
      const count = this.server.db.roles[0].userIds.length + this.server.db.roles[0].groupIds.length;
      assert.equal(count, principalsCount - 1);
    });

    test('select and save principals to add', async function (assert) {
      assert.expect(1);
      await visit(urls.addPrincipals);
      await click('main tbody .rose-table-cell:nth-child(1) [type="checkbox"]');
      await click('form [type="submit"]:not(:disabled)');
      const count = this.server.db.roles[0].userIds.length + this.server.db.roles[0].groupIds.length;
      assert.equal(count, principalsCount + 1);
    });

    test('select and cancel principals to add', async function (assert) {
      assert.expect(1);
      await visit(urls.addPrincipals);
      await click('main tbody .rose-table-cell:nth-child(1) [type="checkbox"]');
      await click('form button:not([type="submit"])');
      const count = this.server.db.roles[0].userIds.length + this.server.db.roles[0].groupIds.length;
      assert.equal(count, principalsCount);
    });
  });

  module('grants', function(hooks) {
    let grantsCount;

    hooks.beforeEach(function() {
      grantsCount = this.server.db.roles[0].grant_strings.length;
      urls.grants = `${urls.role}/grants`;
    });

    test('visiting role grants', async function (assert) {
      assert.expect(1);
      await visit(urls.grants);
      await a11yAudit();
      assert.equal(currentURL(), urls.grants);
    });

    test('update a grant', async function(assert) {
      assert.expect(1);
      this.server.post('/roles/:id', (_, { requestBody }) => {
        const attrs = JSON.parse(requestBody);
        assert.equal(attrs.grant_strings[0], 'id=123,action=delete', "attributes don't match the expected ones");
      });
      await visit(urls.grants);
      const grant = findAll('.rose-list-key-value:nth-child(1) [name="grant"]')[1];
      await fillIn(grant, 'id=123,action=delete');
      await click('form [type="submit"]:not(:disabled)');
    });

    test('cancel a grant update', async function(assert) {
      assert.expect(1);
      await visit(urls.grants);
      const grant = findAll('.rose-list-key-value:nth-child(1) [name="grant"]')[1];
      await fillIn(grant, 'id=123,action=delete');
      await click('form button:not([type="submit"])');
      const grantAfter = findAll('.rose-list-key-value:nth-child(1) [name="grant"]')[1];
      assert.notEqual(grant.value, grantAfter.value);
    });

    test('create a grant', async function(assert) {
      assert.expect(1);
      this.server.post('/roles/:id', (_, { requestBody }) => {
        const attrs = JSON.parse(requestBody);
        assert.equal(attrs.grant_strings.length, grantsCount + 1, "grants don't match the expected ones");
      });
      await visit(urls.grants);
      await fillIn('.rose-list-key-value:nth-child(1) [name="grant"]', 'id=123,action=delete');
      await click('.rose-list-key-value:nth-child(1) [type="submit"]:not(:disabled)');
      await click('form [type="submit"]:not(:disabled)');
    });

    test('cancel a grant creation', async function(assert) {
      assert.expect(1);
      await visit(urls.grants);
      const grantsBefore = findAll('.rose-list-key-value:nth-child(1) [name="grant"]').length;
      await fillIn('.rose-list-key-value:nth-child(1) [name="grant"]', 'id=123,action=delete');
      await click('.rose-list-key-value:nth-child(1) [type="submit"]:not(:disabled)');
      await click('form button:not([type="submit"])');
      const grantsAfter = findAll('.rose-list-key-value:nth-child(1) [name="grant"]').length;
      assert.equal(grantsBefore, grantsAfter);
    });

    test('delete a grant', async function(assert) {
      assert.expect(1);
      await visit(urls.grants);
      const grant = findAll('.rose-list-key-value:nth-child(1) button:not([type="submit"])')[0];
      const grantsBefore = findAll('.rose-list-key-value:nth-child(1) [name="grant"]').length;
      await click(grant);
      await click('form [type="submit"]:not(:disabled)');
      const grantsAfter = findAll('.rose-list-key-value:nth-child(1) [name="grant"]').length;
      assert.equal(grantsBefore - 1, grantsAfter);
    });

    test('cancel a grant deletion', async function(assert) {
      assert.expect(1);
      await visit(urls.grants);
      const grant = findAll('.rose-list-key-value:nth-child(1) button:not([type="submit"])')[0];
      const grantsBefore = findAll('.rose-list-key-value:nth-child(1) [name="grant"]').length;
      await click(grant);
      await click('.rose-form-actions button:not([type="submit"])');
      const grantsAfter = findAll('.rose-list-key-value:nth-child(1) [name="grant"]').length;
      assert.equal(grantsBefore, grantsAfter);
    });
  });
});
