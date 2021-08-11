import { module, test } from 'qunit';
import { visit, click, find } from '@ember/test-helpers';
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
    //instances.user = this.server.schema.users.all().models[0];
    usersURL = `/scopes/${orgScope.id}/users`;
    userURL = `${usersURL}/${instances.user.id}`;

    authenticateSession({});
  });

  test('can delete an user', async function (assert) {
    assert.expect(1);
    const usersCount = this.server.db.users.length;
    await visit(userURL);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(this.server.db.users.length, usersCount - 1);
  });

  test('cannot delete a user without proper authorization', async function (assert) {
    assert.expect(1);
    instances.user.authorized_actions =
      instances.user.authorized_actions.filter((item) => item !== 'delete');
    await visit(userURL);
    assert.notOk(
      find('.rose-layout-page-actions .rose-dropdown-button-danger')
    );
  });

  test('errors are displayed when user deletion fails', async function (assert) {
    assert.expect(1);
    this.server.del('/users/:id', () => {
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
    await visit(userURL);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'Oops.',
      'Displays primary error message.'
    );
  });
});
