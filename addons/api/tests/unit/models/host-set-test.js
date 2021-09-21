import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Model | host set', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it has an `addHosts` method that targets a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post('/v1/host-sets/123abc:add-hosts', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        host_ids: ['123_abc', 'foobar'],
        version: 1,
      });
      return { id: '123abc' };
    });
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'host-set',
        attributes: {
          name: 'Host Set',
          description: 'Description',
          host_ids: [{ value: '1' }, { value: '3' }],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('host-set', '123abc');
    await model.addHosts(['123_abc', 'foobar']);
  });

  test('it has an `addHost` method that adds a single host using `addHosts` method', async function (assert) {
    assert.expect(1);
    this.server.post('/v1/host-sets/123abc:add-hosts', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        host_ids: ['foobar'],
        version: 1,
      });
      return { id: '123abc' };
    });
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'host-set',
        attributes: {
          name: 'Host Set',
          description: 'Description',
          host_ids: [{ value: '1' }, { value: '3' }],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('host-set', '123abc');
    await model.addHost('foobar');
  });

  test('it has a `removeHosts` method that targets a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post('/v1/host-sets/123abc:remove-hosts', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        host_ids: ['3'],
        version: 1,
      });
      return { id: '123abc' };
    });
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'host-set',
        attributes: {
          name: 'Host Set',
          description: 'Description',
          host_ids: [{ value: '1' }, { value: '3' }],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('host-set', '123abc');
    await model.removeHosts(['3']);
  });

  test('it has a `removeHost` method that removes a single host using `removeHosts` method', async function (assert) {
    assert.expect(1);
    this.server.post('/v1/host-sets/123abc:remove-hosts', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        host_ids: ['3'],
        version: 1,
      });
      return { id: '123abc' };
    });
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'host-set',
        attributes: {
          name: 'Host Set',
          description: 'Description',
          host_ids: [{ value: '1' }, { value: '3' }],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('host-set', '123abc');
    await model.removeHost('3');
  });
});
