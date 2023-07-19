/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import {
  visit,
  click,
  find,
  fillIn,
  select,
  findAll,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import {
  authenticateSession,
  //   // These are left here intentionally for future reference.
  //   //currentSession,
  //   //invalidateSession,
} from 'ember-simple-auth/test-support';
import { TYPE_AUTH_METHOD_OIDC } from 'api/models/auth-method';

module('Acceptance | auth methods | update', function (hooks) {
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
    newAuthMethod: null,
    authMethod: null,
  };

  hooks.beforeEach(function () {
    // Setup Mirage mock resources for this test
    authenticateSession({});
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.authMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
    });

    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.authMethods = `${urls.orgScope}/auth-methods`;
    urls.newAuthMethod = `${urls.authMethods}/new?type=password`;
    urls.authMethod = `${urls.authMethods}/${instances.authMethod.id}`;
  });

  test('can update an auth method and save changes', async function (assert) {
    assert.expect(1);
    await visit(urls.authMethod);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'update name');
    await click('form [type="submit"]:not(:disabled)');
    assert.strictEqual(this.server.db.authMethods[0].name, 'update name');
  });

  test('can update an oidc auth method and save changes', async function (assert) {
    assert.expect(12);
    instances.authMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
      type: TYPE_AUTH_METHOD_OIDC,
    });
    await visit(`${urls.authMethods}/${instances.authMethod.id}`);
    await click('form [type="button"]:not(:disabled)', 'Activate edit mode');
    const name = 'oidc name';
    await fillIn('[name="name"]', name);
    await fillIn('[name="description"]', 'description');
    await fillIn('[name="issuer"]', 'issuer');
    await fillIn('[name="client_id"]', 'client_id');
    await fillIn('[name="client_secret"]', 'client_secret');
    // Remove all signing algorithms
    await Promise.all(
      findAll('form fieldset:nth-of-type(1) [title="Remove"]').map((element) =>
        click(element)
      )
    );
    await select('form fieldset:nth-of-type(1) select', 'RS384');
    await click('form fieldset:nth-of-type(1) [title="Add"]');
    // Remove all allowed audiences
    await Promise.all(
      findAll('form fieldset:nth-of-type(2) [title="Remove"]').map((element) =>
        click(element)
      )
    );
    await fillIn('[name="allowed_audiences"]', 'allowed_audiences');
    await click('form fieldset:nth-of-type(2) [title="Add"]');
    // Remove all claims scopes
    await Promise.all(
      findAll('form fieldset:nth-of-type(3) [title="Remove"]').map((element) =>
        click(element)
      )
    );
    await fillIn('[name="claims_scopes"]', 'claims_scopes');
    await click('form fieldset:nth-of-type(3) [title="Add"]');
    // Remove all claim maps
    await Promise.all(
      findAll('form fieldset:nth-of-type(4) [title="Remove"]').map((element) =>
        click(element)
      )
    );
    await fillIn('[name="from_claim"]', 'from_claim');
    await select('form fieldset:nth-of-type(4) select', 'email');
    await click('form fieldset:nth-of-type(4) [title="Add"]');
    // Remove all certificates
    await Promise.all(
      findAll('form fieldset:nth-of-type(5) [title="Remove"]').map((element) =>
        click(element)
      )
    );
    await fillIn('form fieldset:nth-of-type(5) textarea', 'certificates');
    await click('form fieldset:nth-of-type(5) [title="Add"]');
    await fillIn('[name="max_age"]', '5');
    await fillIn('[name="api_url_prefix"]', 'api_url_prefix');
    await click('form [type="submit"]:not(:disabled)');

    const authMethod = this.server.schema.authMethods.findBy({ name });
    assert.strictEqual(authMethod.name, name);
    assert.strictEqual(authMethod.description, 'description');
    assert.strictEqual(authMethod.attributes.issuer, 'issuer');
    assert.strictEqual(authMethod.attributes.client_id, 'client_id');
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

  test('can update an auth method and cancel changes', async function (assert) {
    assert.expect(1);
    await visit(urls.authMethod);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'update name');
    await click('form button:not([type="submit"])');
    assert.notEqual(this.server.db.authMethods[0].name, 'update name');
  });

  test('cannot make changes to an existing auth method without proper authorization', async function (assert) {
    assert.expect(1);
    instances.authMethod.authorized_actions =
      instances.authMethod.authorized_actions.filter(
        (item) => item !== 'update'
      );
    await visit(urls.authMethod);
    assert.notOk(find('.rose-layout-page-actions .rose-button-secondary'));
  });

  test('saving an existing auth method with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.patch('/auth-methods/:id', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {
            request_fields: [
              {
                name: 'name',
                description: 'Name is required.',
              },
            ],
          },
        }
      );
    });
    await visit(urls.authMethod);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'existing auth method');
    await click('form [type="submit"]');
    await a11yAudit();
    assert.strictEqual(
      find('.rose-notification-body').textContent.trim(),
      'The request was invalid.',
      'Displays primary error message.'
    );
    assert.strictEqual(
      find('.rose-form-error-message').textContent.trim(),
      'Name is required.',
      'Displays field-level errors.'
    );
  });
});
