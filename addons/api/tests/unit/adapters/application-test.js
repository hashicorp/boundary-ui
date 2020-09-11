import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import config from 'ember-get-config';
import RESTAdapter from '@ember-data/adapter/rest';
import { InvalidError } from '@ember-data/adapter/error';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';

module('Unit | Adapter | application', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('its namespace is equal to the configured namespace', function (assert) {
    assert.expect(2);
    const adapter = this.owner.lookup('adapter:application');
    assert.ok(adapter.namespace);
    assert.equal(adapter.namespace, config.api.namespace);
  });

  test('it generates correct URL prefixes', function (assert) {
    assert.expect(2);
    const adapter = this.owner.lookup('adapter:application');
    assert.ok(config.api.namespace);
    assert.equal(adapter.urlPrefix(), config.api.namespace);
  });

  test('it generates correct default URL suffixes', function (assert) {
    assert.expect(1);
    const adapter = this.owner.lookup('adapter:application');
    assert.equal(adapter.urlSuffix(), '');
  });

  test('it generates URL suffixes with optional `method` from adapterOptions', function (assert) {
    assert.expect(2);
    const method = 'set-something';
    const adapter = this.owner.lookup('adapter:application');
    const suffix = adapter.urlSuffix(null, null, {
      adapterOptions: { method }
    });
    assert.ok(config.api.namespace);
    assert.equal(suffix, ':set-something');
  });

  test('it generates correct complete URLs', function (assert) {
    assert.expect(6);
    const scopeID = 'o_1';
    const method = 'my-custom-method';
    const mockSnapshot = {
      adapterOptions: {
        scopeID,
        method
      }
    };
    const adapter = this.owner.lookup('adapter:application');
    // test URL generation for each request type...
    const findRecordURL = adapter.buildURL('user', '1', mockSnapshot, 'findRecord');
    assert.equal(findRecordURL, '/v1/users/1:my-custom-method');
    const findAllURL = adapter.buildURL('user', null, mockSnapshot, 'findAll');
    assert.equal(findAllURL, '/v1/users:my-custom-method');
    const findBelongsToURL = adapter.buildURL('user', '2', mockSnapshot, 'findBelongsTo');
    assert.equal(findBelongsToURL, '/v1/users/2:my-custom-method');
    const createRecordURL = adapter.buildURL('user', null, mockSnapshot, 'createRecord');
    assert.equal(createRecordURL, '/v1/users:my-custom-method');
    const updateRecordURL = adapter.buildURL('user', '3', mockSnapshot, 'updateRecord');
    assert.equal(updateRecordURL, '/v1/users/3:my-custom-method');
    const deleteRecordURL = adapter.buildURL('user', '4', mockSnapshot, 'deleteRecord');
    assert.equal(deleteRecordURL, '/v1/users/4:my-custom-method');
  });

  test('it can request records through the store from a specified scope', async function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    this.server.get('/v1/groups', (_, { queryParams: { scope_id }}) => {
      assert.equal(scope_id, 'p_456', 'Scoped resource URL was requested.');
      return {items: []};
    });
    await store.query('group', { scope_id: 'p_456' });
  });

  test('it rewrites PUT to PATCH, but leaves others unchanged', function (assert) {
    assert.expect(1);
    const adapter = this.owner.lookup('adapter:application');
    // TODO this is icky, should be changed to a spy or stub
    const originalAjax = RESTAdapter.prototype.ajax;
    RESTAdapter.prototype.ajax = (url, type) => {
      assert.equal(type, 'PATCH');
      RESTAdapter.prototype.ajax = originalAjax;
    };
    adapter.ajax('/', 'PUT');
  });

  test('it rewrites PUT/PATCH to POST when `adapterOptions.method` is passed to `updateRecord`', function (assert) {
    assert.expect(1);
    const adapter = this.owner.lookup('adapter:application');
    const store = this.owner.lookup('service:store');
    const snapshot = store.createRecord('role', {})._createSnapshot();
    snapshot.adapterOptions = {
      method: 'custom-method'
    }
    // TODO this is icky, should be changed to a spy or stub
    const originalAjax = RESTAdapter.prototype.ajax;
    RESTAdapter.prototype.ajax = (url, type) => {
      assert.equal(type, 'POST');
      RESTAdapter.prototype.ajax = originalAjax;
    };
    adapter.updateRecord(store, {modelName: 'user'}, snapshot);
  });

  test('it prenormalizes "empty" responses into a form that the fetch-manager will not reject', async function (assert) {
    assert.expect(1);
    const adapter = this.owner.lookup('adapter:application');
    const store = this.owner.lookup('service:store');
    this.server.get('/v1/users', () => new Response({}));
    const prenormalized = await adapter.findAll(store, {modelName: 'user'}, null, []);
    assert.deepEqual(prenormalized, {items: []});
  });

  test('it correctly identifies 400 responses as invalid', function (assert) {
    assert.expect(2);
    const adapter = this.owner.lookup('adapter:application');
    assert.ok(adapter.isInvalid(400));
    assert.notOk(adapter.isInvalid(401));
  });

  test('it returns an proper InvalidError from handleResponse', function (assert) {
    assert.expect(4);
    const adapter = this.owner.lookup('adapter:application');
    const payload = {
      status: 400,
      code: 'invalid_argument',
      message: 'The request was invalid.',
    };
    const handledResponse = adapter.handleResponse(400, {}, payload);
    assert.ok(handledResponse instanceof InvalidError);
    assert.equal(handledResponse.errors.length, 1);
    assert.equal(handledResponse.message, 'The request was invalid.');
    assert.ok(handledResponse.errors[0].isInvalid);
  });

  test('it assigns convenience booleans for error types', function (assert) {
    assert.expect(6);
    const adapter = this.owner.lookup('adapter:application');
    const getResponse = (status) =>
      adapter.handleResponse(status, {}, { status });
    assert.ok(getResponse(401).errors[0].isUnauthenticated);
    assert.ok(getResponse(403).errors[0].isForbidden);
    assert.ok(getResponse(404).errors[0].isNotFound);
    assert.ok(getResponse(500).errors[0].isServer);
    assert.ok(getResponse(0).errors[0].isUnknown);
    assert.ok(getResponse(false).errors[0].isUnknown);
  });

  test('it returns field-level errors in InvalidError from handleResponse', function (assert) {
    assert.expect(1);
    const adapter = this.owner.lookup('adapter:application');
    const payload = {
      status: 400,
      code: 'invalid_argument',
      message: 'The request was invalid.',
      details: {
        request_fields: [{ name: 'name', description: 'Name is wrong.' }],
      },
    };
    const handledResponse = adapter.handleResponse(400, {}, payload);
    assert.equal(
      handledResponse.errors.length,
      2,
      'A base error plus one field error'
    );
  });
});
