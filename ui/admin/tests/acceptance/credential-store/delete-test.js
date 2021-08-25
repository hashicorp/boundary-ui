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

  let getCredentialStoresCount;

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
    // Generate resource counter
    getCredentialStoresCount = () => {
      return this.server.schema.credentialStores.all().models.length;
    };
    authenticateSession({});
  });

  test('can delete credential store', async function (assert) {
    assert.expect(1);
    const count = getCredentialStoresCount();
    await visit(urls.credentialStore);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(getCredentialStoresCount(), count - 1);
  });

  test('cannot delete a credential store without proper authorization', async function (assert) {
    assert.expect(1);
    instances.credentialStore.authorized_actions =
      instances.credentialStore.authorized_actions.filter(
        (item) => item !== 'delete'
      );
    await visit(urls.credentialStores);
    assert.notOk(
      find('.rose-layout-page-actions .rose-dropdown-button-danger')
    );
  });

  test('can accept delete credential store via dialog', async function (assert) {
    assert.expect(2);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(resolve());
    const count = getCredentialStoresCount();
    await visit(urls.credentialStore);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(getCredentialStoresCount(), count - 1);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('cannot cancel delete credential store via dialog', async function (assert) {
    assert.expect(2);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(reject());
    const count = getCredentialStoresCount();
    await visit(urls.credentialStore);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(getCredentialStoresCount(), count);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('deleting a credential store which errors displays error messages', async function (assert) {
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
    await visit(urls.credentialStore);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.ok(find('[role="alert"]').textContent.trim(), 'Oops.');
  });
});
