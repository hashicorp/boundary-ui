import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | scopes', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
      org2: null,
      project: null,
      project2: null,
    }
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    org2Scope: null,
    projectScope: null,
    project2Scope: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.org2 = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.scopes.project2 = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.org2Scope = `/scopes/${instances.scopes.org2.id}`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.project2Scope = `/scopes/${instances.scopes.project2.id}`;
    authenticateSession({});
  });

  test('visiting global scope', async function (assert) {
    assert.expect(1);
    await visit(urls.globalScope);
    await a11yAudit();
    assert.equal(currentURL(), urls.globalScope);
  });

  // TODO: this probably shouldn't be the case, but was setup to enable
  // authentication when the global scope couldn't be loaded.
  // In order to resolve this, we might hoist authentication routes up from
  // under scopes.
  test('visiting global scope is successful even when the global scope cannot be fetched', async function (assert) {
    assert.expect(1);
    this.server.get('/scopes/:id', ({ scopes }, { params: { id } }) => {
      const scope = scopes.find(id);
      const response = (id === 'global')
        ? new Response(404)
        : scope;
      return response;
    });
    await visit(urls.globalScope);
    assert.equal(currentURL(), urls.globalScope);
  });

  test('visiting org scope', async function (assert) {
    assert.expect(1);
    await visit(urls.orgScope);
    await a11yAudit();
    assert.equal(currentURL(), urls.orgScope);
  });

  // NOTE:  In reality, we'd have a third "Global" item listed in the org
  // dropdown.  But since the mock test authenticator bypasses the auth
  // normalization step, the UI doesn't know it's authenticated with global
  // and thus doesn't display the "Global" item in the org nav dropdown.
  test('can navigate among org scopes via header navigation', async function (assert) {
    assert.expect(3);
    await visit(urls.globalScope);
    await a11yAudit();
    assert.equal(currentURL(), urls.globalScope);
    await click('.rose-header-nav .rose-dropdown a:nth-child(1)');
    assert.equal(currentURL(), urls.orgScope);
    // In reality, there would be a third item in the list
    await click('.rose-header-nav .rose-dropdown a:nth-child(2)');
    assert.equal(currentURL(), urls.org2Scope);
  });

  test('can navigate among project scopes via header navigation', async function (assert) {
    assert.expect(2);
    await visit(urls.projectScope);
    await a11yAudit();
    assert.equal(currentURL(), urls.projectScope);
    await click('.rose-header-nav .rose-dropdown + .rose-dropdown a:nth-child(2)');
    assert.equal(currentURL(), urls.project2Scope);
  });

});
