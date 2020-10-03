import { module, test } from 'qunit';
import { visit, currentURL, click, find, findAll, fillIn } from '@ember/test-helpers';
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

module('Acceptance | org', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
    },
    orgs: null,
  };
  const urls = {
    root: null,
    scopes: null,
    globalScope: null,
    orgs: null,
    newOrg: null,
  };
  let orgsCount;

  hooks.beforeEach(function () {
    // Setup Mirage mock resources for this test
    authenticateSession({});
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.orgs = this.server.createList('scope', 2, {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    orgsCount = instances.orgs.length;
    // Generate route URLs for resources
    urls.root = '/';
    urls.scopes = `/scopes`;
    urls.globalScope = `${urls.scopes}/global`;
    urls.orgs = `${urls.globalScope}/orgs`;
    urls.newOrg = `${urls.orgs}/new`;
  });

  test('visiting orgs', async function (assert) {
    assert.expect(3);
    await visit(urls.orgs);
    await a11yAudit();
    assert.ok(orgsCount);
    assert.equal(currentURL(), urls.orgs);
    assert.equal(findAll('article').length, orgsCount);
  });

  test('visiting orgs is successful even when the global scope cannot be fetched', async function (assert) {
    assert.expect(3);
    this.server.get('/scopes/:id', ({ scopes }, { params: { id } }) => {
      const scope = scopes.find(id);
      return (id === 'global')
        ? new Response(404)
        : scope;
    });
    await visit(urls.orgs);
    await a11yAudit();
    assert.ok(orgsCount);
    assert.equal(currentURL(), urls.orgs);
    assert.equal(findAll('article').length, orgsCount);
  });

  test('visiting scopes redirects to index', async function (assert) {
    assert.expect(1);
    await visit(urls.scopes);
    assert.equal(currentURL(), urls.orgs);
  });

  test('visiting root redirects to index', async function (assert) {
    assert.expect(1);
    await visit(urls.root);
    assert.equal(currentURL(), urls.orgs);
  });

  test('visiting orgs within a non global scope redirects to index', async function (assert) {
    const nonGlobalScopeURL = `${urls.scopes}/123/orgs`;
    assert.expect(1);
    await visit(nonGlobalScopeURL);
    assert.equal(currentURL(), urls.orgs);
  });

  test('can create a new org', async function (assert) {
    assert.expect(1);
    await visit(urls.newOrg);
    await fillIn('[name="name"]', 'Org name');
    await fillIn('[name="description"]', 'description');
    await click('form [type="submit"]:not(:disabled)');
    assert.equal(this.server.db.scopes.where(scope => scope.type === 'org').length, orgsCount + 1);
  });

  test('can cancel new org creation', async function (assert) {
    assert.expect(2);
    await visit(urls.newOrg);
    await fillIn('[name="name"]', 'Org name');
    await fillIn('[name="description"]', 'description');
    await click('form button:not([type="submit"])');
    assert.equal(currentURL(), urls.orgs);
    assert.equal(this.server.db.scopes.where(scope => scope.type === 'org').length, orgsCount);
  });

  test('saving a new org with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.post('/scopes', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {
            request_fields: [
              {
                name: 'name',
                description: 'Name is required.',
              },
            ],
          },
        }
      );
    });
    await visit(urls.newOrg);
    await fillIn('[name="name"]', 'new org');
    await click('form [type="submit"]');
    await a11yAudit();
    assert.ok(find('[role="alert"]'));
    assert.ok(find('.rose-form-error-message'));
  });
});
