import { module, test } from 'qunit';
import { visit, currentURL, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | roles | read', function (hooks) {
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
    instances.role = this.server.create(
      'role',
      {
        scope: instances.scopes.org,
      },
      'withPrincipals'
    );
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

  test('cannot navigate to a role form without proper authorization', async function (assert) {
    assert.expect(1);
    instances.role.authorized_actions =
      instances.role.authorized_actions.filter((item) => item !== 'read');
    await visit(urls.roles);
    assert.notOk(find('main tbody .rose-table-header-cell:nth-child(1) a'));
  });
});
