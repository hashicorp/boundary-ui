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
    assert.expect(1);
    const adapter = this.owner.lookup('adapter:application');
    assert.equal(adapter.urlPrefix(), config.api.namespace);
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

  test('it prenormalizes "empty" responses into a form that the fetch-manager will not reject', async function (assert) {
    assert.expect(1);
    const adapter = this.owner.lookup('adapter:application');
    const store = this.owner.lookup('service:store');
    this.server.get('/v1/projects', () => new Response({}));
    const prenormalized = await adapter.findAll(store, {modelName: 'project'}, null, []);
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
        fields: [{ name: 'name', message: 'Name is wrong.' }],
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
