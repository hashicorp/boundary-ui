import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  click,
  // fillIn,
  find,
  // findAll,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
//import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | auth methods | oidc', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    authMethod: null,
  };
  const urls = {
    orgScope: null,
    authMethods: null,
    authMethod: null,
  };

  hooks.beforeEach(function () {
    authenticateSession({});
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.authMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
      type: 'oidc',
    });

    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.authMethods = `${urls.orgScope}/auth-methods`;
    urls.authMethod = `${urls.authMethods}/${instances.authMethod.id}`;
  });

  test('visiting oidc auth method', async function (assert) {
    assert.expect(1);
    await visit(urls.authMethod);
    await a11yAudit();
    assert.equal(currentURL(), urls.authMethod);
  });

  test('can view oidc state', async function (assert) {
    assert.expect(1);
    await visit(urls.authMethod);
    await click('.rose-layout-page-actions .rose-dropdown-trigger');
    assert.equal(
      find('.rose-dropdown[open] input[aria-checked=true]').value,
      instances.authMethod.attributes.state
    );
  });

  test('can update oidc state', async function (assert) {
    assert.expect(1);
    const updateValue = 'inactive';
    await visit(urls.authMethod);
    await click('.rose-layout-page-actions .rose-dropdown-trigger');
    await click(`.rose-dropdown[open] input[value="${updateValue}"]`);
    const authMethod = this.server.db.authMethods.find(instances.authMethod.id);
    assert.equal(authMethod.attributes.state, updateValue);
  });

  test('can update oidc state to active-private', async function (assert) {
    assert.expect(1);
    const updateValue = 'active-private';
    await visit(urls.authMethod);
    await click('.rose-layout-page-actions .rose-dropdown-trigger');
    await click(`.rose-dropdown[open] input[value="${updateValue}"]`);
    const authMethod = this.server.db.authMethods.find(instances.authMethod.id);
    assert.equal(authMethod.attributes.state, updateValue);
  });

  test('can update oidc state to active-public', async function (assert) {
    assert.expect(1);
    // Update default 'active-public' state to inactive
    instances.authMethod.attributes.state = 'inactive';
    const updateValue = 'active-public';
    await visit(urls.authMethod);
    await click('.rose-layout-page-actions .rose-dropdown-trigger');
    await click(`.rose-dropdown[open] input[value="${updateValue}"]`);
    const authMethod = this.server.db.authMethods.find(instances.authMethod.id);
    assert.equal(authMethod.attributes.state, updateValue);
  });

  // test('errors are displayed when state update fails', async function (assert) {
  //   assert.expect(2);
  //   const newState = 'inactive';
  //   await visit(urls.authMethod);
  //   await click('.rose-layout-page-actions .rose-dropdown-trigger');
  //   // Load page before mocking update
  //   this.server.post('/auth-methods/:idMethod', () => {
  //     return new Response(
  //       400,
  //       {},
  //       {
  //         status: 400,
  //         code: 'error',
  //         message: 'Sorry!',
  //       }
  //     );
  //   });
  //   await click(`.rose-dropdown[open] input[value="${newState}"]`);
  //   const authMethod = this.server.db.authMethods.find(instances.authMethod.id);
  //   assert.notEqual(
  //     newState,
  //     authMethod.attributes.state,
  //     'Auth method state is not be updated.'
  //   );
  //   assert.ok(
  //     find('[role="alert"]').textContent.trim(),
  //     'Sorry!',
  //     'Displays error message.'
  //   );
  // });
});
