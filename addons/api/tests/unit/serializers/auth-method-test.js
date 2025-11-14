/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'api/test-support/helpers/mirage';

import {
  TYPE_AUTH_METHOD_PASSWORD,
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';

module('Unit | Serializer | auth method', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let serializer = store.serializerFor('auth-method');

    assert.ok(serializer);
  });

  test('it serializes password records', function (assert) {
    let store = this.owner.lookup('service:store');
    let record = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_PASSWORD,
    });

    let serializedRecord = record.serialize();

    assert.ok(serializedRecord);
    assert.notOk(
      serializedRecord.attributes,
      'Password should not have attributes',
    );
  });

  test('it serializes OIDC records without state', function (assert) {
    let store = this.owner.lookup('service:store');
    let record = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_OIDC,
      name: 'OIDC Auth Method',
      state: 'foo',
      account_claim_maps: [{ key: 'foo', value: 'bar' }],
      claims_scopes: [{ value: 'profile' }, { value: 'email' }],
      signing_algorithms: [{ value: 'RS256' }, { value: 'RS384' }],
      allowed_audiences: [
        { value: 'www.alice.com' },
        { value: 'www.alice.com/admin' },
      ],
      idp_ca_certs: [
        { value: 'certificate-1234' },
        { value: 'certificate-5678' },
      ],
      api_url_prefix: 'protocol://host:port/foo',
      client_id: 'id123',
      client_secret: 'secret456',
      disable_discovered_config_validation: true,
      dry_run: true,
      issuer: 'http://www.example.net',
      max_age: 500,
      prompts: [{ value: 'none' }],
    });

    let serializedRecord = record.serialize();

    assert.deepEqual(serializedRecord, {
      type: TYPE_AUTH_METHOD_OIDC,
      name: 'OIDC Auth Method',
      description: null,
      attributes: {
        account_claim_maps: ['foo=bar'],
        claims_scopes: ['profile', 'email'],
        signing_algorithms: ['RS256', 'RS384'],
        allowed_audiences: ['www.alice.com', 'www.alice.com/admin'],
        idp_ca_certs: ['certificate-1234', 'certificate-5678'],
        api_url_prefix: 'protocol://host:port/foo',
        client_id: 'id123',
        client_secret: 'secret456',
        disable_discovered_config_validation: true,
        dry_run: true,
        issuer: 'http://www.example.net',
        max_age: 500,
        prompts: ['none'],
      },
    });
  });

  test('it serializes LDAP records without state', function (assert) {
    let store = this.owner.lookup('service:store');
    let record = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_LDAP,
      name: 'LDAP Auth Method',
      state: 'baz',
      account_attribute_maps: [{ key: 'foo', value: 'bar' }],
      urls: [{ value: 'ldap://ldap.example.com' }],
      use_token_groups: false,
      start_tls: true,
      insecrure_tls: false,
      discover_dn: true,
      anon_group_search: true,
      bind_dn: 'cn=users,dc=example,dc=com',
      upn_domain: 'example.com',
      user_dn: 'cn=users,dc=example,dc=com',
      user_attr: 'uid',
      user_filter: '({{.UserAttr}}={{.Username}})',
      enable_groups: true,
      group_dn: 'cn=groups,dc=example,dc=com',
      group_attr: 'cn',
      group_filter: '(member={{.UserDN}})',
      certificates: [
        { value: 'certificate-1234' },
        { value: 'certificate-5678' },
      ],
      client_certificate: 'certificate-1234',
      client_certificate_key: 'secret456',
      maximum_page_size: 100,
      dereference_aliases: 'NeverDerefAliases',
    });

    let serializedRecord = record.serialize();

    assert.deepEqual(serializedRecord, {
      type: TYPE_AUTH_METHOD_LDAP,
      name: 'LDAP Auth Method',
      description: null,
      attributes: {
        account_attribute_maps: ['foo=bar'],
        urls: ['ldap://ldap.example.com'],
        use_token_groups: false,
        start_tls: true,
        insecure_tls: false,
        discover_dn: true,
        anon_group_search: true,
        bind_dn: 'cn=users,dc=example,dc=com',
        upn_domain: 'example.com',
        user_dn: 'cn=users,dc=example,dc=com',
        user_attr: 'uid',
        user_filter: '({{.UserAttr}}={{.Username}})',
        enable_groups: true,
        group_dn: 'cn=groups,dc=example,dc=com',
        group_attr: 'cn',
        group_filter: '(member={{.UserDN}})',
        certificates: ['certificate-1234', 'certificate-5678'],
        client_certificate: 'certificate-1234',
        client_certificate_key: 'secret456',
        maximum_page_size: 100,
        dereference_aliases: 'NeverDerefAliases',
      },
    });
  });

  test("OIDC auth-method doesn't serialize client secrets when not set", function (assert) {
    let store = this.owner.lookup('service:store');
    let record = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_OIDC,
      name: 'OIDC Auth Method',
      state: 'foo',
      account_claim_maps: [{ key: 'foo', value: 'bar' }],
      claims_scopes: [{ value: 'profile' }, { value: 'email' }],
      signing_algorithms: [{ value: 'RS256' }, { value: 'RS384' }],
      allowed_audiences: [
        { value: 'www.alice.com' },
        { value: 'www.alice.com/admin' },
      ],
      idp_ca_certs: [
        { value: 'certificate-1234' },
        { value: 'certificate-5678' },
      ],
      api_url_prefix: 'protocol://host:port/foo',
      client_id: 'id123',
      client_secret: null,
      disable_discovered_config_validation: true,
      dry_run: true,
      issuer: 'http://www.example.net',
      max_age: 500,
      prompts: [{ value: 'consent' }],
    });

    let serializedRecord = record.serialize();

    assert.deepEqual(serializedRecord, {
      type: TYPE_AUTH_METHOD_OIDC,
      name: 'OIDC Auth Method',
      description: null,
      attributes: {
        account_claim_maps: ['foo=bar'],
        claims_scopes: ['profile', 'email'],
        signing_algorithms: ['RS256', 'RS384'],
        allowed_audiences: ['www.alice.com', 'www.alice.com/admin'],
        idp_ca_certs: ['certificate-1234', 'certificate-5678'],
        api_url_prefix: 'protocol://host:port/foo',
        client_id: 'id123',
        disable_discovered_config_validation: true,
        dry_run: true,
        issuer: 'http://www.example.net',
        max_age: 500,
        prompts: ['consent'],
      },
    });
  });

  test("LDAP auth-method doesn't serialize client secrets when not set", function (assert) {
    let store = this.owner.lookup('service:store');
    let record = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_LDAP,
      name: 'LDAP Auth Method',
      state: 'baz',
      account_attribute_maps: [{ key: 'foo', value: 'bar' }],
      urls: [{ value: 'ldap://ldap.example.com' }],
      use_token_groups: false,
      start_tls: true,
      insecrure_tls: false,
      discover_dn: true,
      anon_group_search: true,
      bind_dn: 'cn=users,dc=example,dc=com',
      upn_domain: 'example.com',
      user_dn: 'cn=users,dc=example,dc=com',
      user_attr: 'uid',
      user_filter: '({{.UserAttr}}={{.Username}})',
      enable_groups: true,
      group_dn: 'cn=groups,dc=example,dc=com',
      group_attr: 'cn',
      group_filter: '(member={{.UserDN}})',
      certificates: [
        { value: 'certificate-1234' },
        { value: 'certificate-5678' },
      ],
      client_certificate: 'certificate-1234',
      client_certificate_key: null,
      maximum_page_size: 100,
      dereference_aliases: 'NeverDerefAliases',
    });

    let serializedRecord = record.serialize();

    assert.deepEqual(serializedRecord, {
      type: TYPE_AUTH_METHOD_LDAP,
      name: 'LDAP Auth Method',
      description: null,
      attributes: {
        account_attribute_maps: ['foo=bar'],
        urls: ['ldap://ldap.example.com'],
        use_token_groups: false,
        start_tls: true,
        insecure_tls: false,
        discover_dn: true,
        anon_group_search: true,
        bind_dn: 'cn=users,dc=example,dc=com',
        upn_domain: 'example.com',
        user_dn: 'cn=users,dc=example,dc=com',
        user_attr: 'uid',
        user_filter: '({{.UserAttr}}={{.Username}})',
        enable_groups: true,
        group_dn: 'cn=groups,dc=example,dc=com',
        group_attr: 'cn',
        group_filter: '(member={{.UserDN}})',
        certificates: ['certificate-1234', 'certificate-5678'],
        client_certificate: 'certificate-1234',
        maximum_page_size: 100,
        dereference_aliases: 'NeverDerefAliases',
      },
    });
  });

  test('it serializes OIDC records with only state and version when `adapterOptions.state` is passed', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('auth-method');
    const record = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_OIDC,
      attributes: {
        state: 'foo',
      },
      version: 1,
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      state: 'bar',
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      attributes: {
        state: 'bar',
      },
      version: 1,
    });
  });

  test('it serializes LDAP records with only state and version when `adapterOptions.state` is passed', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('auth-method');
    const record = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_LDAP,
      attributes: {
        state: 'foo',
      },
      version: 1,
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {
      state: 'bar',
    };
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      attributes: {
        state: 'bar',
      },
      version: 1,
    });
  });

  test('it sorts primary first in normalizeArrayResponse', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('auth-method');
    const modelClass = store.createRecord('auth-method').constructor;
    const payload = {
      items: [{ id: 1 }, { id: 2, is_primary: true }, { id: 3 }],
    };
    const normalizedArray = serializer.normalizeArrayResponse(
      store,
      modelClass,
      payload,
    );
    assert.ok(payload.items[1].is_primary, 'Second payload item is primary');
    assert.deepEqual(
      normalizedArray,
      {
        included: [],
        data: [
          {
            id: '2',
            type: 'auth-method',
            attributes: {
              is_primary: true,
              bind_password: '',
              client_certificate_key: '',
              client_secret: '',
            },
            relationships: {},
          },
          {
            id: '1',
            type: 'auth-method',
            attributes: {
              is_primary: false,
              bind_password: '',
              client_certificate_key: '',
              client_secret: '',
            },
            relationships: {},
          },
          {
            id: '3',
            type: 'auth-method',
            attributes: {
              is_primary: false,
              bind_password: '',
              client_certificate_key: '',
              client_secret: '',
            },
            relationships: {},
          },
        ],
      },
      'First normalized item is primary',
    );
  });

  test('it normalizes OIDC records', async function (assert) {
    const store = this.owner.lookup('service:store');

    const apiUrlPrefix = 'protocol://host:port/foo';
    const clientId = 'id123';
    const disableDiscoveredConfigValidation = true;
    const dryRun = true;
    const issuer = 'http://www.example.net';
    const maxAge = 500;
    this.server.get('/auth-methods/oidc123', () => ({
      attributes: {
        account_claim_maps: ['from=to', 'foo=bar'],
        claims_scopes: ['profile', 'email'],
        signing_algorithms: ['RS256', 'RS384'],
        allowed_audiences: ['www.alice.com', 'www.alice.com/admin'],
        idp_ca_certs: ['certificate-1234', 'certificate-5678'],
        api_url_prefix: apiUrlPrefix,
        client_id: clientId,
        disable_discovered_config_validation: disableDiscoveredConfigValidation,
        dry_run: dryRun,
        issuer: issuer,
        max_age: maxAge,
        client_secret: 'secret123',
        prompts: ['consent'],
      },
      version: 1,
      type: TYPE_AUTH_METHOD_OIDC,
      id: 'oidc123',
    }));

    const record = await store.findRecord('auth-method', 'oidc123');
    const {
      account_claim_maps,
      claims_scopes,
      allowed_audiences,
      signing_algorithms,
      idp_ca_certs,
      prompts,
    } = record;
    assert.deepEqual(account_claim_maps, [
      { key: 'from', value: 'to' },
      { key: 'foo', value: 'bar' },
    ]);
    assert.deepEqual(claims_scopes, [{ value: 'profile' }, { value: 'email' }]);
    assert.deepEqual(allowed_audiences, [
      { value: 'www.alice.com' },
      { value: 'www.alice.com/admin' },
    ]);
    assert.deepEqual(signing_algorithms, [
      { value: 'RS256' },
      { value: 'RS384' },
    ]);
    assert.deepEqual(idp_ca_certs, [
      { value: 'certificate-1234' },
      { value: 'certificate-5678' },
    ]);
    assert.strictEqual(record.api_url_prefix, apiUrlPrefix);
    assert.deepEqual(prompts, [{ value: 'consent' }]);
    assert.strictEqual(record.client_id, clientId);
    assert.strictEqual(
      record.disable_discovered_config_validation,
      disableDiscoveredConfigValidation,
    );
    assert.strictEqual(record.dry_run, dryRun);
    assert.strictEqual(record.issuer, issuer);
    assert.strictEqual(record.max_age, maxAge);
    assert.strictEqual(record.client_secret, '');
  });

  test('it normalizes LDAP records', async function (assert) {
    const store = this.owner.lookup('service:store');

    const ldapUrl = 'ldap://ldap.example.com';
    const certificates = ['certificate-1234', 'certificate-5678'];
    const clientCerticate = 'certificate-1234';
    const startTls = true;
    const insecureTls = false;
    this.server.get('/auth-methods/ldap123', () => ({
      attributes: {
        account_attribute_maps: ['from=to', 'foo=bar'],
        urls: [ldapUrl],
        start_tls: startTls,
        insecure_tls: insecureTls,
        discover_dn: true,
        anon_group_search: true,
        bind_dn: 'cn=users,dc=example,dc=com',
        bind_password: 'password123',
        upn_domain: 'example.com',
        user_dn: 'cn=users,dc=example,dc=com',
        user_attr: 'uid',
        user_filter: '({{.UserAttr}}={{.Username}})',
        enable_groups: true,
        group_dn: 'cn=groups,dc=example,dc=com',
        group_attr: 'cn',
        group_filter: '(member={{.UserDN}})',
        certificates: certificates,
        client_certificate: clientCerticate,
        client_certificate_key: 'secret456',
      },
      version: 1,
      type: TYPE_AUTH_METHOD_LDAP,
      id: 'ldap123',
    }));

    const record = await store.findRecord('auth-method', 'ldap123');
    const {
      account_attribute_maps,
      urls,
      certificates: recordCertificates,
    } = record;
    assert.deepEqual(account_attribute_maps, [
      { key: 'from', value: 'to' },
      { key: 'foo', value: 'bar' },
    ]);
    assert.deepEqual(urls, [{ value: ldapUrl }]);
    assert.deepEqual(recordCertificates, [
      { value: 'certificate-1234' },
      { value: 'certificate-5678' },
    ]);
    assert.strictEqual(record.start_tls, startTls);
    assert.strictEqual(record.insecure_tls, insecureTls);
    assert.true(record.discover_dn);
    assert.true(record.anon_group_search);
    assert.strictEqual(record.bind_dn, 'cn=users,dc=example,dc=com');
    assert.strictEqual(record.upn_domain, 'example.com');
    assert.strictEqual(record.user_dn, 'cn=users,dc=example,dc=com');
    assert.strictEqual(record.user_attr, 'uid');
    assert.strictEqual(record.user_filter, '({{.UserAttr}}={{.Username}})');
    assert.true(record.enable_groups);
    assert.strictEqual(record.group_dn, 'cn=groups,dc=example,dc=com');
    assert.strictEqual(record.group_attr, 'cn');
    assert.strictEqual(record.group_filter, '(member={{.UserDN}})');
    assert.strictEqual(record.client_certificate, clientCerticate);
    assert.strictEqual(record.client_certificate_key, '');
    assert.strictEqual(record.bind_password, '');
  });
});
