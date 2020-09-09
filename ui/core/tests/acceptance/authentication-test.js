import { module, test } from 'qunit';
import { visit, currentURL, fillIn, click, find, findAll, setupOnerror } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  currentSession,
  authenticateSession,
  invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | authentication', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let indexURL;
  let globalScope;
  let orgScope;
  let orgScopeID;
  let scopesURL;
  let orgScopeURL;
  let scope;
  let globalAuthMethod;
  let authMethod;
  let globalAuthMethodID;
  let authMethodID;
  let globalAuthenticateURL;
  let authenticateURL;
  let authMethodAuthenticateURL;
  let authMethodGlobalAuthenticateURL;
  let orgsURL;
  let projectsURL;

  hooks.beforeEach(function () {
    invalidateSession();
    indexURL = '/';
    globalScope = this.server.create('scope', { id: 'global' });
    orgScope = this.server.create(
      'scope',
      {
        type: 'org',
        scope: { id: globalScope.id, type: globalScope.type },
      },
      'withChildren'
    );
    scope = { id: orgScope.id, type: orgScope.type };
    globalAuthMethod = this.server.create('auth-method', { scope: globalScope });
    authMethod = this.server.create('auth-method', { scope: orgScope });
    orgScopeID = orgScope.id;
    globalAuthMethodID = globalAuthMethod.id;
    authMethodID = authMethod.id;
    scopesURL = `/scopes`;
    orgScopeURL = `/scopes/${orgScopeID}`;
    globalAuthenticateURL = `/scopes/global/authenticate`;
    authenticateURL = `/scopes/${orgScopeID}/authenticate`;
    authMethodGlobalAuthenticateURL = `/scopes/global/authenticate/${globalAuthMethodID}`;
    authMethodAuthenticateURL = `/scopes/${orgScopeID}/authenticate/${authMethodID}`;
    orgsURL = `/scopes/global/orgs`;
    projectsURL = `/scopes/${orgScopeID}/projects`;
  });

  test('visiting auth methods authenticate route redirects to first auth method', async function (assert) {
    assert.expect(1);
    await visit(authenticateURL);
    await a11yAudit();
    assert.equal(currentURL(), authMethodAuthenticateURL);
  });

  test('visiting auth methods authenticate route when there no methods shows a message', async function (assert) {
    assert.expect(2);
    authMethod.destroy()
    await visit(authenticateURL);
    await a11yAudit();
    assert.equal(currentURL(), authenticateURL);
    assert.ok(find('.rose-message'));
  });

  test('visiting auth method when the scope cannot be loaded is still allowed', async function (assert) {
    assert.expect(1);
    this.server.get('/scopes', () => {
      return new Response(404);
    });
    await visit(authMethodAuthenticateURL);
    await a11yAudit();
    assert.equal(currentURL(), authMethodAuthenticateURL);
  });

  test('visiting any authentication parent route while unauthenticated redirects to first global authenticate method', async function (assert) {
    assert.expect(3);
    await visit(indexURL);
    assert.equal(currentURL(), authMethodGlobalAuthenticateURL);
    await visit(scopesURL);
    assert.equal(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting projects while unauthenticated redirects to first global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(projectsURL);
    assert.equal(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting auth method authenticate route', async function (assert) {
    assert.expect(1);
    await visit(authMethodAuthenticateURL);
    await a11yAudit();
    assert.equal(currentURL(), authMethodAuthenticateURL);
  });

  test('visiting any authentication parent route while already authenticated with an org redirects to projects', async function (assert) {
    assert.expect(6);
    authenticateSession({ scope });
    await visit(indexURL);
    assert.equal(currentURL(), projectsURL);
    await visit(scopesURL);
    assert.equal(currentURL(), projectsURL);
    await visit(orgScopeURL);
    assert.equal(currentURL(), projectsURL);
    await visit(authenticateURL);
    assert.equal(currentURL(), projectsURL);
    await visit(authMethodAuthenticateURL);
    assert.equal(currentURL(), projectsURL);
    assert.ok(currentSession().isAuthenticated);
  });

  test('visiting index or scopes routes while already authenticated with global redirects to orgs', async function (assert) {
    assert.expect(4);
    authenticateSession({ scope: { id: globalScope.id, type: globalScope.type } });
    await visit(indexURL);
    assert.equal(currentURL(), orgsURL);
    await visit(scopesURL);
    assert.equal(currentURL(), orgsURL);
    await visit(globalAuthenticateURL);
    assert.equal(currentURL(), orgsURL);
    assert.ok(currentSession().isAuthenticated);
  });

  test('failed authentication shows a notification message', async function (assert) {
    assert.expect(3);
    await visit(authMethodAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
    await fillIn('[name="identification"]', 'error');
    await click('[type="submit"]');
    assert.ok(find('.rose-notification.is-error'));
    assert.notOk(currentSession().isAuthenticated);
  });

  test('successful authentication redirects to projects', async function (assert) {
    assert.expect(4);
    await visit(authMethodAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), authMethodAuthenticateURL);
    await fillIn('[name="identification"]', 'test');
    await fillIn('[name="password"]', 'test');
    await click('[type="submit"]');
    assert.equal(currentURL(), projectsURL);
    assert.ok(currentSession().isAuthenticated);
  });

  test('deauthentication redirects to first global authenticate method', async function (assert) {
    assert.expect(3);
    await visit(authMethodAuthenticateURL);
    await fillIn('[name="identification"]', 'test');
    await fillIn('[name="password"]', 'test');
    await click('[type="submit"]');
    assert.ok(currentSession().isAuthenticated);
    // Open header utilities dropdown
    await click('.rose-header-utilities .rose-dropdown summary');
    // Find and click on last element in dropdown - should be deauthenticate button
    const menu = findAll('.rose-header-utilities .rose-dropdown .rose-dropdown-content button');
    await click(menu[menu.length - 1]);
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), authMethodGlobalAuthenticateURL);
  });

  test('401 responses result in deauthentication', async function (assert) {
    assert.expect(2);
    authenticateSession({ scope: { id: globalScope.id, type: globalScope.type } });
    await visit(orgsURL);
    assert.ok(currentSession().isAuthenticated, 'Session begins authenticated, before encountering 401');
    this.server.get('/scopes', () => new Response(401));
    setupOnerror(() => {
      assert.notOk(currentSession().isAuthenticated, 'Session is unauthenticated, after encountering 401');
    });
    await visit(projectsURL);
  });
});
