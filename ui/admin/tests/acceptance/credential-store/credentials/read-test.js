import { module, test } from 'qunit';
import { visit, currentURL, find, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | credential-stores | credentials | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      org: null,
      project: null,
    },
  };

  const urls = {
    projectScope: null,
    credentialStores: null,
    staticCredentialStore: null,
    credentials: null,
    credential: null,
    unknownCredential: null,
  };

  hooks.beforeEach(function () {
    // Generate resources
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
    instances.credential = this.server.create('credential', {
      scope: instances.scopes.project,
      credentialStore: instances.staticCredentialStore,
      type: 'username_password',
    });
    // Generate route URLs for resources
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.credentialStores = `${urls.projectScope}/credential-stores`;
    urls.staticCredentialStore = `${urls.credentialStores}/${instances.staticCredentialStore.id}`;
    urls.credentials = `${urls.staticCredentialStore}/credentials`;
    urls.credential = `${urls.credentials}/${instances.credential.id}`;
    urls.unknownCredential = `${urls.credentials}/foo`;
    authenticateSession({});
  });

  test('visiting /credentials', async function (assert) {
    assert.expect(2);
    await visit(urls.staticCredentialStore);
    await click(`[href="${urls.credentials}"]`);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.credentials);
    await click(`[href="${urls.credential}"]`);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.credential);
  });

  test('cannot navigate to a credential form without proper authorization', async function (assert) {
    assert.expect(1);
    instances.credential.authorized_actions =
      instances.credential.authorized_actions.filter((item) => item != 'read');
    await visit(urls.credentials);
    assert.notOk(find(`[href="${urls.credential}"]`));
  });

  test('visiting an unknown credential displays 404 message', async function (assert) {
    assert.expect(1);
    await visit(urls.unknownCredential);
    await a11yAudit();
    assert.ok(find('.rose-message-subtitle').textContent.trim(), 'Error 404');
  });

  test('Users can link to docs page for credential store', async function (assert) {
    assert.expect(1);
    await visit(urls.credential);
    assert.ok(
      find(`[href="https://boundaryproject.io/help/admin-ui/credentials"]`)
    );
  });
});
