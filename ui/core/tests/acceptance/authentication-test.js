import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { currentSession, authenticateSession, invalidateSession } from 'ember-simple-auth/test-support';

module('Acceptance | authentication', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let org;
  let method;
  let orgsURL;
  let orgsAuthURL;
  let authURL;
  let authMethodURL;
  let projectsURL;

  hooks.beforeEach(function () {
    invalidateSession();
    org = this.server.create('org');
    method = this.server.create('auth-method');
    orgsURL = '/orgs';
    orgsAuthURL = '/orgs/authenticate';
    authURL = `/orgs/${org.id}/authenticate`
    authMethodURL = `/orgs/${org.id}/authenticate/${method.id}`
    projectsURL = `/orgs/${org.id}/projects`
  });

  test('can navigate from orgs list to org-specific auth methods list (which auto-redirects to first auth method)', async function(assert) {
    assert.expect(3);
    await visit(orgsAuthURL);
    await a11yAudit();
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), orgsAuthURL);
    await click('main a');
    assert.equal(currentURL(), authMethodURL);
  });

  test('can navigate among org-specific auth methods (to the same route with a different org)', async function(assert) {
    assert.expect(2);
    const anotherOrg = this.server.create('org');
    await visit(authMethodURL);
    await a11yAudit();
    assert.equal(currentURL(), authMethodURL);
    await click('.rose-dropdown-link:nth-child(2)');
    assert.equal(currentURL(), `/orgs/${anotherOrg.id}/authenticate/${method.id}`);
  });

  test('visiting orgs authenticate without available orgs shows a message', async function(assert) {
    assert.expect(3);
    org.destroy();
    await visit(orgsAuthURL);
    await a11yAudit();
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), orgsAuthURL);
    assert.ok(find('.rose-message'));
  });

  test('visiting orgs index redirects to orgs authenticate', async function(assert) {
    assert.expect(1);
    await visit(orgsURL);
    assert.equal(currentURL(), orgsAuthURL);
  });

  test('visiting orgs authenticate while authenticated with an org scope redirects to that org', async function(assert) {
    assert.expect(2);
    // firstly, authenticate and include an org scope in the session...
    authenticateSession({ org_id: org.id });
    // Attempt to visit the /orgs/authenticate route...
    await visit(orgsAuthURL);
    assert.ok(currentSession().isAuthenticated);
    // And be redirected to the org we authenticated with...
    assert.equal(currentURL(), projectsURL);
  });

  test('visiting org authenticate without available auth methods shows a message', async function(assert) {
    assert.expect(3);
    method.destroy();
    await visit(authURL);
    await a11yAudit();
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), authURL);
    assert.ok(find('.rose-message'));
  });

  test('visiting org authenticate redirects to first auth method while not authenticated', async function(assert) {
    assert.expect(2);
    await visit(authURL);
    await a11yAudit();
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), authMethodURL);
  });

  test('visiting authenticate method while not authenticated', async function(assert) {
    assert.expect(2);
    await visit(authMethodURL);
    await a11yAudit();
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), authMethodURL);
  });

  test('visiting non-authenticate while not authenticated redirects to first auth method', async function(assert) {
    assert.expect(2);
    await visit(projectsURL);
    await a11yAudit();
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), authMethodURL);
  });

  test('visiting authenticate while authenticated redirects', async function(assert) {
    assert.expect(2);
    authenticateSession();
    await visit(authMethodURL);
    assert.ok(currentSession().isAuthenticated);
    assert.equal(currentURL(), projectsURL);
  });

  test('can authenticate while unauthenticated', async function(assert) {
    assert.expect(4);
    await visit(authMethodURL);
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), authMethodURL);
    await fillIn('[name="username"]', 'admin');
    await fillIn('[name="password"]', 'admin');
    await click('[type="submit"]');
    assert.ok(currentSession().isAuthenticated);
    assert.equal(currentURL(), projectsURL);
  });

  test('can view notifications if authentication fails', async function(assert) {
    assert.expect(5);
    await visit(authMethodURL);
    assert.notOk(currentSession().isAuthenticated, 'Session is not authenticated');
    assert.equal(currentURL(), authMethodURL, 'Authenticate is current page');
    await fillIn('[name="username"]', 'error');
    await fillIn('[name="password"]', 'error');
    await click('[type="submit"]');
    assert.notOk(currentSession().isAuthenticated, 'Session is still not authenticated');
    assert.equal(currentURL(), authMethodURL, 'Authenticate is still current page');
    assert.ok(find('.rose-notification'), 'Notification is visible');
  });

  test('logging out while authenticated redirects to first auth method', async function(assert) {
    assert.expect(4);
    authenticateSession();
    await visit(projectsURL);
    assert.ok(currentSession().isAuthenticated);
    assert.equal(currentURL(), projectsURL);
    await click('.rose-button-header-dropdown');
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), authMethodURL);
  });
});
