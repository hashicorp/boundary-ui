/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

import {
  TYPE_AUTH_METHOD_PASSWORD,
  TYPE_AUTH_METHOD_OIDC,
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
    assert.expect(2);
    let store = this.owner.lookup('service:store');
    let record = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_PASSWORD,
    });

    let serializedRecord = record.serialize();

    assert.ok(serializedRecord);
    assert.notOk(
      serializedRecord.attributes,
      'Password should not have attributes'
    );
  });

  test('it serializes OIDC records without state', function (assert) {
    assert.expect(1);
    let store = this.owner.lookup('service:store');
    let record = store.createRecord('auth-method', {
      type: TYPE_AUTH_METHOD_OIDC,
      name: 'OIDC Auth Method',
      state: 'foo',
      account_claim_maps: [{ from: 'foo', to: 'bar' }],
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
      },
    });
  });

  test('it serializes OIDC records with only state and version when `adapterOptions.state` is passed', function (assert) {
    assert.expect(1);
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

  test('it sorts primary first in normalizeArrayResponse', function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('auth-method');
    const modelClass = store.createRecord('auth-method').constructor;
    const payload = {
      items: [{ id: 1 }, { id: 2, is_primary: true }, { id: 3 }],
    };
    const normalizedArray = serializer.normalizeArrayResponse(
      store,
      modelClass,
      payload
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
            attributes: { is_primary: true },
            relationships: {},
          },
          {
            id: '1',
            type: 'auth-method',
            attributes: { is_primary: false },
            relationships: {},
          },
          {
            id: '3',
            type: 'auth-method',
            attributes: { is_primary: false },
            relationships: {},
          },
        ],
      },
      'First normalized item is primary'
    );
  });

  test('it normalizes OIDC records', async function (assert) {
    const store = this.owner.lookup('service:store');

    const apiUrlPrefix = 'protocol://host:port/foo';
    const clientId = 'id123';
    const clientSecret = 'secret456';
    const disableDiscoveredConfigValidation = true;
    const dryRun = true;
    const issuer = 'http://www.example.net';
    const maxAge = 500;
    this.server.get('/v1/auth-methods/oidc123', () => ({
      attributes: {
        account_claim_maps: ['from=to', 'foo=bar'],
        claims_scopes: ['profile', 'email'],
        signing_algorithms: ['RS256', 'RS384'],
        allowed_audiences: ['www.alice.com', 'www.alice.com/admin'],
        idp_ca_certs: ['certificate-1234', 'certificate-5678'],
        api_url_prefix: apiUrlPrefix,
        client_id: clientId,
        client_secret: clientSecret,
        disable_discovered_config_validation: disableDiscoveredConfigValidation,
        dry_run: dryRun,
        issuer: issuer,
        max_age: maxAge,
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
    } = record;
    assert.deepEqual(account_claim_maps, [
      { from: 'from', to: 'to' },
      { from: 'foo', to: 'bar' },
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
    assert.strictEqual(record.client_id, clientId);
    assert.strictEqual(record.client_secret, clientSecret);
    assert.strictEqual(
      record.disable_discovered_config_validation,
      disableDiscoveredConfigValidation
    );
    assert.strictEqual(record.dry_run, dryRun);
    assert.strictEqual(record.issuer, issuer);
    assert.strictEqual(record.max_age, maxAge);
  });
});
