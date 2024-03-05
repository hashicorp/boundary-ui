import { queryIndexedDb } from 'api/utils/indexed-db-query';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { pluralize } from 'ember-inflector';

const seedIndexDb = async (resource, store, indexedDb, server) => {
  const resourceData = server.schema[pluralize(resource)].all().models;
  const serializedData = resourceData.map((resource) =>
    JSON.parse(JSON.stringify(server.serializerOrRegistry.serialize(resource))),
  );
  const serializer = store.serializerFor(resource);
  const schema = store.modelFor(resource);
  const normalizedPayload = serializer.normalizeResponse(
    store,
    schema,
    { items: serializedData },
    null,
    'query',
  );

  await indexedDb.db[resource].bulkPut(
    normalizedPayload.data.map((datum) => indexedDb.normalizeData(datum, true)),
  );
};

module('Unit | Utility | indexed-db-query', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  let indexedDb;
  let store;

  hooks.beforeEach(function () {
    indexedDb = this.owner.lookup('service:indexed-db');
    store = this.owner.lookup('service:store');
  });

  test('it filters by single field', async function (assert) {
    const resource = 'target';
    const scope = this.server.create('scope', { id: 'p_123', type: 'project' });
    this.server.createList(resource, 5, {
      type: 'ssh',
      scopeId: scope.id,
    });
    this.server.createList(resource, 5, {
      type: 'tcp',
      scopeId: scope.id,
    });
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = {
      filters: {
        type: [{ equals: 'ssh' }],
      },
    };

    const result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 5);
  });
});
