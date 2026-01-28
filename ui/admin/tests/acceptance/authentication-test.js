/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  fillIn,
  click,
  getRootElement,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { setupIntl } from 'ember-intl/test-support';
import { Response } from 'miragejs';
import {
  currentSession,
  authenticateSession,
  invalidateSession,
} from 'ember-simple-auth/test-support';
import Service from '@ember/service';
import {
  TYPE_AUTH_METHOD_PASSWORD,
  TYPE_AUTH_METHOD_OIDC,
} from 'api/models/auth-method';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | authentication', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);
  setupIntl(hooks, 'en-us');

  let indexURL;
  let globalScope;
  let orgScope1;
  let orgScope2;
  let orgScopeID;
  let scopesURL;
  let orgScopeURL;
  let scope;
  let globalAuthMethod;
  let globalAccount;
  let globalAuthMethodID;
  let authMethod;
  let account;
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

  hooks.beforeEach(async function () {
    await invalidateSession();
    indexURL = '/';
    globalScope = this.server.schema.scopes.find('global');
    globalAuthMethod = this.server.schema.authMethods.first();
    globalAccount = this.server.schema.accounts.first();
    orgScope1 = this.server.create(
      'scope',
      {
        type: 'org',
        scope: { id: globalScope.id, type: globalScope.type },
      },
      'withChildren',
    );
    orgScope2 = this.server.create(
      'scope',
      {
        type: 'org',
        scope: { id: globalScope.id, type: globalScope.type },
      },
      'withChildren',
    );
    // create an empty org with no auth methods
    this.server.create(
      'scope',
      {
        type: 'org',
        scope: { id: globalScope.id, type: globalScope.type },
      },
      'withChildren',
    );
    scope = { id: orgScope1.id, type: orgScope1.type };
    authMethod = this.server.create('auth-method', {
      scope: orgScope1,
      type: TYPE_AUTH_METHOD_PASSWORD,
    });
    account = this.server.create('account', {
      scope: orgScope1,
      authMethod,
    });
    authMethodOIDC = this.server.create('auth-method', {
      scope: orgScope2,
      type: TYPE_AUTH_METHOD_OIDC,
    });
    this.server.create('account', {
      scope: orgScope2,
      authMethod: authMethodOIDC,
    });
    orgScopeID = orgScope1.id;
    globalAuthMethodID = globalAuthMethod.id;
    authMethodID = authMethod.id;
    authMethodOIDCID = authMethodOIDC.id;
    scopesURL = `/scopes`;
    orgScopeURL = `/scopes/${orgScopeID}`;
    globalAuthenticateURL = `/scopes/global/authenticate`;
    authenticateURL = `/scopes/${orgScopeID}/authenticate`;
    authMethodGlobalAuthenticateURL = `/scopes/global/authenticate/${globalAuthMethodID}`;
    authMethodAuthenticateURL = `/scopes/${orgScopeID}/authenticate/${authMethodID}`;
    authMethodOIDCAuthenticateURL = `/scopes/${orgScope2.id}/authenticate/${authMethodOIDCID}`;
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
    await visit(authenticateURL);

    assert.strictEqual(currentURL(), authMethodAuthenticateURL);
  });

  test('visiting auth method when the scope cannot be loaded is still allowed', async function (assert) {
    this.server.get(authMethodAuthenticateURL, () => {
      return new Response(404);
    });
    await visit(authMethodAuthenticateURL);

    assert.strictEqual(currentURL(), authMethodAuthenticateURL);
  });

  test('visiting any authentication parent route while unauthenticated redirects to first global authenticate method', async function (assert) {
    await visit(indexURL);

    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);

    await visit(scopesURL);

    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting change password while unauthenticated redirects to first global authenticate method', async function (assert) {
    await visit(changePasswordURL);

    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting orgs while unauthenticated redirects to first global authenticate method', async function (assert) {
    await visit(orgsURL);

    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting org edit while unauthenticated redirects to first global authenticate method', async function (assert) {
    await visit(orgEditURL);

    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting projects while unauthenticated redirects to first global authenticate method', async function (assert) {
    await visit(projectsURL);

    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting new project while unauthenticated redirects to first global authenticate method', async function (assert) {
    await visit(newProjectURL);

    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting users while unauthenticated redirects to first global authenticate method', async function (assert) {
    await visit(usersURL);

    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting roles while unauthenticated redirects to first global authenticate method', async function (assert) {
    await visit(rolesURL);

    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting groups while unauthenticated redirects to first global authenticate method', async function (assert) {
    await visit(groupsURL);

    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting host catalogs while unauthenticated redirects to first global authenticate method', async function (assert) {
    await visit(hostCatalogsURL);

    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting targets while unauthenticated redirects to first global authenticate method', async function (assert) {
    await visit(targetsURL);

    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting sessions while unauthenticated redirects to first global authenticate method', async function (assert) {
    await visit(sessionsURL);

    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting auth methods while unauthenticated redirects to first global authenticate method', async function (assert) {
    await visit(authMethodsURL);

    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('visiting auth method authenticate route', async function (assert) {
    await visit(authMethodAuthenticateURL);

    assert.strictEqual(currentURL(), authMethodAuthenticateURL);
  });

  test('visiting any authentication parent route while already authenticated with an org redirects to projects', async function (assert) {
    await authenticateSession({ scope, account_id: account.id });
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
    await authenticateSession({
      scope: { id: globalScope.id, type: globalScope.type },
      account_id: globalAccount.id,
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
    await visit(authMethodAuthenticateURL);

    assert.notOk(currentSession().isAuthenticated);

    await fillIn(commonSelectors.FIELD_IDENTIFICATION, 'error');
    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.ALERT_TOAST);
    assert.notOk(currentSession().isAuthenticated);
  });

  test('successful authentication with the global scope redirects to orgs', async function (assert) {
    await visit(authMethodGlobalAuthenticateURL);

    assert.notOk(currentSession().isAuthenticated);
    assert.strictEqual(currentURL(), authMethodGlobalAuthenticateURL);

    await fillIn(commonSelectors.FIELD_IDENTIFICATION, 'test');
    await fillIn(
      commonSelectors.FIELD_PASSWORD,
      commonSelectors.FIELD_PASSWORD_VALUE,
    );
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), orgsURL);
    assert.ok(currentSession().isAuthenticated);
  });

  test('successful authentication with an org scope redirects to projects', async function (assert) {
    await visit(authMethodAuthenticateURL);

    assert.notOk(currentSession().isAuthenticated);
    assert.strictEqual(currentURL(), authMethodAuthenticateURL);

    await fillIn(commonSelectors.FIELD_IDENTIFICATION, 'test');
    await fillIn(
      commonSelectors.FIELD_PASSWORD,
      commonSelectors.FIELD_PASSWORD_VALUE,
    );
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), projectsURL);
    assert.ok(currentSession().isAuthenticated);
  });

  test('401 responses result in deauthentication', async function (assert) {
    await authenticateSession({
      scope: { id: globalScope.id, type: globalScope.type },
      account_id: globalAccount.id,
    });
    await visit(orgsURL);

    assert.ok(
      currentSession().isAuthenticated,
      'Session begins authenticated, before encountering 401',
    );

    this.server.get('/users', () => new Response(401));
    await visit(usersURL);

    assert.notOk(
      currentSession().isAuthenticated,
      'Session is unauthenticated, after encountering 401',
    );
  });

  test('color theme is applied from session data', async function (assert) {
    await authenticateSession({
      scope: { id: globalScope.id, type: globalScope.type },
      account_id: globalAccount.id,
    });
    currentSession().set('data.theme', 'light');
    await visit(orgsURL);

    // light mode
    assert.strictEqual(currentSession().get('data.theme'), 'light');
    assert.ok(getRootElement().classList.contains('rose-theme-light'));
    assert.notOk(getRootElement().classList.contains('rose-theme-dark'));

    // open dropdown
    await click(commonSelectors.SIDEBAR_USER_DROPDOWN);

    // toggle system default
    await click(commonSelectors.TOGGLE_THEME_DEFAULT);

    assert.strictEqual(
      currentSession().get('data.theme'),
      'system-default-theme',
    );
    assert.notOk(getRootElement().classList.contains('rose-theme-light'));
    assert.notOk(getRootElement().classList.contains('rose-theme-dark'));

    // toggle dark mode
    await click(commonSelectors.TOGGLE_THEME_DARK);

    assert.strictEqual(currentSession().get('data.theme'), 'dark');
    assert.notOk(getRootElement().classList.contains('rose-theme-light'));
    assert.ok(getRootElement().classList.contains('rose-theme-dark'));

    // toggle system default
    await click(commonSelectors.TOGGLE_THEME_DEFAULT);

    assert.strictEqual(
      currentSession().get('data.theme'),
      'system-default-theme',
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
      },
    );
    await visit(authMethodOIDCAuthenticateURL);

    await click(commonSelectors.SAVE_BTN);
  });

  // TODO:  test OIDC retry and cancel
  test('org scopes with no auth methods are not visible in dropdown', async function (assert) {
    await visit(authMethodGlobalAuthenticateURL);

    await click(commonSelectors.AUTH_SCOPE_DROPDOWN);

    assert
      .dom(commonSelectors.AUTH_SCOPE_DROPDOWN_OPTIONS)
      .exists({ count: 3 });
  });
});
