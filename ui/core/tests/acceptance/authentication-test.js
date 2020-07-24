import { module, test } from 'qunit';
import { visit, currentURL, fillIn, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  currentSession,
  authenticateSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | authentication', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let orgScope;
  let orgScopeID;
  let scope;
  let authMethod;
  let authMethodID;
  let authenticateURL;
  let authMethodAuthenticateURL;
  let projectsURL;

  hooks.beforeEach(function () {
    orgScope = this.server.create('scope', {type: 'org'}, 'withChildren');
    scope = { id: orgScope.id, type: orgScope.type };
    authMethod = this.server.create('auth-method', { scope });
    orgScopeID = orgScope.id;
    authMethodID = authMethod.id;
    authenticateURL = `/scopes/${orgScopeID}/authenticate`;
    authMethodAuthenticateURL = `/scopes/${orgScopeID}/authenticate/${authMethodID}`;
    projectsURL = `/scopes/${orgScopeID}/projects`;
  });

  test('visiting auth methods authenticate route redirects to first auth method', async function(assert) {
    assert.expect(1);
    await visit(authenticateURL);
    await a11yAudit();
    assert.equal(currentURL(), authMethodAuthenticateURL);
  });

  test('visiting auth method authenticate route', async function(assert) {
    assert.expect(1);
    await visit(authMethodAuthenticateURL);
    await a11yAudit();
    assert.equal(currentURL(), authMethodAuthenticateURL);
  });

  test('visiting any authenticate route while already authenticated redirects to projects', async function(assert) {
    assert.expect(2);
    authenticateSession();
    await visit(authenticateURL);
    assert.equal(currentURL(), projectsURL);
    await visit(authMethodAuthenticateURL);
    assert.equal(currentURL(), projectsURL);
  });

  test('failed authentication shows a notification message', async function(assert) {
    assert.expect(3);
    await visit(authMethodAuthenticateURL);
    assert.notOk(currentSession().isAuthenticated);
    await fillIn('[name="identification"]', 'error');
    await click('[type="submit"]');
    assert.ok(find('.rose-notification.is-error'));
    assert.notOk(currentSession().isAuthenticated);
  });

  test('successful authentication redirects to projects', async function(assert) {
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

  test('deauthentication redirects to index', async function(assert) {
    assert.expect(3);
    await visit(authMethodAuthenticateURL);
    await fillIn('[name="identification"]', 'test');
    await fillIn('[name="password"]', 'test');
    await click('[type="submit"]');
    assert.ok(currentSession().isAuthenticated);
    await click('.rose-button-header-dropdown');
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), '/');
  });

});
