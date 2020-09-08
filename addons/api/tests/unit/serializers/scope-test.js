import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | scope', function(hooks) {
  setupTest(hooks);

  test('it serializes scope_id into payloads', function (assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('scope');
    serializer.serializeScopeID = true;
    const record = store.createRecord('scope', {
      name: 'My Scope',
      description: 'Foo',
      type: 'org',
      scope: {
        scope_id: 'global',
        type: 'global'
      }
    });
    const serializedRecord = record.serialize();
    assert.equal(serializer.serializeScopeID, true);
    assert.deepEqual(serializedRecord, {
      name: 'My Scope',
      description: 'Foo',
      type: 'org',
      scope_id: 'global'
    });
  });

});
