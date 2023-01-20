import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Transform | object as array', function (hooks) {
  setupTest(hooks);

  test('it deserializes an object to an array of key value objects', function (assert) {
    assert.expect(1);
    let transform = this.owner.lookup('transform:object-as-array');
    const deserialized = transform.deserialize({
      first: 'Hey',
      second: 'There',
      third: 'Everyone',
    });
    assert.deepEqual(deserialized, [
      { key: 'first', value: 'Hey' },
      { key: 'second', value: 'There' },
      { key: 'third', value: 'Everyone' },
    ]);
  });

  test('it serializes an array of key value objects to an object', function (assert) {
    assert.expect(1);
    let transform = this.owner.lookup('transform:object-as-array');
    const serialized = transform.serialize([
      { key: 'first', value: 'Hey' },
      { key: 'second', value: 'There' },
      { key: 'third', value: 'Everyone' },
    ]);

    assert.deepEqual(serialized, {
      first: 'Hey',
      second: 'There',
      third: 'Everyone',
    });
  });
});
