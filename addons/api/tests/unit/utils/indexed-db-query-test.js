import { queryIndexedDb } from 'api/utils/indexed-db-query';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { pluralize } from 'ember-inflector';
import { TYPE_TARGET_TCP, TYPE_TARGET_SSH } from 'api/models/target';

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

  let scope1;
  let scope2;
  const resource = 'target';

  hooks.beforeEach(function () {
    indexedDb = this.owner.lookup('service:indexed-db');
    store = this.owner.lookup('service:store');
    scope1 = this.server.create('scope', {
      id: 'p_123',
      type: 'project',
    });
    scope2 = this.server.create('scope', {
      id: 'p_456',
      type: 'project',
    });
    this.server.createList(resource, 5, {
      type: TYPE_TARGET_SSH,
      scopeId: scope1.id,
    });
    this.server.createList(resource, 5, {
      type: TYPE_TARGET_TCP,
      scopeId: scope2.id,
    });
  });

  test('it filters by single field', async function (assert) {
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = {
      filters: {
        type: [{ equals: TYPE_TARGET_SSH }],
      },
    };

    const result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 5);
  });

  test('it filters by single field and specify logicalOperator type', async function (assert) {
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = {
      filters: {
        type: {
          logicalOperator: 'and',
          values: [{ equals: TYPE_TARGET_SSH }],
        },
      },
    };

    const result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 5);
  });

  test('it filters by single field and specify different operators', async function (assert) {
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = {
      filters: {
        type: [{ equals: TYPE_TARGET_SSH }, { notEquals: TYPE_TARGET_TCP }],
      },
    };

    const result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 5);
  });

  test('it filters by single field with logicalOperator of "or"', async function (assert) {
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = {
      filters: {
        type: {
          logicalOperator: 'or',
          values: [{ equals: TYPE_TARGET_SSH }, { equals: TYPE_TARGET_TCP }],
        },
      },
    };

    const result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 10);
  });

  test('it filters by multiple fields', async function (assert) {
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = {
      filters: {
        type: [{ equals: TYPE_TARGET_SSH }],
        scope_id: [{ equals: scope1.id }],
      },
    };

    const result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 5);
  });

  test('it filters by multiple fields and uses logicalOperator "or"', async function (assert) {
    this.server.create(resource, { type: TYPE_TARGET_TCP, scopeId: scope1.id });
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = {
      filters: {
        type: {
          logicalOperator: 'or',
          values: [{ equals: TYPE_TARGET_SSH }, { equals: TYPE_TARGET_TCP }],
        },
        scope_id: [{ equals: scope1.id }],
      },
    };

    const result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 6);
  });

  test('it filters by multiple fields and uses two logicalOperator "or"s', async function (assert) {
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = {
      filters: {
        type: {
          logicalOperator: 'or',
          values: [{ equals: TYPE_TARGET_SSH }, { equals: TYPE_TARGET_TCP }],
        },
        scope_id: {
          logicalOperator: 'or',
          values: [{ equals: scope1.id }, { equals: scope2.id }],
        },
      },
    };

    const result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 10);
  });

  test('it filters by single field and returns zero results', async function (assert) {
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = {
      filters: {
        type: [{ equals: 'unknown' }],
      },
    };

    const result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 0);
  });

  test('it searches with a query that matches a field exactly', async function (assert) {
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = { search: scope1.id };

    const result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 5);
  });

  test('it searches with a query that matches a field partially', async function (assert) {
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = { search: scope2.id.slice(0, 2) };

    const result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 10);
  });

  test('it searches and returns no results with a query that matches no fields', async function (assert) {
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = { search: `${scope1.id}456789` };

    const result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 0);
  });

  test('it filters by a single field and searches', async function (assert) {
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = {
      search: scope1.id,
      filters: {
        type: [{ equals: TYPE_TARGET_SSH }],
      },
    };

    const result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 5);
  });

  test('it filters by multiple fields and searches', async function (assert) {
    const target = this.server.create(resource, {
      name: 'Generated_ssh_target',
      type: TYPE_TARGET_SSH,
      scopeId: scope1.id,
    });
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = {
      search: target.name,
      filters: {
        type: [{ equals: TYPE_TARGET_SSH }],
        scope_id: [{ equals: scope1.id }],
      },
    };

    const result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 1);
  });
});
