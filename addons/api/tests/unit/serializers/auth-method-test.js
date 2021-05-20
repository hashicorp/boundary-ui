import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | auth method', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let serializer = store.serializerFor('auth-method');

    assert.ok(serializer);
  });

  test('it serializes password records', function (assert) {
    assert.expect(2);
    let store = this.owner.lookup('service:store');
    let record = store.createRecord('auth-method', { type: 'password' });

    let serializedRecord = record.serialize();

    assert.ok(serializedRecord);
    assert.notOk(
      serializedRecord.attributes,
      'Password should not have attributes'
    );
  });

  test('it serializes OIDC records without state', function (assert) {
    assert.expect(3);
    let store = this.owner.lookup('service:store');
    let record = store.createRecord('auth-method', {
      type: 'oidc',
      attributes: {
        state: 'foo',
      },
    });

    let serializedRecord = record.serialize();

    assert.ok(serializedRecord);
    assert.ok(serializedRecord.attributes, 'OIDC should have attributes');
    assert.notOk(serializedRecord.attributes.state);
  });

  test('it serializes OIDC records with only state and version when `adapterOptions.state` is passed', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('auth-method');
    const record = store.createRecord('auth-method', {
      type: 'oidc',
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
});
