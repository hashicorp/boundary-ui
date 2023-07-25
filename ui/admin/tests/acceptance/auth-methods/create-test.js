/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn, select } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import {
  authenticateSession,
  //   // These are left here intentionally for future reference.
  //   //currentSession,
  //   //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | auth-methods | create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  const DROPDOWN_SELECTOR_ICON =
    'tbody .hds-table__tr:nth-child(1) .hds-table__td:last-child .hds-dropdown-toggle-icon';
  const DROPDOWN_SELECTOR_OPTION =
    '.hds-dropdown__content .hds-dropdown-list-item [type=button]';
  const NEW_DROPDOWN_SELECTOR = '.hds-dropdown-toggle-button';
  const SAVE_BTN_SELECTOR = '.rose-form-actions [type="submit"]';
  const CANCEL_BTN_SELECTOR = '.rose-form-actions [type="button"]';
  const NAME_INPUT_SELECTOR = '[name="name"]';
  const DESC_INPUT_SELECTOR = '[name="description"]';
  const MAKE_PRIMARY_SELECTOR =
    '.rose-layout-page-actions .rose-dropdown-content [type="button"]:first-child';
  const ERROR_MSG_SELECTOR = '.rose-notification-body';
  const FIELD_ERROR_TEXT_SELECTOR = '.hds-form-error__message';

  let getAuthMethodsCount;
  let featuresService;

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
    newLdapAuthMethod: null,
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
    urls.newLdapAuthMethod = `${urls.authMethods}/new?type=ldap`;
    urls.authMethod = `${urls.authMethods}/${instances.authMethod.id}`;
    getAuthMethodsCount = () =>
      this.server.schema.authMethods.all().models.length;

    featuresService = this.owner.lookup('service:features');
  });

  test('Users can create new auth method', async function (assert) {
    assert.expect(1);
    const count = getAuthMethodsCount();

    await visit(urls.newAuthMethod);
    await fillIn(NAME_INPUT_SELECTOR, 'AuthMethod name');
    await fillIn(DESC_INPUT_SELECTOR, 'description');
    await click(SAVE_BTN_SELECTOR);
    assert.strictEqual(getAuthMethodsCount(), count + 1);
  });

  test('Users can create new oidc auth method', async function (assert) {
    assert.expect(13);
    const count = getAuthMethodsCount();

    await visit(`${urls.authMethods}/new?type=oidc`);
    const name = 'oidc name';
    await fillIn(NAME_INPUT_SELECTOR, name);
    await fillIn(DESC_INPUT_SELECTOR, 'description');
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
    await click(SAVE_BTN_SELECTOR);

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

  test('Users can create a new ldap auth method', async function (assert) {
    assert.expect(23);
    featuresService.enable('ldap-auth-methods');
    const authMethodsCount = getAuthMethodsCount();
    const name = 'ldap auth method';
    await visit(urls.authMethods);

    await click(NEW_DROPDOWN_SELECTOR);
    await click(`[href="${urls.newLdapAuthMethod}"]`);
    await fillIn(NAME_INPUT_SELECTOR, name);
    await fillIn(DESC_INPUT_SELECTOR, 'description');
    await fillIn('[name="urls"]', 'url1,url2');
    await fillIn('[name="certificates"] textarea', 'certificate');
    await click('[name="certificates"] button');
    await fillIn('[name="client_certificate"]', 'client cert');
    await fillIn('[name="client_certificate_key"]', 'client cert key');
    await click('[name="start_tls"]');
    await click('[name="insecure_tls"]');
    await fillIn('[name="bind_dn"]', 'bind dn');
    await fillIn('[name="bind_password"]', 'password');
    await fillIn('[name="upn_domain"]', 'upn domain');
    await click('[name="discover_dn"]');
    await click('[name="anon_group_search"]');
    await fillIn('[name="user_dn"]', 'user dn');
    await fillIn('[name="user_attr"]', 'user attr');
    await fillIn('[name="user_filter"]', 'user filter');
    await fillIn('[name="account_attribute_maps"] input', 'attribute');
    await select('[name="account_attribute_maps"] select', 'email');
    await click('[name="account_attribute_maps"] button');
    await fillIn('[name="group_dn"]', 'group dn');
    await fillIn('[name="group_attr"]', 'group attr');
    await fillIn('[name="group_filter"]', 'group filter');
    await click('[name="enable_groups"]');
    await click('[name="use_token_groups"]');
    await click(SAVE_BTN_SELECTOR);

    assert.strictEqual(getAuthMethodsCount(), authMethodsCount + 1);
    const ldapAuthMethod = this.server.schema.authMethods.findBy({ name });
    assert.strictEqual(ldapAuthMethod.name, name);
    assert.strictEqual(ldapAuthMethod.description, 'description');
    assert.deepEqual(ldapAuthMethod.attributes.urls, ['url1', 'url2']);
    assert.deepEqual(ldapAuthMethod.attributes.certificates, ['certificate']);
    assert.strictEqual(
      ldapAuthMethod.attributes.client_certificate,
      'client cert'
    );
    assert.notOk(ldapAuthMethod.attributes.client_certificate_key);
    assert.true(ldapAuthMethod.attributes.start_tls);
    assert.true(ldapAuthMethod.attributes.insecure_tls);
    assert.strictEqual(ldapAuthMethod.attributes.bind_dn, 'bind dn');
    assert.notOk(ldapAuthMethod.attributes.bind_password);
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
    assert.true(ldapAuthMethod.attributes.enable_groups);
    assert.true(ldapAuthMethod.attributes.use_token_groups);
  });

  test('Users can navigate to new auth-methods route with proper authorization', async function (assert) {
    assert.expect(2);
    instances.orgScope.authorized_collection_actions['auth-methods'] = [
      'create',
      'list',
    ];

    await visit(urls.orgScope);
    await click(`[href="${urls.authMethods}"]`);

    assert.true(
      instances.orgScope.authorized_collection_actions['auth-methods'].includes(
        'create'
      )
    );

    await click(NEW_DROPDOWN_SELECTOR);

    assert.dom(`[href="${urls.newAuthMethod}"]`).exists();
  });

  test('Users cannot navigate to new auth-methods route without proper authorization', async function (assert) {
    assert.expect(2);
    instances.orgScope.authorized_collection_actions['auth-methods'] = ['list'];

    await visit(urls.orgScope);
    await click(`[href="${urls.authMethods}"]`);

    assert.false(
      instances.orgScope.authorized_collection_actions['auth-methods'].includes(
        'create'
      )
    );
    assert.dom(NEW_DROPDOWN_SELECTOR).doesNotExist();
  });

  test('Users can navigate to new ldap auth-method route with proper authorization and feature flag enabled', async function (assert) {
    assert.expect(2);
    instances.orgScope.authorized_collection_actions['auth-methods'] = [
      'create',
      'list',
    ];
    featuresService.enable('ldap-auth-methods');

    await visit(urls.orgScope);
    await click(`[href="${urls.authMethods}"]`);

    assert.true(
      instances.orgScope.authorized_collection_actions['auth-methods'].includes(
        'create'
      )
    );

    await click(NEW_DROPDOWN_SELECTOR);

    assert.dom(`[href="${urls.newLdapAuthMethod}"]`).exists();
  });

  test('Users cannot navigate to new ldap auth-method route when feature flag disabled', async function (assert) {
    assert.expect(2);
    instances.orgScope.authorized_collection_actions['auth-methods'] = [
      'create',
      'list',
    ];

    await visit(urls.orgScope);
    await click(`[href="${urls.authMethods}"]`);

    assert.true(
      instances.orgScope.authorized_collection_actions['auth-methods'].includes(
        'create'
      )
    );

    await click(NEW_DROPDOWN_SELECTOR);

    assert.dom(`[href="${urls.newLdapAuthMethod}"]`).doesNotExist();
  });

  test('can cancel new auth method creation', async function (assert) {
    assert.expect(2);
    const count = getAuthMethodsCount();
    await visit(urls.authMethods);

    await click(NEW_DROPDOWN_SELECTOR);
    await click(`[href="${urls.newAuthMethod}"]`);
    await fillIn(NAME_INPUT_SELECTOR, 'AuthMethod name');
    await fillIn(DESC_INPUT_SELECTOR, 'description');
    await click(CANCEL_BTN_SELECTOR);

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
    await click(MAKE_PRIMARY_SELECTOR);
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
    await click(MAKE_PRIMARY_SELECTOR);
    assert.dom(ERROR_MSG_SELECTOR).exists();
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
    await click(MAKE_PRIMARY_SELECTOR);
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

    assert.strictEqual(
      instances.orgScope.primaryAuthMethodId,
      instances.authMethod.id
    );

    await visit(urls.authMethod);
    await click(MAKE_PRIMARY_SELECTOR);

    assert.dom(ERROR_MSG_SELECTOR).hasText('Sorry!');
  });

  test('user can make and remove primary auth methods from index', async function (assert) {
    assert.expect(4);
    assert.notOk(
      instances.orgScope.primaryAuthMethodId,
      'Primary auth method is not yet set.'
    );
    await visit(urls.authMethods);

    await click(DROPDOWN_SELECTOR_ICON);
    assert.dom(DROPDOWN_SELECTOR_OPTION).exists();
    await click(DROPDOWN_SELECTOR_OPTION);

    let scope = this.server.schema.scopes.find(instances.orgScope.id);

    assert.strictEqual(
      scope.primaryAuthMethodId,
      instances.authMethod.id,
      'Primary auth method is set.'
    );
    await click(DROPDOWN_SELECTOR_ICON);
    await click(DROPDOWN_SELECTOR_OPTION);

    scope = this.server.schema.scopes.find(instances.orgScope.id);
    assert.notOk(scope.primaryAuthMethodId, 'Primary auth method is unset.');
  });

  test('saving a new ldap auth method with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    featuresService.enable('ldap-auth-methods');
    this.server.post('/auth-methods', () => {
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

    await click(NEW_DROPDOWN_SELECTOR);
    await click(`[href="${urls.newLdapAuthMethod}"]`);
    await fillIn(NAME_INPUT_SELECTOR, 'new account');
    await click(SAVE_BTN_SELECTOR);

    assert.dom(ERROR_MSG_SELECTOR).hasText('The request was invalid.');
    assert.dom(FIELD_ERROR_TEXT_SELECTOR).hasText('Name is required.');
  });
});
