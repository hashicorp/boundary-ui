import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Model | role', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('role', {});
    assert.ok(model);
  });

  test('it has a `saveGrantStrings` method that targets a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post('/v1/roles/123abc:set-grants', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        grant_strings: ['foo', 'bar'],
        version: 1,
      });
      return { id: '123abc' };
    });
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'role',
        attributes: {
          name: 'Role',
          description: 'Description',
          grant_strings: ['grant1', 'grant2'],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('role', '123abc');
    await model.saveGrantStrings(['foo', 'bar']);
  });

  test('it has an `addPrincipals` method that targets a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post('/v1/roles/123abc:add-principals', (schema, request) => {
      const body = JSON.parse(request.requestBody);
      assert.deepEqual(body, {
        principal_ids: ['123_abc', 'foobar'],
        version: 1,
      });
      return { id: '123abc' };
    });
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'role',
        attributes: {
          name: 'Role',
          description: 'Description',
          principals: [
            { id: '1', type: 'user' },
            { id: '3', type: 'group' },
            { id: '5', type: 'managed group' },
          ],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('role', '123abc');
    await model.addPrincipals(['123_abc', 'foobar']);
  });

  test('it has a `removePrincipals` method that targets a specific POST API endpoint and serialization', async function (assert) {
    assert.expect(1);
    this.server.post(
      '/v1/roles/123abc:remove-principals',
      (schema, request) => {
        const body = JSON.parse(request.requestBody);
        assert.deepEqual(body, {
          principal_ids: ['1', '3', '5'],
          version: 1,
        });
        return { id: '123abc' };
      }
    );
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'role',
        attributes: {
          name: 'Role',
          description: 'Description',
          principals: [
            { id: '1', type: 'user' },
            { id: '3', type: 'group' },
            { id: '5', type: 'managed group' },
          ],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('role', '123abc');
    await model.removePrincipals(['1', '3', '5']);
  });

  test('it has a `removePrincipal` method that deletes a single principal using `removePrincipals` method', async function (assert) {
    assert.expect(1);
    this.server.post(
      '/v1/roles/123abc:remove-principals',
      (schema, request) => {
        const body = JSON.parse(request.requestBody);
        assert.deepEqual(body, {
          principal_ids: ['3'],
          version: 1,
        });
        return { id: '123abc' };
      }
    );
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: '123abc',
        type: 'role',
        attributes: {
          name: 'Role',
          description: 'Description',
          principals: [
            { id: '1', type: 'user' },
            { id: '3', type: 'group' },
            { id: '5', type: 'managed group' },
          ],
          version: 1,
          scope: {
            scope_id: 'o_1',
            type: 'scope',
          },
        },
      },
    });
    const model = store.peekRecord('role', '123abc');
    await model.removePrincipal('3');
  });
});
