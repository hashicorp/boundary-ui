/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn, select } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';

module('Acceptance | auth-methods | create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);

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

  hooks.beforeEach(async function () {
    await authenticateSession({});
    instances.orgScope = this.server.create(
      'scope',
      {
        type: 'org',
        scope: { id: 'global', type: 'global' },
      },
      'withChildren',
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
    const count = getAuthMethodsCount();

    await visit(urls.newAuthMethod);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await fillIn(
      commonSelectors.FIELD_DESCRIPTION,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    await click(commonSelectors.SAVE_BTN);
    assert.strictEqual(getAuthMethodsCount(), count + 1);
  });

  test('Users can create new oidc auth method', async function (assert) {
    const count = getAuthMethodsCount();

    await visit(`${urls.authMethods}/new?type=oidc`);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await fillIn(
      commonSelectors.FIELD_DESCRIPTION,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    await fillIn(selectors.FIELD_ISSUER, selectors.FIELD_ISSUER_VALUE);
    await fillIn(selectors.FIELD_CLIENT_ID, selectors.FIELD_CLIENT_ID_VALUE);
    await fillIn(
      selectors.FIELD_CLIENT_SECRET,
      selectors.FIELD_CLIENT_SECRET_VALUE,
    );
    await select(
      selectors.FIELD_SIGNING_ALGORITHMS,
      selectors.FIELD_SIGNING_ALGORITHMS_VALUE,
    );
    await click(selectors.FIELD_SIGNING_ALGORITHMS_ADD_BTN);
    await fillIn(
      selectors.FIELD_ALLOWED_AUDIENCES,
      selectors.FIELD_ALLOWED_AUDIENCES_VALUE,
    );
    await click(selectors.FIELD_ALLOWED_AUDIENCES_ADD_BTN);
    await fillIn(
      selectors.FIELD_CLAIMS_SCOPES,
      selectors.FIELD_CLAIMS_SCOPES_VALUE,
    );
    await click(selectors.FIELD_CLAIMS_SCOPES_ADD_BTN);

    await fillIn(
      selectors.FIELD_ACCOUNT_CLAIM_MAPS_FROM_CLAIM,
      selectors.FIELD_ACCOUNT_CLAIM_MAPS_FROM_CLAIM_VALUE,
    );
    await select(
      selectors.FIELD_ACCOUNT_CLAIM_MAPS_TO_CLAIM,
      selectors.FIELD_ACCOUNT_CLAIM_MAPS_TO_CLAIM_VALUE,
    );
    await click(selectors.FIELD_ACCOUNT_CLAIM_MAPS_ADD_BTN);

    await fillIn(selectors.FIELD_IDP_CERTS, selectors.FIELD_IDP_CERTS_VALUE);
    await click(selectors.FIELD_IDP_CERTS_ADD_BTN);
    await fillIn(selectors.FIELD_MAX_AGE, selectors.FIELD_MAX_AGE_VALUE);

    await fillIn(
      selectors.FIELD_API_URL_PREFIX,
      selectors.FIELD_API_URL_PREFIX_VALUE,
    );
    await click(selectors.FIELD_PROMPTS_CONSENT);

    //If skip prompts toggle is clicked, then we hide the rest of the prompt options
    await click(selectors.FIELD_PROMPTS);
    assert.dom(selectors.FIELD_PROMPTS_SELECT_ACCOUNT).isNotVisible();
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(getAuthMethodsCount(), count + 1);
    const authMethod = this.server.schema.authMethods.findBy({
      name: commonSelectors.FIELD_NAME_VALUE,
    });
    assert.strictEqual(authMethod.name, commonSelectors.FIELD_NAME_VALUE);
    assert.strictEqual(
      authMethod.description,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    assert.strictEqual(
      authMethod.attributes.issuer,
      selectors.FIELD_ISSUER_VALUE,
    );
    assert.strictEqual(
      authMethod.attributes.client_id,
      selectors.FIELD_CLIENT_ID_VALUE,
    );
    assert.deepEqual(authMethod.attributes.signing_algorithms, [
      selectors.FIELD_SIGNING_ALGORITHMS_VALUE,
    ]);
    assert.deepEqual(authMethod.attributes.allowed_audiences, [
      selectors.FIELD_ALLOWED_AUDIENCES_VALUE,
    ]);
    assert.deepEqual(authMethod.attributes.claims_scopes, [
      selectors.FIELD_CLAIMS_SCOPES_VALUE,
    ]);
    assert.deepEqual(authMethod.attributes.account_claim_maps, [
      `${selectors.FIELD_ACCOUNT_CLAIM_MAPS_FROM_CLAIM_VALUE}=${selectors.FIELD_ACCOUNT_CLAIM_MAPS_TO_CLAIM_VALUE}`,
    ]);
    assert.deepEqual(authMethod.attributes.idp_ca_certs, [
      selectors.FIELD_IDP_CERTS_VALUE,
    ]);
    assert.strictEqual(
      authMethod.attributes.max_age,
      parseInt(selectors.FIELD_MAX_AGE_VALUE),
    );
    assert.strictEqual(
      authMethod.attributes.api_url_prefix,
      selectors.FIELD_API_URL_PREFIX_VALUE,
    );
    assert.deepEqual(authMethod.attributes.prompts, ['none']);
  });

  test('Users can create a new ldap auth method', async function (assert) {
    featuresService.enable('ldap-auth-methods');
    const authMethodsCount = getAuthMethodsCount();
    await visit(urls.authMethods);

    await click(selectors.NEW_DROPDOWN);
    await click(commonSelectors.HREF(urls.newLdapAuthMethod));
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await fillIn(
      commonSelectors.FIELD_DESCRIPTION,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    await fillIn(selectors.FIELD_URLS, selectors.FIELD_URLS_VALUE);
    await fillIn(
      selectors.FIELD_CERTIFICATES,
      selectors.FIELD_CERTIFICATES_VALUE,
    );
    await click(selectors.FIELD_CERTIFICATES_ADD_BTN);
    await fillIn(
      selectors.FIELD_CLIENT_CERTIFICATE,
      selectors.FIELD_CLIENT_CERTIFICATE_VALUE,
    );
    await fillIn(
      selectors.FIELD_CLIENT_CERTIFICATE_KEY,
      selectors.FIELD_CLIENT_CERTIFICATE_KEY_VALUE,
    );
    await click(selectors.FIELD_START_TLS);
    await click(selectors.FIELD_INSECURE_TLS);
    await fillIn(selectors.FIELD_BIND_DN, selectors.FIELD_BIND_DN_VALUE);
    await fillIn(
      selectors.FIELD_BIND_PASSWORD,
      selectors.FIELD_BIND_PASSWORD_VALUE,
    );
    await fillIn(selectors.FIELD_UPN_DOMAIN, selectors.FIELD_UPN_DOMAIN_VALUE);
    await click(selectors.FIELD_DISCOVER_DN);
    await click(selectors.FIELD_ANON_GROUP_SEARCH);
    await fillIn(selectors.FIELD_USER_DN, selectors.FIELD_USER_DN_VALUE);
    await fillIn(selectors.FIELD_USER_ATTR, selectors.FIELD_USER_ATTR_VALUE);
    await fillIn(
      selectors.FIELD_USER_FILTER,
      selectors.FIELD_USER_FILTER_VALUE,
    );
    await fillIn(
      selectors.FIELD_ACCOUNT_ATTRIBUTE_MAPS_FROM,
      selectors.FIELD_ACCOUNT_ATTRIBUTE_MAPS_FROM_VALUE,
    );
    await select(
      selectors.FIELD_ACCOUNT_ATTRIBUTE_MAPS_TO,
      selectors.FIELD_ACCOUNT_ATTRIBUTE_MAPS_TO_VALUE,
    );
    await click(selectors.FIELD_ACCOUNT_ATTRIBUTE_MAPS_ADD_BTN);
    await fillIn(selectors.FIELD_GROUP_DN, selectors.FIELD_GROUP_DN_VALUE);
    await fillIn(selectors.FIELD_GROUP_ATTR, selectors.FIELD_GROUP_ATTR_VALUE);
    await fillIn(
      selectors.FIELD_GROUP_FILTER,
      selectors.FIELD_GROUP_FILTER_VALUE,
    );
    await click(selectors.FIELD_ENABLE_GROUPS);
    await click(selectors.FIELD_USE_TOKEN_GROUPS);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(getAuthMethodsCount(), authMethodsCount + 1);
    const ldapAuthMethod = this.server.schema.authMethods.findBy({
      name: commonSelectors.FIELD_NAME_VALUE,
    });
    assert.strictEqual(ldapAuthMethod.name, commonSelectors.FIELD_NAME_VALUE);
    assert.strictEqual(
      ldapAuthMethod.description,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    assert.deepEqual(
      ldapAuthMethod.attributes.urls,
      selectors.FIELD_URLS_VALUE.split(','),
    );
    assert.deepEqual(ldapAuthMethod.attributes.certificates, [
      selectors.FIELD_CERTIFICATES_VALUE,
    ]);
    assert.strictEqual(
      ldapAuthMethod.attributes.client_certificate,
      selectors.FIELD_CLIENT_CERTIFICATE_VALUE,
    );
    assert.notOk(ldapAuthMethod.attributes.client_certificate_key);
    assert.true(ldapAuthMethod.attributes.start_tls);
    assert.true(ldapAuthMethod.attributes.insecure_tls);
    assert.strictEqual(
      ldapAuthMethod.attributes.bind_dn,
      selectors.FIELD_BIND_DN_VALUE,
    );
    assert.notOk(ldapAuthMethod.attributes.bind_password);
    assert.strictEqual(
      ldapAuthMethod.attributes.upn_domain,
      selectors.FIELD_UPN_DOMAIN_VALUE,
    );
    assert.true(ldapAuthMethod.attributes.discover_dn);
    assert.true(ldapAuthMethod.attributes.anon_group_search);
    assert.strictEqual(
      ldapAuthMethod.attributes.user_dn,
      selectors.FIELD_USER_DN_VALUE,
    );
    assert.strictEqual(
      ldapAuthMethod.attributes.user_attr,
      selectors.FIELD_USER_ATTR_VALUE,
    );
    assert.strictEqual(
      ldapAuthMethod.attributes.user_filter,
      selectors.FIELD_USER_FILTER_VALUE,
    );
    assert.deepEqual(ldapAuthMethod.attributes.account_attribute_maps, [
      `${selectors.FIELD_ACCOUNT_ATTRIBUTE_MAPS_FROM_VALUE}=${selectors.FIELD_ACCOUNT_ATTRIBUTE_MAPS_TO_VALUE}`,
    ]);
    assert.strictEqual(
      ldapAuthMethod.attributes.group_dn,
      selectors.FIELD_GROUP_DN_VALUE,
    );
    assert.strictEqual(
      ldapAuthMethod.attributes.group_attr,
      selectors.FIELD_GROUP_ATTR_VALUE,
    );
    assert.strictEqual(
      ldapAuthMethod.attributes.group_filter,
      selectors.FIELD_GROUP_FILTER_VALUE,
    );
    assert.true(ldapAuthMethod.attributes.enable_groups);
    assert.true(ldapAuthMethod.attributes.use_token_groups);
  });

  test('Users can navigate to new auth-methods route with proper authorization', async function (assert) {
    instances.orgScope.authorized_collection_actions['auth-methods'] = [
      'create',
      'list',
    ];

    await visit(urls.orgScope);
    await click(commonSelectors.HREF(urls.authMethods));

    assert.true(
      instances.orgScope.authorized_collection_actions['auth-methods'].includes(
        'create',
      ),
    );

    await click(selectors.NEW_DROPDOWN);
    assert.dom(commonSelectors.HREF(urls.newAuthMethod)).isVisible();
  });

  test('Users cannot navigate to new auth-methods route without proper authorization', async function (assert) {
    instances.orgScope.authorized_collection_actions['auth-methods'] = ['list'];

    await visit(urls.orgScope);
    await click(commonSelectors.HREF(urls.authMethods));

    assert.false(
      instances.orgScope.authorized_collection_actions['auth-methods'].includes(
        'create',
      ),
    );
    assert.dom(selectors.NEW_DROPDOWN).doesNotExist();
  });

  test('Users can navigate to new ldap auth-method route with proper authorization and feature flag enabled', async function (assert) {
    instances.orgScope.authorized_collection_actions['auth-methods'] = [
      'create',
      'list',
    ];
    featuresService.enable('ldap-auth-methods');

    await visit(urls.orgScope);
    await click(commonSelectors.HREF(urls.authMethods));

    assert.true(
      instances.orgScope.authorized_collection_actions['auth-methods'].includes(
        'create',
      ),
    );

    await click(selectors.NEW_DROPDOWN);
    assert.dom(commonSelectors.HREF(urls.newLdapAuthMethod)).isVisible();
  });

  test('Users cannot navigate to new ldap auth-method route when feature flag disabled', async function (assert) {
    instances.orgScope.authorized_collection_actions['auth-methods'] = [
      'create',
      'list',
    ];

    await visit(urls.orgScope);
    await click(commonSelectors.HREF(urls.authMethods));

    assert.true(
      instances.orgScope.authorized_collection_actions['auth-methods'].includes(
        'create',
      ),
    );

    await click(selectors.NEW_DROPDOWN);
    assert.dom(commonSelectors.HREF(urls.newLdapAuthMethod)).doesNotExist();
  });

  test('can cancel new auth method creation', async function (assert) {
    const count = getAuthMethodsCount();
    await visit(urls.authMethods);

    await click(selectors.NEW_DROPDOWN);
    await click(commonSelectors.HREF(urls.newAuthMethod));
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await fillIn(
      commonSelectors.FIELD_DESCRIPTION,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(getAuthMethodsCount(), count);
    assert.strictEqual(currentURL(), urls.authMethods);
  });

  test('user can make primary an auth method', async function (assert) {
    assert.notOk(
      instances.orgScope.primaryAuthMethodId,
      'Primary auth method is not yet set.',
    );
    await visit(urls.authMethods);

    await click(commonSelectors.HREF(urls.authMethod));
    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.MANAGE_DROPDOWN_MAKE_PRIMARY);

    const scope = this.server.schema.scopes.find(instances.orgScope.id);
    assert.strictEqual(
      scope.primaryAuthMethodId,
      instances.authMethod.id,
      'Primary auth method is set.',
    );
  });

  test('user is notified of error on make primary an auth method', async function (assert) {
    this.server.patch('/scopes/:id', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'fail',
          message: 'Sorry!',
        },
      );
    });
    assert.notOk(
      instances.orgScope.primaryAuthMethodId,
      'Primary auth method is not yet set.',
    );

    await visit(urls.authMethod);
    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.MANAGE_DROPDOWN_MAKE_PRIMARY);

    assert.dom(commonSelectors.ALERT_TOAST).isVisible();
  });

  test('user can remove as primary an auth method', async function (assert) {
    instances.orgScope.update({
      primaryAuthMethodId: instances.authMethod.id,
    });
    assert.ok(
      instances.orgScope.primaryAuthMethodId,
      'Primary auth method is set.',
    );
    await visit(urls.authMethods);

    await click(commonSelectors.HREF(urls.authMethod));
    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.MANAGE_DROPDOWN_MAKE_PRIMARY);
    const scope = this.server.schema.scopes.find(instances.orgScope.id);
    assert.notOk(scope.primaryAuthMethodId, 'Primary auth method is unset.');
  });

  test('user is notified of error on remove as primary an auth method', async function (assert) {
    this.server.patch('/scopes/:id', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'fail',
          message: 'Sorry!',
        },
      );
    });
    instances.orgScope.update({
      primaryAuthMethodId: instances.authMethod.id,
    });

    assert.strictEqual(
      instances.orgScope.primaryAuthMethodId,
      instances.authMethod.id,
    );
    await visit(urls.authMethods);

    await click(commonSelectors.HREF(urls.authMethod));
    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.MANAGE_DROPDOWN_MAKE_PRIMARY);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText('Sorry!');
  });

  test('user can make and remove primary auth methods from index', async function (assert) {
    assert.notOk(
      instances.orgScope.primaryAuthMethodId,
      'Primary auth method is not yet set.',
    );
    await visit(urls.authMethods);

    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);
    assert.dom(selectors.TABLE_FIRST_ROW_ACTION_FIRST_ITEM).isVisible();
    await click(selectors.TABLE_FIRST_ROW_ACTION_FIRST_ITEM);

    let scope = this.server.schema.scopes.find(instances.orgScope.id);

    assert.strictEqual(
      scope.primaryAuthMethodId,
      instances.authMethod.id,
      'Primary auth method is set.',
    );

    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);
    await click(selectors.TABLE_FIRST_ROW_ACTION_FIRST_ITEM);

    scope = this.server.schema.scopes.find(instances.orgScope.id);
    assert.notOk(scope.primaryAuthMethodId, 'Primary auth method is unset.');
  });

  test('saving a new ldap auth method with invalid fields displays error messages', async function (assert) {
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
                name: 'urls',
                description: 'At least one URL is required.',
              },
            ],
          },
        },
      );
    });
    await visit(urls.authMethods);

    await click(selectors.NEW_DROPDOWN);
    await click(commonSelectors.HREF(urls.newLdapAuthMethod));
    await fillIn(selectors.FIELD_URLS, '');
    await click(commonSelectors.SAVE_BTN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
    assert
      .dom(commonSelectors.FIELD_ERROR)
      .hasText('At least one URL is required.');
  });

  test('users cannot directly navigate to new auth method route without proper authorization', async function (assert) {
    instances.orgScope.authorized_collection_actions['auth-methods'] = ['list'];

    await visit(urls.newAuthMethod);

    assert.false(
      instances.orgScope.authorized_collection_actions['auth-methods'].includes(
        'create',
      ),
    );
    assert.strictEqual(currentURL(), urls.authMethods);
  });
});
