import { module, test } from 'qunit';
import { visit, currentURL, click, find, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import {
  authenticateSession,
  //   // These are left here intentionally for future reference.
  //   //currentSession,
  //   //invalidateSession,
} from 'ember-simple-auth/test-support';
import { enableFeature } from 'ember-feature-flags/test-support';

module('Acceptance | auth-methods | create ', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    authMethod: null,
    orgScope: null,
  };

  const urls = {
    orgScope: null,
    authMethods: null,
    newAuthMethod: null,
    authMethod: null,
    orgURL: null,
  };

  hooks.beforeEach(function () {
    authenticateSession({});
    instances.orgScope = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });

    instances.authMethod = this.server.create('auth-method', {
      scope: instances.orgScope,
    });

    // Generate route URLs for resources
    urls.orgURL = `/scopes/${instances.orgScope.id}`;
    urls.authMethods = `${urls.orgURL}/auth-methods`;
    urls.newAuthMethod = `${urls.authMethods}/new?type=password`;
    urls.authMethod = `${urls.authMethods}/${instances.authMethod.id}`;
  });

  test('Users can create new auth method', async function (assert) {
    assert.expect(1);
    const authMethodsCount = this.server.db.authMethods.length;
    await visit(urls.newAuthMethod);
    await fillIn('[name="name"]', 'AuthMethod name');
    await fillIn('[name="description"]', 'description');
    await click('form [type="submit"]:not(:disabled)');
    assert.equal(this.server.db.authMethods.length, authMethodsCount + 1);
  });

  test('Users can navigate to new auth-methods route with proper authorization', async function (assert) {
    assert.expect(2);
    instances.orgScope.authorized_collection_actions['auth-methods'] = [
      'create',
      'list',
    ];
    await visit(urls.orgURL);
    assert.ok(
      instances.orgScope.authorized_collection_actions['auth-methods'].includes(
        'create'
      )
    );
    assert.ok(find(`[href="${urls.authMethods}"]`));
  });

  test('Users cannot navigate to new auth-methods route without proper authorization', async function (assert) {
    assert.expect(2);
    instances.orgScope.authorized_collection_actions['auth-methods'] = [];
    await visit(urls.orgURL);
    assert.notOk(
      instances.orgScope.authorized_collection_actions['auth-methods'].includes(
        'create'
      )
    );
    assert.notOk(find(`[href="${urls.authMethods}"]`));
  });

  test('can cancel new auth method creation', async function (assert) {
    assert.expect(2);
    const authMethodsCount = this.server.db.authMethods.length;
    await visit(urls.newAuthMethod);
    await fillIn('[name="name"]', 'AuthMethod name');
    await fillIn('[name="description"]', 'description');
    await click('form button:not([type="submit"])');
    assert.equal(this.server.db.authMethods.length, authMethodsCount);
    assert.equal(currentURL(), urls.authMethods);
  });

  test('user can make primary an auth method', async function (assert) {
    assert.expect(2);
    assert.notOk(
      instances.orgScope.primaryAuthMethodId,
      'Primary auth method is not yet set.'
    );
    enableFeature('primary-auth-method');
    await visit(urls.authMethod);
    await click(
      '.rose-layout-page-actions .rose-dropdown-content [type="button"]:first-child'
    );
    const scope = this.server.schema.scopes.find(instances.orgScope.id);
    assert.equal(
      scope.primaryAuthMethodId,
      instances.authMethod.id,
      'Primary auth method is set.'
    );
  });

  test('user is notified of error on make primary an auth method', async function (assert) {
    assert.expect(2);
    this.server.patch('/scopes/:id', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'fail',
          message: 'Sorry!',
        }
      );
    });
    assert.notOk(
      instances.orgScope.primaryAuthMethodId,
      'Primary auth method is not yet set.'
    );
    enableFeature('primary-auth-method');
    await visit(urls.authMethod);
    await click(
      '.rose-layout-page-actions .rose-dropdown-content [type="button"]:first-child'
    );
    assert.ok(find('.rose-notification'));
  });

  test('user can remove as primary an auth method', async function (assert) {
    assert.expect(2);
    instances.orgScope.update({
      primaryAuthMethodId: instances.authMethod.id,
    });
    assert.ok(
      instances.orgScope.primaryAuthMethodId,
      'Primary auth method is set.'
    );
    enableFeature('primary-auth-method');
    await visit(urls.authMethod);
    await click(
      '.rose-layout-page-actions .rose-dropdown-content [type="button"]:first-child'
    );
    const scope = this.server.schema.scopes.find(instances.orgScope.id);
    assert.notOk(scope.primaryAuthMethodId, 'Primary auth method is unset.');
  });

  test('user is notified of error on remove as primary an auth method', async function (assert) {
    assert.expect(2);
    this.server.patch('/scopes/:id', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'fail',
          message: 'Sorry!',
        }
      );
    });
    instances.orgScope.update({
      primaryAuthMethodId: instances.authMethod.id,
    });
    assert.ok(
      instances.orgScope.primaryAuthMethodId,
      'Primary auth method is set.'
    );
    enableFeature('primary-auth-method');
    await visit(urls.authMethod);
    await click(
      '.rose-layout-page-actions .rose-dropdown-content [type="button"]:first-child'
    );
    assert.ok(find('.rose-notification'));
  });

  test('user can make and remove primary auth methods from index', async function (assert) {
    assert.expect(3);
    assert.notOk(
      instances.orgScope.primaryAuthMethodId,
      'Primary auth method is not yet set.'
    );
    enableFeature('primary-auth-method');
    await visit(urls.authMethods);
    await click(
      '.rose-table-body .rose-table-row:first-child .rose-dropdown-content [type="button"]:first-child'
    );
    let scope = this.server.schema.scopes.find(instances.orgScope.id);
    assert.equal(
      scope.primaryAuthMethodId,
      instances.authMethod.id,
      'Primary auth method is set.'
    );
    await click(
      '.rose-table-body .rose-table-row:first-child .rose-dropdown-content [type="button"]:first-child'
    );
    scope = this.server.schema.scopes.find(instances.orgScope.id);
    assert.notOk(scope.primaryAuthMethodId, 'Primary auth method is unset.');
  });
});
