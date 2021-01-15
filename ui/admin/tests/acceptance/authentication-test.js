import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  fillIn,
  click,
  find,
  findAll,
  getRootElement,
  //setupOnerror,
} from '@ember/test-helpers';
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
  let changePasswordURL;
  let orgsURL;
  let orgEditURL;
  let newProjectURL;
  let projectsURL;
  let usersURL;
  let groupsURL;
  let rolesURL;
  let authMethodsURL;
  let hostCatalogsURL;
  let sessionsURL;
  let targetsURL;

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
    globalAuthMethod = this.server.create('auth-method', {
      scope: globalScope,
      type: 'password'
    });
    authMethod = this.server.create('auth-method', {
      scope: orgScope,
      type: 'password'
    });
    orgScopeID = orgScope.id;
    globalAuthMethodID = globalAuthMethod.id;
    authMethodID = authMethod.id;
    scopesURL = `/scopes`;
    orgScopeURL = `/scopes/${orgScopeID}`;
    globalAuthenticateURL = `/scopes/global/authenticate`;
    authenticateURL = `/scopes/${orgScopeID}/authenticate`;
    authMethodGlobalAuthenticateURL = `/scopes/global/authenticate/${globalAuthMethodID}`;
    authMethodAuthenticateURL = `/scopes/${orgScopeID}/authenticate/${authMethodID}`;
    changePasswordURL = `/account/change-password`;
    orgsURL = `/scopes/global/scopes`;
    orgEditURL = `/scopes/${orgScopeID}/edit`;
    newProjectURL = `/scopes/${orgScopeID}/new`;
    projectsURL = `/scopes/${orgScopeID}/scopes`;
    usersURL = `/scopes/${orgScopeID}/users`;
    groupsURL = `/scopes/${orgScopeID}/groups`;
    rolesURL = `/scopes/${orgScopeID}/roles`;
    authMethodsURL = `/scopes/${orgScopeID}/auth-methods`;
    hostCatalogsURL = `/scopes/${orgScopeID}/host-catalogs`;
    sessionsURL = `/scopes/${orgScopeID}/sessions`;
    targetsURL = `/scopes/${orgScopeID}/targets`;
  });

  test('visiting auth methods authenticate route redirects to first auth method', async function (assert) {
    assert.expect(1);
    await visit(authenticateURL);
    await a11yAudit();
    assert.equal(currentURL(), authMethodAuthenticateURL);
  });

  test('visiting auth methods authenticate route when there no methods shows a message', async function (assert) {
    assert.expect(2);
    authMethod.destroy();
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

  test('visiting change password while unauthenticated redirects to first global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(changePasswordURL);
    assert.equal(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting orgs while unauthenticated redirects to first global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(orgsURL);
    assert.equal(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting org edit while unauthenticated redirects to first global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(orgEditURL);
    assert.equal(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting projects while unauthenticated redirects to first global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(projectsURL);
    assert.equal(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting new project while unauthenticated redirects to first global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(newProjectURL);
    assert.equal(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting users while unauthenticated redirects to first global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(usersURL);
    assert.equal(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting roles while unauthenticated redirects to first global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(rolesURL);
    assert.equal(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting groups while unauthenticated redirects to first global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(groupsURL);
    assert.equal(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting host catalogs while unauthenticated redirects to first global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(hostCatalogsURL);
    assert.equal(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting targets while unauthenticated redirects to first global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(targetsURL);
    assert.equal(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting sessions while unauthenticated redirects to first global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(sessionsURL);
    assert.equal(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting auth methods while unauthenticated redirects to first global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(authMethodsURL);
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
    authenticateSession({
      scope: { id: globalScope.id, type: globalScope.type },
    });
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

  test('successful authentication with the global scope redirects to orgs', async function (assert) {
    assert.expect(4);
    await visit(authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), authMethodGlobalAuthenticateURL);
    await fillIn('[name="identification"]', 'test');
    await fillIn('[name="password"]', 'test');
    await click('[type="submit"]');
    assert.equal(currentURL(), orgsURL);
    assert.ok(currentSession().isAuthenticated);
  });

  test('successful authentication with an org scope redirects to projects', async function (assert) {
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
    const menu = findAll(
      '.rose-header-utilities .rose-dropdown .rose-dropdown-content button'
    );
    await click(menu[menu.length - 1]);
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), authMethodGlobalAuthenticateURL);
  });

  test('401 responses result in deauthentication', async function (assert) {
    assert.expect(2);
    authenticateSession({
      scope: { id: globalScope.id, type: globalScope.type },
    });
    await visit(orgsURL);
    assert.ok(
      currentSession().isAuthenticated,
      'Session begins authenticated, before encountering 401'
    );
    this.server.get('/users', () => new Response(401));
    await visit(usersURL);
    assert.notOk(
      currentSession().isAuthenticated,
      'Session is unauthenticated, after encountering 401'
    );
  });

  test('color theme is applied from session data', async function (assert) {
    assert.expect(12);
    authenticateSession({
      scope: { id: globalScope.id, type: globalScope.type },
    });
    // system default
    await visit(orgsURL);
    assert.notOk(currentSession().get('data.theme'));
    assert.notOk(getRootElement().classList.contains('rose-theme-light'));
    assert.notOk(getRootElement().classList.contains('rose-theme-dark'));
    // toggle light mode
    await click('[name="theme"][value="light"]');
    assert.equal(currentSession().get('data.theme'), 'light');
    assert.ok(getRootElement().classList.contains('rose-theme-light'));
    assert.notOk(getRootElement().classList.contains('rose-theme-dark'));
    // toggle dark mode
    await click('[name="theme"][value="dark"]');
    assert.equal(currentSession().get('data.theme'), 'dark');
    assert.notOk(getRootElement().classList.contains('rose-theme-light'));
    assert.ok(getRootElement().classList.contains('rose-theme-dark'));
    // toggle system default
    await click('[name="theme"][value=""]');
    assert.notOk(currentSession().get('data.theme'));
    assert.notOk(getRootElement().classList.contains('rose-theme-light'));
    assert.notOk(getRootElement().classList.contains('rose-theme-dark'));
  });
});
