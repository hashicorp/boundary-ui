import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | users | create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let orgScope;
  let orgURL;
  let usersURL;
  let newUserURL;

  hooks.beforeEach(function () {
    orgScope = this.server.create(
      'scope',
      {
        type: 'org',
        scope: { id: 'global', type: 'global' },
      },
      'withChildren'
    );

    orgURL = `/scopes/${orgScope.id}`;
    usersURL = `/scopes/${orgScope.id}/users`;
    newUserURL = `${usersURL}/new`;

    authenticateSession({});
  });

  test('can create new users', async function (assert) {
    assert.expect(1);
    const usersCount = this.server.db.users.length;
    await visit(newUserURL);
    await fillIn('[name="name"]', 'User name');
    await click('[type="submit"]');
    assert.equal(this.server.db.users.length, usersCount + 1);
  });

  test('can navigate to new users route with proper authorization', async function (assert) {
    assert.expect(2);
    await visit(orgURL);
    assert.ok(orgScope.authorized_collection_actions.users.includes('create'));
    assert.ok(find(`[href="${orgURL}/users"]`));
  });

  test('cannot navigate to new users route without proper authorization', async function (assert) {
    assert.expect(2);
    orgScope.authorized_collection_actions.users = [];
    await visit(orgURL);
    assert.notOk(
      orgScope.authorized_collection_actions.users.includes('create')
    );
    assert.notOk(find(`[href="${orgURL}/users"]`));
  });

  test('can cancel creation of a new user', async function (assert) {
    assert.expect(2);
    const usersCount = this.server.db.users.length;
    await visit(newUserURL);
    await fillIn('[name="name"]', 'User name');
    await click('.rose-form-actions [type="button"]');
    assert.equal(currentURL(), usersURL);
    assert.equal(this.server.db.users.length, usersCount);
  });

  test('saving a new user with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.post('/users', () => {
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
    await visit(newUserURL);
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
});
