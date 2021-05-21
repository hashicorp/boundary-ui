import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | fragment auth method attributes', function (hooks) {
  setupTest(hooks);

  test('it serializes empty strings to null', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('user', {
      name: '',
      description: '',
      version: null,
    });
    let serializedRecord = record.serialize();
    assert.deepEqual(serializedRecord, {
      name: null,
      description: null,
    });
  });

  test('it does not serialize client_secret if present but falsy', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('user', {
      name: '',
      description: '',
      version: null,
      client_secret: false,
    });
    let serializedRecord = record.serialize();
    assert.deepEqual(serializedRecord, {
      name: null,
      description: null,
    });
  });
});
