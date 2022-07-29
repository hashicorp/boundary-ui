import { module, test } from 'qunit';
import { visit, find, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { Response } from 'miragejs';
import { resolve, reject } from 'rsvp';
import sinon from 'sinon';

module('Acceptance | credential-stores | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let getStaticCredentialStoresCount;
  let getVaultCredentialStoresCount;

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
    staticCredentialStore: null,
    vaultCredentialStore: null,
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
    // Generate resource counter
    getStaticCredentialStoresCount = () => {
      return this.server.schema.credentialStores.where({ type: 'static' })
        .models.length;
    };
    getVaultCredentialStoresCount = () => {
      return this.server.schema.credentialStores.where({ type: 'vault' }).models
        .length;
    };
    authenticateSession({});
  });

  test('can delete credential store of type vault', async function (assert) {
    assert.expect(1);
    const count = getVaultCredentialStoresCount();
    await visit(urls.vaultCredentialStore);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.strictEqual(getVaultCredentialStoresCount(), count - 1);
  });

  test('can delete credential store of type static', async function (assert) {
    assert.expect(1);
    const count = getStaticCredentialStoresCount();
    await visit(urls.staticCredentialStore);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.strictEqual(getStaticCredentialStoresCount(), count - 1);
  });

  test('cannot delete a vault credential store without proper authorization', async function (assert) {
    assert.expect(1);
    instances.vaultCredentialStore.authorized_actions =
      instances.vaultCredentialStore.authorized_actions.filter(
        (item) => item !== 'delete'
      );
    await visit(urls.vaultCredentialStore);
    assert.notOk(
      find('.rose-layout-page-actions .rose-dropdown-button-danger')
    );
  });

  test('cannot delete a static credential store without proper authorization', async function (assert) {
    assert.expect(1);
    instances.staticCredentialStore.authorized_actions =
      instances.staticCredentialStore.authorized_actions.filter(
        (item) => item !== 'delete'
      );
    await visit(urls.staticCredentialStore);
    assert.notOk(
      find('.rose-layout-page-actions .rose-dropdown-button-danger')
    );
  });

  test('can accept delete static credential store via dialog', async function (assert) {
    assert.expect(2);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(resolve());
    const count = getStaticCredentialStoresCount();
    await visit(urls.staticCredentialStore);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.strictEqual(getStaticCredentialStoresCount(), count - 1);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('can accept delete vault credential store via dialog', async function (assert) {
    assert.expect(2);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(resolve());
    const count = getVaultCredentialStoresCount();
    await visit(urls.vaultCredentialStore);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.strictEqual(getVaultCredentialStoresCount(), count - 1);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('cannot cancel delete for static credential store via dialog', async function (assert) {
    assert.expect(2);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(reject());
    const count = getStaticCredentialStoresCount();
    await visit(urls.staticCredentialStore);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.strictEqual(getStaticCredentialStoresCount(), count);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('cannot cancel delete for vault credential store via dialog', async function (assert) {
    assert.expect(2);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(reject());
    const count = getVaultCredentialStoresCount();
    await visit(urls.vaultCredentialStore);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.strictEqual(getVaultCredentialStoresCount(), count);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('deleting a static credential store which errors displays error messages', async function (assert) {
    assert.expect(1);
    this.server.del('/credential-stores/:id', () => {
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
    await visit(urls.staticCredentialStore);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.ok(find('[role="alert"]').textContent.trim(), 'Oops.');
  });

  test('deleting a vault credential store which errors displays error messages', async function (assert) {
    assert.expect(1);
    this.server.del('/credential-stores/:id', () => {
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
    await visit(urls.vaultCredentialStore);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.ok(find('[role="alert"]').textContent.trim(), 'Oops.');
  });
});
