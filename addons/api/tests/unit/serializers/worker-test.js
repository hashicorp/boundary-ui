import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | worker', function (hooks) {
  setupTest(hooks);
  // TODO: turn on test when model PR has been merged - devon
  test.skip('it serializes workers normally, without canonical tags type', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('worker');
    const record = store.createRecord('worker', {
      name: 'TestWorker',
      description: 'Description',
      canonical_tags: {
        type: ['foo', 'bar'],
      },
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {};
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'TestWorker',
      description: 'Description',
      canonical_tags: {
        type: [],
      },
    });
  });

  test.skip('it serializes canonical tags when`adapterOptions.canonicalTags.type` is set', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('worker');
    const record = store.createRecord('worker', {
      name: 'TestWorker',
      description: 'Description',
      canonical_tags: {
        type: ['foo', 'bar'],
      },
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {};
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'TestWorker',
      description: 'Description',
      canonical_tags: {
        type: ['foo', 'bar'],
      },
    });
  });

  test.skip('it serializes config tags normally, without config tags type', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('worker');
    const record = store.createRecord('worker', {
      name: 'TestWorker',
      description: 'Description',
      config_tags: {
        type: ['foo', 'bar'],
      },
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {};
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'TestWorker',
      description: 'Description',
      config_tags: {
        type: [],
      },
    });
  });

  test.skip('it serializes config tags when`adapterOptions.configTags.type` is set', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('worker');
    const record = store.createRecord('worker', {
      name: 'TestWorker',
      description: 'Description',
      config_tags: {
        type: ['foo', 'bar'],
      },
    });
    const snapshot = record._createSnapshot();
    snapshot.adapterOptions = {};
    const serializedRecord = serializer.serialize(snapshot);
    assert.deepEqual(serializedRecord, {
      name: 'TestWorker',
      description: 'Description',
      config_tags: {
        type: ['foo', 'bar'],
      },
    });
  });
});
