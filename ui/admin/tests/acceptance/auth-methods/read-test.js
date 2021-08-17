import { module, test } from 'qunit';
import { visit, currentURL, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  authenticateSession,
  //   // These are left here intentionally for future reference.
  //   //currentSession,
  //   //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | auth methods | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    authMethod: null,
  };
  const urls = {
    orgScope: null,
    authMethods: null,
    newAuthMethod: null,
    authMethod: null,
  };

  hooks.beforeEach(function () {
    // Setup Mirage mock resources for this test
    authenticateSession({});
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.authMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
    });

    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.authMethods = `${urls.orgScope}/auth-methods`;
    urls.newAuthMethod = `${urls.authMethods}/new?type=password`;
    urls.authMethod = `${urls.authMethods}/${instances.authMethod.id}`;
  });

  test('visiting auth methods', async function (assert) {
    assert.expect(1);
    await visit(urls.authMethods);
    await a11yAudit();
    assert.equal(currentURL(), urls.authMethods);
  });

  test('can navigate to an auth method form', async function (assert) {
    assert.expect(1);
    await visit(urls.authMethods);
    await click('main tbody .rose-table-header-cell:nth-child(1) a');
    await a11yAudit();
    assert.equal(currentURL(), urls.authMethod);
  });

  test('cannot navigate to an auth method form without proper authorization', async function (assert) {
    assert.expect(1);
    instances.authMethod.authorized_actions =
      instances.authMethod.authorized_actions.filter((item) => item !== 'read');
    await visit(urls.authMethod);
    assert.notOk(find('main tbody .rose-table-header-cell:nth-child(1) a'));
  });
});
