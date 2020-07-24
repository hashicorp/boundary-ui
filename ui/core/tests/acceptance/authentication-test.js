import { module, test } from 'qunit';
import { visit, currentURL, fillIn, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Acceptance | authentication', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let orgScope;
  let orgScopeID;
  let authMethod;
  let authMethodID;
  let authMethodAuthenticateURL;
  let projectsURL;

  hooks.beforeEach(function () {
    orgScope = this.server.create('scope', {type: 'org'}, 'withChildren');
    const scope = { id: orgScope.id, type: orgScope.type };
    authMethod = server.create('auth-method', { scope });
    orgScopeID = orgScope.id;
    authMethodID = authMethod.id;
    authMethodAuthenticateURL = `/scopes/${orgScopeID}/authenticate/${authMethodID}`;
    projectsURL = `/scopes/${orgScopeID}/projects`;
  });

  test('visiting auth method authenticate route', async function(assert) {
    assert.expect(1);
    await visit(authMethodAuthenticateURL);
    await a11yAudit();
    assert.equal(currentURL(), authMethodAuthenticateURL);
  });

  test('failed authentication shows a notification message', async function(assert) {
    assert.expect(1);
    await visit(authMethodAuthenticateURL);
    await fillIn('[name="identification"]', 'error');
    await click('[type="submit"]');
    assert.ok(find('.rose-notification.is-error'));
  });

  test('successful authentication redirects to projects', async function(assert) {
    assert.expect(2);
    await visit(authMethodAuthenticateURL);
    assert.equal(currentURL(), authMethodAuthenticateURL);
    await fillIn('[name="identification"]', 'test');
    await fillIn('[name="password"]', 'test');
    await click('[type="submit"]');
    assert.equal(currentURL(), projectsURL);
  });

});
