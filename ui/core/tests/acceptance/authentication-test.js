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
  let orgsAuthURL;
  let authURL;
  let authMethodURL;
  let projectsURL;

  hooks.beforeEach(function () {
    invalidateSession();
    org = this.server.create('org');
    method = this.server.create('auth-method');
    orgsAuthURL = '/orgs/login';
    authURL = `/orgs/${org.id}/login`
    authMethodURL = `/orgs/${org.id}/login/${method.id}`
    projectsURL = `/orgs/${org.id}/projects`
  });

  test('visiting orgs login redirects to first org auth route (and thus its first auth method) while not authenticated', async function(assert) {
    assert.expect(2);
    await visit(orgsAuthURL);
    await a11yAudit();
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), authMethodURL);
  });

  test('visiting orgs login without available orgs shows a message', async function(assert) {
    assert.expect(3);
    org.destroy();
    await visit(orgsAuthURL);
    await a11yAudit();
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), orgsAuthURL);
    assert.ok(find('.rose-message'));
  });

  test('visiting org login without available auth methods shows a message', async function(assert) {
    assert.expect(3);
    method.destroy();
    await visit(authURL);
    await a11yAudit();
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), authURL);
    assert.ok(find('.rose-message'));
  });

  test('visiting org login redirects to first auth method while not authenticated', async function(assert) {
    assert.expect(2);
    await visit(authURL);
    await a11yAudit();
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), authMethodURL);
  });

  test('visiting login method while not authenticated', async function(assert) {
    assert.expect(2);
    await visit(authMethodURL);
    await a11yAudit();
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), authMethodURL);
  });

  test('visiting non-login while not authenticated redirects to first auth method', async function(assert) {
    assert.expect(2);
    await visit(projectsURL);
    await a11yAudit();
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), authMethodURL);
  });

  test('visiting login while authenticated redirects', async function(assert) {
    assert.expect(2);
    authenticateSession();
    await visit(authMethodURL);
    assert.ok(currentSession().isAuthenticated);
    assert.equal(currentURL(), projectsURL);
  });

  test('can login while unauthenticated', async function(assert) {
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
    assert.equal(currentURL(), authMethodURL, 'Login is current page');
    await fillIn('[name="username"]', 'error');
    await fillIn('[name="password"]', 'error');
    await click('[type="submit"]');
    assert.notOk(currentSession().isAuthenticated, 'Session is still not authenticated');
    assert.equal(currentURL(), authMethodURL, 'Login is still current page');
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
