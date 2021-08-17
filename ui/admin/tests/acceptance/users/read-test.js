import { module, test } from 'qunit';
import { visit, currentURL, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | users | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let orgScope;
  let usersURL;

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
    authenticateSession({});
  });

  test('visiting users', async function (assert) {
    assert.expect(1);
    await visit(usersURL);
    await a11yAudit();
    assert.equal(currentURL(), usersURL);
  });

  test('cannot navigate to an account form without proper authorization', async function (assert) {
    assert.expect(1);
    instances.user.authorized_actions =
      instances.user.authorized_actions.filter((item) => item !== 'read');
    await visit(usersURL);
    assert.notOk(find('main tbody .rose-table-header-cell:nth-child(1) a'));
  });
});
