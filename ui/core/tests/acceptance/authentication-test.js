import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { currentSession, authenticateSession, invalidateSession } from 'ember-simple-auth/test-support';

module('Acceptance | authentication', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(() => invalidateSession());

  test('visiting login while not authenticated', async function(assert) {
    assert.expect(2);
    await visit('/orgs/1/login');
    await a11yAudit();
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), '/orgs/1/login');
  });

  test('visiting non-login while not authenticated redirects to login', async function(assert) {
    assert.expect(2);
    await visit('/orgs/1/projects');
    await a11yAudit();
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), '/orgs/1/login');
  });

  test('visiting login while authenticated redirects', async function(assert) {
    assert.expect(2);
    authenticateSession();
    await visit('/orgs/1/login');
    assert.ok(currentSession().isAuthenticated);
    assert.equal(currentURL(), '/orgs/1/projects');
  });

  test('can login while unauthenticated', async function(assert) {
    assert.expect(4);
    await visit('/orgs/1/login');
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), '/orgs/1/login');
    await fillIn('[name="username"]', 'admin');
    await fillIn('[name="password"]', 'admin');
    await click('[type="submit"]');
    assert.ok(currentSession().isAuthenticated);
    assert.equal(currentURL(), '/orgs/1/projects');
  });

  test('can view notifications if authentication fails', async function(assert) {
    assert.expect(5);
    await visit('/orgs/1/login');
    assert.notOk(currentSession().isAuthenticated, 'Session is not authenticated');
    assert.equal(currentURL(), '/orgs/1/login', 'Login is current page');
    await fillIn('[name="username"]', 'error');
    await fillIn('[name="password"]', 'error');
    await click('[type="submit"]');
    assert.notOk(currentSession().isAuthenticated, 'Session is still not authenticated');
    assert.equal(currentURL(), '/orgs/1/login', 'Login is still current page');
    assert.ok(find('.rose-notification'), 'Notification is visible');
  });

  test('logging out while authenticated redirects to login', async function(assert) {
    assert.expect(4);
    authenticateSession();
    await visit('/orgs/1/projects');
    assert.ok(currentSession().isAuthenticated);
    assert.equal(currentURL(), '/orgs/1/projects');
    await click('.rose-button-header-dropdown');
    assert.notOk(currentSession().isAuthenticated);
    assert.equal(currentURL(), '/orgs/1/login');
  });
});
