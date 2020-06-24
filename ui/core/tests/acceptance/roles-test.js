import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';

module('Acceptance | roles', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('org');
  });

  test('visiting roles', async function (assert) {
    assert.expect(1);
    await visit('/orgs/1/roles');
    await a11yAudit();
    assert.equal(currentURL(), '/orgs/1/roles');
  });

  test('can create new role', async function (assert) {
    assert.expect(4);
    assert.equal(this.server.db.roles.length, 0);
    await visit('/orgs/1/roles/new');
    await fillIn('[name="name"]', 'role name');
    await click('[type="submit"]');
    assert.equal(currentURL(), '/orgs/1/roles/1');
    assert.equal(this.server.db.roles.length, 1);
    assert.equal(this.server.db.roles[0].name, 'role name');
  });

  test('can cancel new role creation', async function (assert) {
    assert.expect(3);
    assert.equal(this.server.db.roles.length, 0);
    await visit('/orgs/1/roles/new');
    await fillIn('[name="name"]', 'role name');
    await click('.rose-form-actions [type="button"]');
    assert.equal(currentURL(), '/orgs/1/roles');
    assert.equal(this.server.db.roles.length, 0);
  });

  test('saving a new role with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.post('/orgs/:org_id/roles', () => {
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
    await visit('/orgs/1/roles/new');
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
    this.server.createList('role', 1, {name: 'Admin role'});
    await visit('/orgs/1/roles/1');
    await fillIn('[name="name"]', 'Updated admin role');
    await click('.rose-form-actions [type="submit"]');
    assert.equal(currentURL(), '/orgs/1/roles/1');
    assert.equal(this.server.db.roles[0].name, 'Updated admin role');
  });

  test('can cancel changes to an existing role', async function (assert) {
    assert.expect(1);
    this.server.createList('role', 1, {name: 'Admin role'});
    await visit('/orgs/1/roles/1');
    await fillIn('[name="name"]', 'Updated admin role');
    await click('.rose-form-actions [type="button"]');
    assert.equal(find('[name="name"]').value, 'Admin role');
  });

  test('can delete a role', async function(assert) {
    assert.expect(2);
    this.server.createList('role', 1);
    assert.equal(this.server.db.roles.length, 1);
    await visit('/orgs/1/roles/1');
    await click('.rose-button-warning');
    assert.equal(this.server.db.roles.length, 0);
  });

  test('saving an existing role with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.createList('role', 1);
    this.server.patch('/orgs/:org_id/roles/:id', () => {
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
    await visit('/orgs/1/roles/1');
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
    this.server.createList('role', 1);
    this.server.patch('/orgs/:org_id/roles/:id', () => {
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
    await visit('/orgs/1/roles/1');
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
    this.server.createList('role', 1);
    this.server.del('/orgs/:org_id/roles/:id', () => {
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
    await visit('/orgs/1/roles/1');
    await click('.rose-button-warning');
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'Oops.',
      'Displays primary error message.'
    );
  });
});
