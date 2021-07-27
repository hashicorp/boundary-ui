import { module, test } from 'qunit';
import { visit, find, findAll, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | targets | credential-libraries', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let getCredentialLibraryCount;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    credentialLibraries: null,
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    targets: null,
    target: null,
    targetCredentialLibraries: null,
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
    instances.credentialLibraries = this.server.createList(
      'credential-library',
      2,
      { scope: instances.scopes.project }
    );
    instances.target = this.server.create('target', {
      scope: instances.scopes.project,
      credentialLibraries: instances.credentialLibraries,
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `/scopes/${instances.scopes.project.id}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;
    urls.targetCredentialLibraries = `${urls.target}/credential-libraries`;
    // Generate resource counter
    getCredentialLibraryCount = () =>
      this.server.schema.credentialLibraries.all().models.length;
    authenticateSession({});
  });

  test('can remove a credential library', async function (assert) {
    assert.expect(2);
    const count = getCredentialLibraryCount();
    await visit(urls.targetCredentialLibraries);
    assert.equal(findAll('tbody tr').length, count);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.equal(findAll('tbody tr').length, count - 1);
  });

  test('removing a target credential library which errors displays error messages', async function (assert) {
    assert.expect(2);
    this.server.post('/targets/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {},
        }
      );
    });
    const count = getCredentialLibraryCount();
    await visit(urls.targetCredentialLibraries);
    assert.equal(findAll('tbody tr').length, count);
    await click('tbody tr .rose-dropdown-button-danger');
    assert.ok(find('[role="alert"]'));
  });
});
