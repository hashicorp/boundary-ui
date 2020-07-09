import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';

module('Acceptance | users', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('org');
  });

  test('visiting users', async function (assert) {
    assert.expect(1);
    this.server.createList('user', 1);
    await visit('/orgs/1/users');
    await a11yAudit();
    assert.equal(currentURL(), '/orgs/1/users');
  });

  test('can create new users', async function (assert) {
    assert.expect(4);
    assert.equal(this.server.db.users.length, 0);
    await visit('/orgs/1/users/new');
    await fillIn('[name="name"]', 'User name');
    await click('[type="submit"]');
    assert.equal(currentURL(), '/orgs/1/users/1');
    assert.equal(this.server.db.users.length, 1);
    assert.equal(this.server.db.users[0].name, 'User name');
  });

  test('can cancel creation of a new user', async function (assert) {
    assert.expect(3);
    assert.equal(this.server.db.users.length, 0);
    await visit('/orgs/1/users/new');
    await fillIn('[name="name"]', 'User name');
    await click('.rose-form-actions [type="button"]');
    assert.equal(currentURL(), '/orgs/1/users');
    assert.equal(this.server.db.users.length, 0);
  });

  test('saving a new user with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.post('/orgs/:org_id/users', () => {
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
    await visit('/orgs/1/users/new');
    await fillIn('[name="name"]', 'User name');
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

  test('can save changes to an existing user', async function (assert) {
    assert.expect(2);
    this.server.createList('user', 1, { name: 'Test User' });
    await visit('/orgs/1/users/1');
    await fillIn('[name="name"]', 'Updated user name');
    await click('.rose-form-actions [type="submit"]');
    assert.equal(currentURL(), '/orgs/1/users/1');
    assert.equal(this.server.db.users[0].name, 'Updated user name');
  });

  test('can cancel changes to an existing user', async function (assert) {
    assert.expect(1);
    this.server.createList('user', 1, { name: 'Test User' });
    await visit('/orgs/1/users/1');
    await fillIn('[name="name"]', 'Unsaved user name');
    await click('.rose-form-actions [type="button"]');
    assert.equal(find('[name="name"]').value, 'Test User');
  });

  test('can delete an user', async function (assert) {
    assert.expect(2);
    this.server.createList('user', 1);
    assert.equal(this.server.db.users.length, 1);
    await visit('/orgs/1/users/1');
    await click('.rose-button-warning');
    assert.equal(this.server.db.users.length, 0);
  });

  test('saving an existing user with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.createList('user', 1);
    this.server.patch('/orgs/:org_id/users/:id', () => {
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
    await visit('/orgs/1/users/1');
    await fillIn('[name="name"]', 'User name');
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

  test('errors are displayed when saving user fails', async function (assert) {
    assert.expect(1);
    this.server.createList('user', 1);
    this.server.patch('/orgs/:org_id/users/:id', () => {
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
    await visit('/orgs/1/users/1');
    await fillIn('[name="name"]', 'User name');
    await click('[type="submit"]');
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'Oops.',
      'Displays primary error message.'
    );
  });

  test('errors are displayed when user deletion fails', async function (assert) {
    assert.expect(1);
    this.server.createList('user', 1);
    this.server.del('/orgs/:org_id/users/:id', () => {
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
    await visit('/orgs/1/users/1');
    await click('.rose-button-warning');
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'Oops.',
      'Displays primary error message.'
    );
  });
});
