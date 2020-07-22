import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | scope', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let store = this.owner.lookup('service:store');
    let serializer = store.serializerFor('scope');

    assert.ok(serializer);
  });

  test('it serializes records', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('scope', {
      type: 'org',
      name: 'User',
      description: 'Description',
      scopeID: 'global'
    });
    const serializedRecord = record.serialize();
    assert.deepEqual(serializedRecord, {
      type: 'org',
      name: 'User',
      description: 'Description',
      parent_scope_id: 'global'
    });
  });
});
