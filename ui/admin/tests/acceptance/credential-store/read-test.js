import { module, test } from 'qunit';
import { visit, click, currentURL, find } from '@ember/test-helpers';
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
    staticCredentialStore: null,
    vaultCredentialStore: null,
  };

  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    credentialStores: null,
    staticCredentialStore: null,
    vaultCredentialStore: null,
    unknownCredentialStore: null,
  };

  hooks.beforeEach(async function () {
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
    instances.staticCredentialStore = this.server.create('credential-store', {
      scope: instances.scopes.project,
      type: 'static',
    });
    instances.vaultCredentialStore = this.server.create('credential-store', {
      scope: instances.scopes.project,
      type: 'vault',
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.credentialStores = `${urls.projectScope}/credential-stores`;
    urls.staticCredentialStore = `${urls.credentialStores}/${instances.staticCredentialStore.id}`;
    urls.vaultCredentialStore = `${urls.credentialStores}/${instances.vaultCredentialStore.id}`;
    urls.unknownCredentialStore = `${urls.credentialStores}/foo`;
    
    authenticateSession({});
    await visit(urls.credentialStores);
  });

  test('visiting static credential store', async function (assert) {
    assert.expect(2);
    await click(`[href="${urls.credentialStores}"]`);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.credentialStores);

    await click(`[href="${urls.staticCredentialStore}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.staticCredentialStore);
  });

  test('visiting vault credential store', async function (assert) {
    assert.expect(2);
    await click(`[href="${urls.credentialStores}"]`);
    assert.strictEqual(currentURL(), urls.credentialStores);

    await click(`[href="${urls.vaultCredentialStore}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.vaultCredentialStore);
  });

  test('cannot navigate to a static credential store form without proper authorization', async function (assert) {
    assert.expect(2);
    instances.staticCredentialStore.authorized_actions =
      instances.staticCredentialStore.authorized_actions.filter(
        (item) => item !== 'read'
      );

    await click(`[href="${urls.credentialStores}"]`);

    assert.dom(`[href="${urls.staticCredentialStore}"]`).doesNotExist();
    assert.dom(`[href="${urls.vaultCredentialStore}"]`).exists();
  });

  test('cannot navigate to a vault credential store form without proper authorization', async function (assert) {
    assert.expect(2);
    instances.vaultCredentialStore.authorized_actions =
      instances.vaultCredentialStore.authorized_actions.filter(
        (item) => item !== 'read'
      );

    await click(`[href="${urls.credentialStores}"]`);

    assert.dom(`[href="${urls.vaultCredentialStore}"]`).doesNotExist();
    assert.dom(`[href="${urls.staticCredentialStore}"]`).isVisible();
  });

  test('visiting an unknown credential store displays 404 message', async function (assert) {
    assert.expect(2);
    await visit(urls.credentialStores);
    assert.dom(`[href="${urls.unknownCredentialStore}"]`).doesNotExist();

    await visit(urls.unknownCredentialStore);
    await a11yAudit();

    assert.dom(find('.rose-message-subtitle'))
      .hasText('Error 404');
    );
  });

  test('Users can link to docs page for credential store', async function (assert) {
    assert.expect(1);

    await click(`[href="${urls.credentialStores}"]`);

    assert
      .dom(
        `[href="https://boundaryproject.io/help/admin-ui/credential-stores"]`
      )
      .isVisible();
  });
});
