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
  let loginURL;
  let loginMethodURL;
  let projectsURL;

  hooks.beforeEach(function () {
    invalidateSession();
    org = this.server.create('org');
    method = this.server.create('auth-method');
    loginURL = `/orgs/${org.id}/login`
    loginMethodURL = `/orgs/${org.id}/login/${method.id}`
    projectsURL = `/orgs/${org.id}/projects`
  });

  test('visiting login method while not authenticated', async function(assert) {
    assert.expect(2);
    await visit(loginMethodURL);
    await a11yAudit();
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), loginMethodURL);
  });

  test('visiting non-login while not authenticated redirects to login', async function(assert) {
    assert.expect(2);
    await visit(projectsURL);
    await a11yAudit();
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), loginURL);
  });

  test('visiting login while authenticated redirects', async function(assert) {
    assert.expect(2);
    authenticateSession();
    await visit(loginMethodURL);
    assert.ok(currentSession().isAuthenticated);
    assert.equal(currentURL(), projectsURL);
  });

  test('can login while unauthenticated', async function(assert) {
    assert.expect(4);
    await visit(loginMethodURL);
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), loginMethodURL);
    await fillIn('[name="username"]', 'admin');
    await fillIn('[name="password"]', 'admin');
    await click('[type="submit"]');
    assert.ok(currentSession().isAuthenticated);
    assert.equal(currentURL(), projectsURL);
  });

  test('can view notifications if authentication fails', async function(assert) {
    assert.expect(5);
    await visit(loginMethodURL);
    assert.notOk(currentSession().isAuthenticated, 'Session is not authenticated');
    assert.equal(currentURL(), loginMethodURL, 'Login is current page');
    await fillIn('[name="username"]', 'error');
    await fillIn('[name="password"]', 'error');
    await click('[type="submit"]');
    assert.notOk(currentSession().isAuthenticated, 'Session is still not authenticated');
    assert.equal(currentURL(), loginMethodURL, 'Login is still current page');
    assert.ok(find('.rose-notification'), 'Notification is visible');
  });

  test('logging out while authenticated redirects to login', async function(assert) {
    assert.expect(4);
    authenticateSession();
    await visit(projectsURL);
    assert.ok(currentSession().isAuthenticated);
    assert.equal(currentURL(), projectsURL);
    await click('.rose-button-header-dropdown');
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), loginURL);
  });
});
