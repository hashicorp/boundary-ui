/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  fillIn,
  click,
  find,
  findAll,
  getRootElement,
  setupOnerror,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import { runAllJobs } from 'ember-pollster/test-support';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  currentSession,
  authenticateSession,
  invalidateSession,
} from 'ember-simple-auth/test-support';
import Service from '@ember/service';

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
  let globalAuthMethodID;
  let authMethod;
  let authMethodID;
  let authMethodOIDC;
  let authMethodOIDCID;
  let globalAuthenticateURL;
  let authenticateURL;
  let authMethodAuthenticateURL;
  let authMethodOIDCAuthenticateURL;
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
      type: 'password',
    });
    authMethod = this.server.create('auth-method', {
      scope: orgScope,
      type: 'password',
    });
    authMethodOIDC = this.server.create('auth-method', {
      scope: orgScope,
      type: 'oidc',
    });
    orgScopeID = orgScope.id;
    globalAuthMethodID = globalAuthMethod.id;
    authMethodID = authMethod.id;
    authMethodOIDCID = authMethodOIDC.id;
    scopesURL = `/scopes`;
    orgScopeURL = `/scopes/${orgScopeID}`;
    globalAuthenticateURL = `/scopes/global/authenticate`;
    authenticateURL = `/scopes/${orgScopeID}/authenticate`;
    authMethodGlobalAuthenticateURL = `/scopes/global/authenticate/${globalAuthMethodID}`;
    authMethodAuthenticateURL = `/scopes/${orgScopeID}/authenticate/${authMethodID}`;
    authMethodOIDCAuthenticateURL = `/scopes/${orgScopeID}/authenticate/${authMethodOIDCID}`;
    changePasswordURL = `/account/change-password`;
    orgsURL = `/scopes/global/scopes`;
    orgEditURL = `/scopes/${orgScopeID}/edit`;
    newProjectURL = `/scopes/${orgScopeID}/scopes/new`;
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
    assert.strictEqual(currentURL(), authMethodAuthenticateURL);
  });

  test('visiting auth method when the scope cannot be loaded is still allowed', async function (assert) {
    assert.expect(1);
    setupOnerror(() => {
      // do nothing, otherwise an uncaught adapter error will fail the test
    });
    this.server.get('/scopes', () => {
      return new Response(404);
    });
    await visit(authMethodAuthenticateURL);
    await a11yAudit();
    assert.strictEqual(currentURL(), authMethodAuthenticateURL);
  });

  test('visiting any authentication parent route while unauthenticated redirects to first global authenticate method', async function (assert) {
    assert.expect(3);
    await visit(indexURL);
    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    await visit(scopesURL);
    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting change password while unauthenticated redirects to first global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(changePasswordURL);
    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting orgs while unauthenticated redirects to first global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(orgsURL);
    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting org edit while unauthenticated redirects to first global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(orgEditURL);
    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting projects while unauthenticated redirects to first global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(projectsURL);
    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting new project while unauthenticated redirects to first global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(newProjectURL);
    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting users while unauthenticated redirects to first global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(usersURL);
    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting roles while unauthenticated redirects to first global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(rolesURL);
    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting groups while unauthenticated redirects to first global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(groupsURL);
    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting host catalogs while unauthenticated redirects to first global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(hostCatalogsURL);
    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting targets while unauthenticated redirects to first global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(targetsURL);
    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting sessions while unauthenticated redirects to first global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(sessionsURL);
    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting auth methods while unauthenticated redirects to first global authenticate method', async function (assert) {
    assert.expect(2);
    await visit(authMethodsURL);
    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting auth method authenticate route', async function (assert) {
    assert.expect(1);
    await visit(authMethodAuthenticateURL);
    await a11yAudit();
    assert.strictEqual(currentURL(), authMethodAuthenticateURL);
  });

  test('visiting any authentication parent route while already authenticated with an org redirects to projects', async function (assert) {
    assert.expect(6);
    authenticateSession({ scope });
    await visit(indexURL);
    assert.strictEqual(currentURL(), projectsURL);
    await visit(scopesURL);
    assert.strictEqual(currentURL(), projectsURL);
    await visit(orgScopeURL);
    assert.strictEqual(currentURL(), projectsURL);
    await visit(authenticateURL);
    assert.strictEqual(currentURL(), projectsURL);
    await visit(authMethodAuthenticateURL);
    assert.strictEqual(currentURL(), projectsURL);
    assert.ok(currentSession().isAuthenticated);
  });

  test('visiting index or scopes routes while already authenticated with global redirects to orgs', async function (assert) {
    assert.expect(4);
    authenticateSession({
      scope: { id: globalScope.id, type: globalScope.type },
    });
    await visit(indexURL);
    assert.strictEqual(currentURL(), orgsURL);
    await visit(scopesURL);
    assert.strictEqual(currentURL(), orgsURL);
    await visit(globalAuthenticateURL);
    assert.strictEqual(currentURL(), orgsURL);
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
    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    await fillIn('[name="identification"]', 'test');
    await fillIn('[name="password"]', 'test');
    await click('[type="submit"]');
    assert.strictEqual(currentURL(), orgsURL);
    assert.ok(currentSession().isAuthenticated);
  });

  test('successful authentication with an org scope redirects to projects', async function (assert) {
    assert.expect(4);
    await visit(authMethodAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
    assert.strictEqual(currentURL(), authMethodAuthenticateURL);
    await fillIn('[name="identification"]', 'test');
    await fillIn('[name="password"]', 'test');
    await click('[type="submit"]');
    assert.strictEqual(currentURL(), projectsURL);
    assert.ok(currentSession().isAuthenticated);
  });

  // This test is disabled because it is no longer relevant.  On deauth,
  // the page is reloaded.  If the user was viewing a route requiring
  // authentication, they will be redirected accordingly.
  test.skip('deauthentication redirects to first global authenticate method', async function (assert) {
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
    assert.strictEqual(currentSession().get('data.theme'), 'light');
    assert.ok(getRootElement().classList.contains('rose-theme-light'));
    assert.notOk(getRootElement().classList.contains('rose-theme-dark'));
    // toggle dark mode
    await click('[name="theme"][value="dark"]');
    assert.strictEqual(currentSession().get('data.theme'), 'dark');
    assert.notOk(getRootElement().classList.contains('rose-theme-light'));
    assert.ok(getRootElement().classList.contains('rose-theme-dark'));
    // toggle system default
    await click('[name="theme"][value="system-default-theme"]');
    assert.strictEqual(
      currentSession().get('data.theme'),
      'system-default-theme'
    );
    assert.notOk(getRootElement().classList.contains('rose-theme-light'));
    assert.notOk(getRootElement().classList.contains('rose-theme-dark'));
  });

  // TODO:  figure out a sustainable test strategy for polling routes
  test('OIDC authentication opens a new window and closes it upon completion', async function (assert) {
    assert.expect(3);
    // Register mock window service
    this.owner.register(
      'service:browser/window',
      class extends Service {
        open(/* url */) {
          assert.ok(true, 'New window was opened.');
          return {
            close() {
              assert.ok(true, 'New window was closed.');
              assert.ok(currentSession().isAuthenticated);
            },
          };
        }
      }
    );
    await visit(authMethodOIDCAuthenticateURL);
    await click('form [type="submit"]');
    // explicitly poll multiple times to trigger mock OIDC auth
    await runAllJobs();
    await runAllJobs();
  });

  // TODO:  test OIDC retry and cancel
});
