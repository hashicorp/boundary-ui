import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | application', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('application');
    assert.ok(serializer);
  });

  test('it serializes records', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const scope = store.createRecord('scope', {id: 'global'});
    const record = store.createRecord('project', {
      name: 'Project',
      description: 'Description',
      scope
    });
    const serializedRecord = record.serialize();
    assert.deepEqual(serializedRecord, {
      name: 'Project',
      description: 'Description',
      scope_id: 'global'
      //disabled: false,  // TODO:  disabled is temporarily disabled
    });
  });

  test('it normalizes array records from an `items` root key', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('project');
    const projectModelClass = store.createRecord('project').constructor;
    const payload = {
      items: [
        { id: 1, name: 'Project 1' },
        { id: 2, name: 'Project 2' },
        { id: 3, name: 'Project 3' },
      ],
    };
    const normalizedArray = serializer.normalizeArrayResponse(
      store,
      projectModelClass,
      payload
    );
    assert.deepEqual(normalizedArray, {
      included: [],
      data: [
        {
          id: '1',
          type: 'project',
          attributes: { name: 'Project 1' },
          relationships: {},
        },
        {
          id: '2',
          type: 'project',
          attributes: { name: 'Project 2' },
          relationships: {},
        },
        {
          id: '3',
          type: 'project',
          attributes: { name: 'Project 3' },
          relationships: {},
        },
      ],
    });
  });

  test('it normalizes single, unrooted records', function (assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('project');
    const projectModelClass = store.createRecord('project').constructor;
    const payload = {
      id: '1',
      name: 'Project 1',
    };
    const normalized = serializer.normalizeSingleResponse(
      store,
      projectModelClass,
      payload
    );
    assert.deepEqual(normalized, {
      included: [],
      data: {
        id: '1',
        type: 'project',
        attributes: { name: 'Project 1' },
        relationships: {},
      },
    });
  });
});
