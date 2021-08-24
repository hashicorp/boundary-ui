import { module, test } from 'qunit';
import { visit, currentURL, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | credential-stores | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
  };

  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    credentialStores: null,
    credentialStore: null,
    unknownCredentialStore: null,
    newCredentialStore: null,
  };

  hooks.beforeEach(function () {
    // Generate resources
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.credentialStore = this.server.create('credential-store', {
      scope: instances.scopes.project,
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.credentialStores = `${urls.projectScope}/credential-stores`;
    urls.credentialStore = `${urls.credentialStores}/${instances.credentialStore.id}`;
    urls.unknownCredentialStore = `${urls.credentialStores}/foo`;
    urls.newCredentialStore = `${urls.credentialStores}/new`;
    authenticateSession({});
  });

  test('visiting /credential-stores', async function (assert) {
    assert.expect(2);
    await visit(urls.credentialStores);
    await a11yAudit();
    assert.equal(currentURL(), urls.credentialStores);
    await visit(urls.credentialStore);
    await a11yAudit();
    assert.equal(currentURL(), urls.credentialStore);
  });

  test('cannot navigate to a credential store form without proper authorization', async function (assert) {
    assert.expect(1);
    instances.credentialStore.authorized_actions =
      instances.credentialStore.authorized_actions.filter(
        (item) => item !== 'read'
      );
    await visit(urls.credentialStores);
    assert.notOk(find('main tbody .rose-table-header-cell:nth-child(1) a'));
  });

  test('visiting an unknown credential store display 404 message', async function (assert) {
    assert.expect(1);
    await visit(urls.unknownCredentialStore);
    await a11yAudit();
    assert.equal(
      find('.rose-message-subtitle').textContent.trim(),
      'Error 404'
    );
  });
});
