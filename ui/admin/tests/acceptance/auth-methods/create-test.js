/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  click,
  find,
  fillIn,
  select,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import {
  authenticateSession,
  //   // These are left here intentionally for future reference.
  //   //currentSession,
  //   //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | auth-methods | create ', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let getAuthMethodsCount;
  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    authMethod: null,
    orgScope: null,
  };

  const urls = {
    orgScope: null,
    authMethods: null,
    newAuthMethod: null,
    authMethod: null,
  };

  hooks.beforeEach(function () {
    authenticateSession({});
    instances.orgScope = this.server.create(
      'scope',
      {
        type: 'org',
        scope: { id: 'global', type: 'global' },
      },
      'withChildren'
    );

    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.orgScope.id, type: instances.orgScope.type },
    });

    instances.authMethod = this.server.create('auth-method', {
      scope: instances.orgScope,
    });

    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.orgScope.id}`;
    urls.authMethods = `${urls.orgScope}/auth-methods`;
    urls.newAuthMethod = `${urls.authMethods}/new?type=password`;
    urls.authMethod = `${urls.authMethods}/${instances.authMethod.id}`;
    getAuthMethodsCount = () =>
      this.server.schema.authMethods.all().models.length;
  });

  test('Users can create new auth method', async function (assert) {
    assert.expect(1);
    const count = getAuthMethodsCount();

    await visit(urls.newAuthMethod);
    await fillIn('[name="name"]', 'AuthMethod name');
    await fillIn('[name="description"]', 'description');
    await click('form [type="submit"]:not(:disabled)');
    assert.strictEqual(getAuthMethodsCount(), count + 1);
  });

  test('Users can create new oidc auth method', async function (assert) {
    assert.expect(13);
    const count = getAuthMethodsCount();

    await visit(`${urls.authMethods}/new?type=oidc`);
    const name = 'oidc name';
    await fillIn('[name="name"]', name);
    await fillIn('[name="description"]', 'description');
    await fillIn('[name="issuer"]', 'issuer');
    await fillIn('[name="client_id"]', 'client_id');
    await fillIn('[name="client_secret"]', 'client_secret');
    await select('form fieldset:nth-of-type(1) select', 'RS384');
    await click('form fieldset:nth-of-type(1) [title="Add"]');
    await fillIn('[name="allowed_audiences"]', 'allowed_audiences');
    await click('form fieldset:nth-of-type(2) [title="Add"]');
    await fillIn('[name="claims_scopes"]', 'claims_scopes');
    await click('form fieldset:nth-of-type(3) [title="Add"]');
    await fillIn('[name="from_claim"]', 'from_claim');
    await select('form fieldset:nth-of-type(4) select', 'email');
    await click('form fieldset:nth-of-type(4) [title="Add"]');
    await fillIn('form fieldset:nth-of-type(5) textarea', 'certificates');
    await click('form fieldset:nth-of-type(5) [title="Add"]');
    await fillIn('[name="max_age"]', '5');
    await fillIn('[name="api_url_prefix"]', 'api_url_prefix');
    await click('form [type="submit"]:not(:disabled)');

    assert.strictEqual(getAuthMethodsCount(), count + 1);
    const authMethod = this.server.schema.authMethods.findBy({ name });
    assert.strictEqual(authMethod.name, name);
    assert.strictEqual(authMethod.description, 'description');
    assert.strictEqual(authMethod.attributes.issuer, 'issuer');
    assert.strictEqual(authMethod.attributes.client_id, 'client_id');
    assert.strictEqual(authMethod.attributes.client_secret, 'client_secret');
    assert.deepEqual(authMethod.attributes.signing_algorithms, ['RS384']);
    assert.deepEqual(authMethod.attributes.allowed_audiences, [
      'allowed_audiences',
    ]);
    assert.deepEqual(authMethod.attributes.claims_scopes, ['claims_scopes']);
    assert.deepEqual(authMethod.attributes.account_claim_maps, [
      'from_claim=email',
    ]);
    assert.deepEqual(authMethod.attributes.idp_ca_certs, ['certificates']);
    assert.strictEqual(authMethod.attributes.max_age, 5);
    assert.strictEqual(authMethod.attributes.api_url_prefix, 'api_url_prefix');
  });

  test('Users can navigate to new auth-methods route with proper authorization', async function (assert) {
    assert.expect(2);
    instances.orgScope.authorized_collection_actions['auth-methods'] = [
      'create',
      'list',
    ];
    await visit(urls.authMethods);
    assert.ok(
      instances.orgScope.authorized_collection_actions['auth-methods'].includes(
        'create'
      )
    );
    assert.ok(find(`[href="${urls.newAuthMethod}"]`));
  });

  test('Users cannot navigate to new auth-methods route without proper authorization', async function (assert) {
    assert.expect(2);
    instances.orgScope.authorized_collection_actions['auth-methods'] = [];
    await visit(urls.authMethods);
    assert.notOk(
      instances.orgScope.authorized_collection_actions['auth-methods'].includes(
        'create'
      )
    );
    assert.notOk(find(`[href="${urls.newAuthMethod}"]`));
  });

  test('can cancel new auth method creation', async function (assert) {
    assert.expect(2);
    const count = getAuthMethodsCount();
    await visit(urls.newAuthMethod);
    await fillIn('[name="name"]', 'AuthMethod name');
    await fillIn('[name="description"]', 'description');
    await click('form button:not([type="submit"])');
    assert.strictEqual(getAuthMethodsCount(), count);
    assert.strictEqual(currentURL(), urls.authMethods);
  });

  test('user can make primary an auth method', async function (assert) {
    assert.expect(2);
    assert.notOk(
      instances.orgScope.primaryAuthMethodId,
      'Primary auth method is not yet set.'
    );
    await visit(urls.authMethod);
    await click(
      '.rose-layout-page-actions .rose-dropdown-content [type="button"]:first-child'
    );
    const scope = this.server.schema.scopes.find(instances.orgScope.id);
    assert.strictEqual(
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
    await visit(urls.authMethods);
    await click(
      '.rose-table-body .rose-table-row:first-child .rose-dropdown-content [type="button"]:first-child'
    );
    let scope = this.server.schema.scopes.find(instances.orgScope.id);
    assert.strictEqual(
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
