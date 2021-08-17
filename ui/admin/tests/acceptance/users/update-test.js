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

module('Acceptance | users', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let orgScope;
  let usersURL;
  let userURL;

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    user: null,
  };

  hooks.beforeEach(function () {
    orgScope = this.server.create(
      'scope',
      {
        type: 'org',
      },
      'withChildren'
    );

    instances.user = this.server.create('user', {
      scope: orgScope,
    });

    usersURL = `/scopes/${orgScope.id}/users`;
    userURL = `${usersURL}/${instances.user.id}`;

    authenticateSession({});
  });
  test('can save changes to an existing user', async function (assert) {
    assert.expect(2);
    await visit(userURL);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'Updated user name');
    await click('.rose-form-actions [type="submit"]');
    assert.equal(currentURL(), userURL);
    assert.equal(this.server.db.users[0].name, 'Updated user name');
  });

  test('cannot make changes to an existing user without proper authorization', async function (assert) {
    assert.expect(1);
    instances.user.authorized_actions =
      instances.user.authorized_actions.filter((item) => item !== 'update');
    await visit(userURL);
    assert.notOk(find('.rose-layout-page-actions .rose-button-secondary'));
  });

  test('can cancel changes to an existing user', async function (assert) {
    assert.expect(1);
    await visit(userURL);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'Unsaved user name');
    await click('.rose-form-actions [type="button"]');
    assert.notEqual(find('[name="name"]').value, 'Unsaved user name');
  });

  test('saving an existing user with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.patch('/users/:id', () => {
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
    await visit(userURL);
    await click('form [type="button"]', 'Activate edit mode');
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
