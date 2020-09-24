import { module, test } from 'qunit';
import { visit, currentURL, click, find, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  // currentSession,
  invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | accounts | change password', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    account: null,
  };
  const urls = {
    orgScope: null,
    changePassword: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.authMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
    });
    instances.account = this.server.create('account', {
      scope: instances.scopes.org
    });
    authenticateSession({
      account_id: instances.account.id
    });
    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.changePassword = `/account/change-password`;
  });

  test('visiting account change password', async function (assert) {
    assert.expect(1);
    await visit(urls.changePassword);
    await a11yAudit();
    assert.equal(currentURL(), urls.changePassword);
  });

  test('visiting account change password from header', async function (assert) {
    assert.expect(1);
    await visit(urls.orgScope);
    // Open header utilities dropdown
    await click('.rose-header-utilities .rose-dropdown summary');
    // Find first element in dropdown - should be change password link
    await click('.rose-header-utilities .rose-dropdown .rose-dropdown-content a');
    assert.equal(currentURL(), urls.changePassword);
  });

  test('can change password for account', async function (assert) {
    assert.expect(2);
    this.server.post('/accounts/:id', (_, { requestBody }) => {
      const attrs = JSON.parse(requestBody);
      assert.equal(attrs.current_password, 'current password', 'current password is provided');
      assert.equal(attrs.new_password, 'new password', 'new password is provided');
    });
    await visit(urls.changePassword);
    await fillIn('[name="currentPassword"]', 'current password');
    await fillIn('[name="newPassword"]', 'new password');
    await click('form [type="submit"]:not(:disabled)');
    await a11yAudit();
  });

  test('can cancel password change', async function (assert) {
    assert.expect(1);
    await visit(urls.changePassword);
    await fillIn('[name="currentPassword"]', 'current password');
    await fillIn('[name="newPassword"]', 'new password');
    await click('form button:not([type="submit"])');
    assert.notEqual(currentURL(), urls.changePassword);
  });

  test('errors are displayed when changing password fails', async function  (assert) {
    assert.expect(1);
    this.server.post('/accounts/:id', () => {
      return new Response(
        490,
        {},
        {
          status: 490,
          code: 'error',
          message: 'Oops.',
        }
      );
    });
    await visit(urls.changePassword);
    await fillIn('[name="currentPassword"]', 'current password');
    await fillIn('[name="newPassword"]', 'new password');
    await click('form [type="submit"]');
    await a11yAudit();
    assert.ok(find('[role="alert"]'));
  });

  test('cannot change password when not authenticated', async function(assert) {
    assert.expect(1);
    invalidateSession();
    await visit(urls.changePassword);
    assert.notEqual(currentURL(), urls.changePassword);
  });
});
