/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, fillIn, select, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { Response } from 'miragejs';
import {
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | auth-methods | update', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  let featuresService;

  const instances = {
    scopes: {
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

  hooks.beforeEach(async function () {
    // Setup Mirage mock resources for this test
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
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.authMethods);

    await click(commonSelectors.HREF(urls.authMethod));

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await fillIn(
      commonSelectors.FIELD_DESCRIPTION,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(
      this.server.schema.authMethods.find(instances.authMethod.id).name,
      commonSelectors.FIELD_NAME_VALUE,
    );
  });

  test('can update an oidc auth method and save changes', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.authMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
      type: TYPE_AUTH_METHOD_OIDC,
    });
    await visit(urls.authMethods);

    await click(
      commonSelectors.HREF(`${urls.authMethods}/${instances.authMethod.id}`),
    );
    await click(commonSelectors.EDIT_BTN);

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

    // Remove all signing algorithms
    let removeButtons = findAll(selectors.FIELD_SIGNING_ALGORITHMS_DELETE_BTN);

    for (const element of removeButtons) {
      await click(element);
    }

    await select(
      selectors.FIELD_SIGNING_ALGORITHMS,
      selectors.FIELD_SIGNING_ALGORITHMS_VALUE,
    );

    // Remove all allowed audiences
    const allowedAudiencesList = findAll(
      selectors.FIELD_ALLOWED_AUDIENCES_DELETE_BTN,
    );

    for (const element of allowedAudiencesList) {
      await click(element);
    }

    await fillIn(
      selectors.FIELD_ALLOWED_AUDIENCES,
      selectors.FIELD_ALLOWED_AUDIENCES_VALUE,
    );

    // Remove all claims scopes
    const claimsScopeList = await Promise.all(
      findAll(selectors.FIELD_CLAIMS_SCOPES_DELETE_BTN),
    );

    for (const element of claimsScopeList) {
      await click(element);
    }

    await fillIn(
      selectors.FIELD_CLAIMS_SCOPES,
      selectors.FIELD_CLAIMS_SCOPES_VALUE,
    );

    // Remove all claim maps
    const claimMaps = await Promise.all(
      findAll(selectors.FIELD_ACCOUNT_CLAIM_MAPS_DELETE_BTN),
    );
    for (const element of claimMaps) {
      await click(element);
    }

    await fillIn(
      selectors.FIELD_ACCOUNT_CLAIM_MAPS_FROM_CLAIM,
      selectors.FIELD_ACCOUNT_CLAIM_MAPS_FROM_CLAIM_VALUE,
    );
    await select(
      selectors.FIELD_ACCOUNT_CLAIM_MAPS_TO_CLAIM,
      selectors.FIELD_ACCOUNT_CLAIM_MAPS_TO_CLAIM_VALUE,
    );

    // Remove all certificates
    const certificatesList = findAll(selectors.FIELD_IDP_CERTS_DELETE_BTN);

    for (const element of certificatesList) {
      await click(element);
    }

    await fillIn(selectors.FIELD_IDP_CERTS, selectors.FIELD_IDP_CERTS_VALUE);
    await click(selectors.FIELD_IDP_CERTS_ADD_BTN);
    await fillIn(selectors.FIELD_MAX_AGE, selectors.FIELD_MAX_AGE_VALUE);
    await fillIn(
      selectors.FIELD_API_URL_PREFIX,
      selectors.FIELD_API_URL_PREFIX_VALUE,
    );

    await click(selectors.FIELD_PROMPTS);
    await click(commonSelectors.SAVE_BTN);

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
      'from_claim=email',
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

  test('can update an ldap auth method and save changes', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('ldap-auth-methods');
    await visit(urls.authMethods);

    await click(commonSelectors.HREF(urls.ldapAuthMethod));
    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await fillIn(
      commonSelectors.FIELD_DESCRIPTION,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    await fillIn(selectors.FIELD_URLS, selectors.FIELD_URLS_VALUE);
    await click(selectors.FIELD_CERTIFICATES_DELETE_BTN);

    // Certificates
    await fillIn(
      selectors.FIELD_CERTIFICATES,
      selectors.FIELD_CERTIFICATES_VALUE,
    );
    await click(selectors.FIELD_CERTIFICATES_ADD_BTN);

    await click(selectors.FIELD_START_TLS);
    await click(selectors.FIELD_INSECURE_TLS);
    await fillIn(selectors.FIELD_BIND_DN, selectors.FIELD_BIND_DN_VALUE);
    await fillIn(selectors.FIELD_UPN_DOMAIN, selectors.FIELD_UPN_DOMAIN_VALUE);
    await click(selectors.FIELD_DISCOVER_DN);
    await click(selectors.FIELD_ANON_GROUP_SEARCH);
    await fillIn(selectors.FIELD_USER_DN, selectors.FIELD_USER_DN_VALUE);
    await fillIn(selectors.FIELD_USER_ATTR, selectors.FIELD_USER_ATTR_VALUE);
    await fillIn(
      selectors.FIELD_USER_FILTER,
      selectors.FIELD_USER_FILTER_VALUE,
    );

    // Remove all attribute maps
    const attributeMaps = await Promise.all(
      findAll(selectors.FIELD_ACCOUNT_ATTRIBUTE_MAPS_DELETE_BTN),
    );

    for (const element of attributeMaps) {
      await click(element);
    }

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
    assert.true(ldapAuthMethod.attributes.start_tls);
    assert.true(ldapAuthMethod.attributes.insecure_tls);
    assert.strictEqual(
      ldapAuthMethod.attributes.bind_dn,
      selectors.FIELD_BIND_DN_VALUE,
    );
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
    assert.false(ldapAuthMethod.attributes.enable_groups);
    assert.true(ldapAuthMethod.attributes.use_token_groups);
  });

  test('can update an auth method and cancel changes', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-11-03
          enabled: false,
        },
      },
    });

    await visit(urls.authMethod);

    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.notEqual(this.server.schema.authMethods.first().name, 'update name');
  });

  test('can update an ldap auth method and cancel changes', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('ldap-auth-methods');
    await visit(urls.authMethods);
    const name = instances.ldapAuthMethod.name;
    const ldapAuthMethod = this.server.schema.authMethods.findBy({ name });
    const { certificates, account_attribute_maps } = ldapAuthMethod.attributes;

    await click(commonSelectors.HREF(urls.ldapAuthMethod));
    await click(commonSelectors.EDIT_BTN);
    await fillIn(
      selectors.FIELD_CERTIFICATES,
      selectors.FIELD_CERTIFICATES_VALUE,
    );
    await fillIn(
      selectors.FIELD_ACCOUNT_ATTRIBUTE_MAPS_FROM,
      selectors.FIELD_ACCOUNT_ATTRIBUTE_MAPS_FROM_VALUE,
    );
    await select(
      selectors.FIELD_ACCOUNT_ATTRIBUTE_MAPS_TO,
      selectors.FIELD_ACCOUNT_ATTRIBUTE_MAPS_TO_VALUE,
    );
    await click(commonSelectors.CANCEL_BTN);

    assert.deepEqual(ldapAuthMethod.attributes.certificates, certificates);
    assert.deepEqual(
      ldapAuthMethod.attributes.account_attribute_maps,
      account_attribute_maps,
    );
  });

  test('cannot make changes to an existing auth method without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.authMethod.authorized_actions =
      instances.authMethod.authorized_actions.filter(
        (item) => item !== 'update',
      );
    await visit(urls.authMethods);

    await click(commonSelectors.HREF(urls.authMethod));

    assert.dom(commonSelectors.EDIT_BTN).isNotVisible();
  });

  test('cannot make changes to an existing ldap auth method without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('ldap-auth-methods');
    instances.ldapAuthMethod.authorized_actions =
      instances.ldapAuthMethod.authorized_actions.filter(
        (item) => item !== 'update',
      );
    await visit(urls.authMethods);

    await click(commonSelectors.HREF(urls.ldapAuthMethod));

    assert.dom(commonSelectors.EDIT_BTN).isNotVisible();
  });

  test('saving an existing auth method with invalid fields displays error messages', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const errorMessage = 'The request was invalid.';
    const errorDescription = 'Name is required.';
    this.server.patch('/auth-methods/:id', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: errorMessage,
          details: {
            request_fields: [
              {
                name: 'name',
                description: errorDescription,
              },
            ],
          },
        },
      );
    });
    await visit(urls.authMethods);

    await click(commonSelectors.HREF(urls.authMethod));
    await click(commonSelectors.EDIT_BTN);
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(errorMessage);
    assert.dom(commonSelectors.FIELD_NAME_ERROR).hasText(errorDescription);
  });

  test('saving an existing ldap auth method with invalid fields displays error messages', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('ldap-auth-methods');
    const errorMessage = 'The request was invalid.';
    const errorDescription = 'URL field is required';
    this.server.patch('/auth-methods/:id', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: errorMessage,
          details: {
            request_fields: [
              {
                name: 'urls',
                description: errorDescription,
              },
            ],
          },
        },
      );
    });
    await visit(urls.authMethods);

    await click(commonSelectors.HREF(urls.ldapAuthMethod));
    await click(commonSelectors.EDIT_BTN);
    await fillIn(selectors.FIELD_URLS, '');
    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(errorMessage);
    assert.dom(commonSelectors.FIELD_ERROR).hasText(errorDescription);
  });
});
