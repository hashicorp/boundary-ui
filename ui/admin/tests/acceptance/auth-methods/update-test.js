/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, click, fillIn, select, findAll } from '@ember/test-helpers';
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
import {
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';

module('Acceptance | auth methods | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let featuresService;

  const BUTTON_SELECTOR = '.rose-form-actions [type="button"]';
  const SAVE_BTN_SELECTOR = '.rose-form-actions [type="submit"]';
  const NAME_INPUT_SELECTOR = '[name="name"]';
  const URLS_INPUT_SELECTOR = '[name="urls"]';
  const DESC_INPUT_SELECTOR = '[name="description"]';
  const ERROR_MSG_SELECTOR = '.rose-notification-body';
  const FIELD_ERROR_TEXT_SELECTOR = '.hds-form-error__message';

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    authMethod: null,
    ldapAuthMethod: null,
  };
  const urls = {
    orgScope: null,
    authMethods: null,
    newAuthMethod: null,
    authMethod: null,
    ldapAuthMethod: null,
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
    instances.ldapAuthMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
      type: TYPE_AUTH_METHOD_LDAP,
    });

    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.authMethods = `${urls.orgScope}/auth-methods`;
    urls.newAuthMethod = `${urls.authMethods}/new?type=password`;
    urls.authMethod = `${urls.authMethods}/${instances.authMethod.id}`;
    urls.ldapAuthMethod = `${urls.authMethods}/${instances.ldapAuthMethod.id}`;
    featuresService = this.owner.lookup('service:features');
  });

  test('can update an auth method and save changes', async function (assert) {
    assert.expect(1);
    await visit(urls.authMethods);

    await click(`[href="${urls.authMethod}"]`);
    await click(BUTTON_SELECTOR, 'Activate edit mode');
    await fillIn(NAME_INPUT_SELECTOR, 'update name');
    await click(SAVE_BTN_SELECTOR);

    assert.strictEqual(
      this.server.schema.authMethods.first().name,
      'update name'
    );
  });

  test('can update an oidc auth method and save changes', async function (assert) {
    assert.expect(11);
    instances.authMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
      type: TYPE_AUTH_METHOD_OIDC,
    });
    await visit(urls.authMethods);

    await click(`[href="${urls.authMethods}/${instances.authMethod.id}"]`);
    await click(BUTTON_SELECTOR, 'Activate edit mode');
    const name = 'oidc name';
    await fillIn(NAME_INPUT_SELECTOR, name);
    await fillIn(DESC_INPUT_SELECTOR, 'description');
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

  test('can update an ldap auth method and save changes', async function (assert) {
    assert.expect(19);
    featuresService.enable('ldap-auth-methods');
    await visit(urls.authMethods);
    const name = 'ldap auth method';

    await click(`[href="${urls.ldapAuthMethod}"]`);
    await click(BUTTON_SELECTOR, 'Activate edit mode');
    await fillIn(NAME_INPUT_SELECTOR, name);
    await fillIn(DESC_INPUT_SELECTOR, 'description');
    await fillIn('[name="urls"]', 'url1,url2');
    await click('[name="certificates"] .hds-button--color-critical');
    // Remove certificate
    await fillIn('[name="certificates"] textarea', 'certificate');
    await click('[name="certificates"] button');
    await click('[name="start_tls"]');
    await click('[name="insecure_tls"]');
    await fillIn('[name="bind_dn"]', 'bind dn');
    await fillIn('[name="upn_domain"]', 'upn domain');
    await click('[name="discover_dn"]');
    await click('[name="anon_group_search"]');
    await fillIn('[name="user_dn"]', 'user dn');
    await fillIn('[name="user_attr"]', 'user attr');
    await fillIn('[name="user_filter"]', 'user filter');
    // Remove all attribute maps
    await Promise.all(
      findAll(
        '[name="account_attribute_maps"] .hds-button--color-critical'
      ).map((element) => click(element))
    );
    await fillIn('[name="account_attribute_maps"] input', 'attribute');
    await select('[name="account_attribute_maps"] select', 'email');
    await click('[name="account_attribute_maps"] button');
    await fillIn('[name="group_dn"]', 'group dn');
    await fillIn('[name="group_attr"]', 'group attr');
    await fillIn('[name="group_filter"]', 'group filter');
    await click('[name="enable_groups"]');
    await click('[name="use_token_groups"]');
    await click(SAVE_BTN_SELECTOR);

    const ldapAuthMethod = this.server.schema.authMethods.findBy({ name });
    assert.strictEqual(ldapAuthMethod.name, name);
    assert.strictEqual(ldapAuthMethod.description, 'description');
    assert.deepEqual(ldapAuthMethod.attributes.urls, ['url1', 'url2']);
    assert.deepEqual(ldapAuthMethod.attributes.certificates, ['certificate']);
    assert.true(ldapAuthMethod.attributes.start_tls);
    assert.true(ldapAuthMethod.attributes.insecure_tls);
    assert.strictEqual(ldapAuthMethod.attributes.bind_dn, 'bind dn');
    assert.strictEqual(ldapAuthMethod.attributes.upn_domain, 'upn domain');
    assert.true(ldapAuthMethod.attributes.discover_dn);
    assert.true(ldapAuthMethod.attributes.anon_group_search);
    assert.strictEqual(ldapAuthMethod.attributes.user_dn, 'user dn');
    assert.strictEqual(ldapAuthMethod.attributes.user_attr, 'user attr');
    assert.strictEqual(ldapAuthMethod.attributes.user_filter, 'user filter');
    assert.deepEqual(ldapAuthMethod.attributes.account_attribute_maps, [
      'attribute=email',
    ]);
    assert.strictEqual(ldapAuthMethod.attributes.group_dn, 'group dn');
    assert.strictEqual(ldapAuthMethod.attributes.group_attr, 'group attr');
    assert.strictEqual(ldapAuthMethod.attributes.group_filter, 'group filter');
    assert.false(ldapAuthMethod.attributes.enable_groups);
    assert.true(ldapAuthMethod.attributes.use_token_groups);
  });

  test('can update an auth method and cancel changes', async function (assert) {
    assert.expect(1);
    await visit(urls.authMethod);

    await click(BUTTON_SELECTOR, 'Activate edit mode');
    await fillIn(NAME_INPUT_SELECTOR, 'update name');
    await click(BUTTON_SELECTOR, 'Cancel');

    assert.notEqual(this.server.schema.authMethods.first().name, 'update name');
  });

  test('can update an ldap auth method and cancel changes', async function (assert) {
    assert.expect(2);
    featuresService.enable('ldap-auth-methods');
    await visit(urls.authMethods);
    const name = instances.ldapAuthMethod.name;
    const ldapAuthMethod = this.server.schema.authMethods.findBy({ name });
    const { certificates, account_attribute_maps } = ldapAuthMethod.attributes;

    await click(`[href="${urls.ldapAuthMethod}"]`);
    await click(BUTTON_SELECTOR, 'Activate edit mode');
    await fillIn('[name="certificates"] textarea', 'cert123');
    await fillIn('[name="account_attribute_maps"] input', 'attribute');
    await select('[name="account_attribute_maps"] select', 'email');
    await click(BUTTON_SELECTOR, 'Cancel');

    assert.deepEqual(ldapAuthMethod.attributes.certificates, certificates);
    assert.deepEqual(
      ldapAuthMethod.attributes.account_attribute_maps,
      account_attribute_maps
    );
  });

  test('cannot make changes to an existing auth method without proper authorization', async function (assert) {
    assert.expect(1);
    instances.authMethod.authorized_actions =
      instances.authMethod.authorized_actions.filter(
        (item) => item !== 'update'
      );
    await visit(urls.authMethods);

    await click(`[href="${urls.authMethod}"]`);

    assert.dom(BUTTON_SELECTOR).doesNotExist();
  });

  test('cannot make changes to an existing ldap auth method without proper authorization', async function (assert) {
    assert.expect(1);
    featuresService.enable('ldap-auth-methods');
    instances.ldapAuthMethod.authorized_actions =
      instances.ldapAuthMethod.authorized_actions.filter(
        (item) => item !== 'update'
      );
    await visit(urls.authMethods);

    await click(`[href="${urls.ldapAuthMethod}"]`);

    assert.dom(BUTTON_SELECTOR).doesNotExist();
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
    await visit(urls.authMethods);

    await click(`[href="${urls.authMethod}"]`);
    await click(BUTTON_SELECTOR, 'Activate edit mode');
    await fillIn(NAME_INPUT_SELECTOR, 'existing auth method');
    await click(SAVE_BTN_SELECTOR);
    await a11yAudit();
    assert.dom(ERROR_MSG_SELECTOR).hasText('The request was invalid.');
    assert.dom('.rose-form-error-message').hasText('Name is required.');
  });

  test('saving an existing ldap auth method with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    featuresService.enable('ldap-auth-methods');
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
                name: 'urls',
                description: 'scheme in url "" is not either ldap or ldaps',
              },
            ],
          },
        }
      );
    });
    await visit(urls.authMethods);

    await click(`[href="${urls.ldapAuthMethod}"]`);
    await click(BUTTON_SELECTOR, 'Activate edit mode');
    await fillIn(URLS_INPUT_SELECTOR, '');
    await click(SAVE_BTN_SELECTOR);
    await a11yAudit();
    assert.dom(ERROR_MSG_SELECTOR).hasText('The request was invalid.');
    assert
      .dom(FIELD_ERROR_TEXT_SELECTOR)
      .hasText('scheme in url "" is not either ldap or ldaps');
  });
});
