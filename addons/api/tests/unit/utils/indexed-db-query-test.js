/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { queryIndexedDb } from 'api/utils/indexed-db-query';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';
import { TYPE_TARGET_TCP, TYPE_TARGET_SSH } from 'api/models/target';

const seedIndexDb = async (resource, store, indexedDb, server) => {
  const resourceData =
    server.schema[pluralize(camelize(resource))].all().models;
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
    normalizedPayload.data.map((datum) =>
      indexedDb.normalizeData({
        data: datum,
        cleanData: true,
        schema,
        serializer,
      }),
    ),
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

  test('it filters by single field with "and" logicalOperator', async function (assert) {
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

  test('it filters by single field with "or" logicalOperator', async function (assert) {
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

  test('it filters by multiple fields with "or" logicalOperator', async function (assert) {
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

  test('it filters by multiple fields with "and" logicalOperator', async function (assert) {
    this.server.create(resource, { type: TYPE_TARGET_TCP, scopeId: scope1.id });
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = {
      filters: {
        type: {
          logicalOperator: 'and',
          values: [{ equals: TYPE_TARGET_SSH }, { notEquals: TYPE_TARGET_TCP }],
        },
        scope_id: [{ equals: scope1.id }],
      },
    };

    const result = await queryIndexedDb(indexedDb.db, resource, query);
    assert.strictEqual(result.length, 5);
  });

  test('it filters by multiple fields and uses two "or" logicalOperators', async function (assert) {
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

  test('it filters by multiple fields and uses two "and" logicalOperators', async function (assert) {
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = {
      filters: {
        type: {
          logicalOperator: 'and',
          values: [{ notEquals: TYPE_TARGET_SSH }, { equals: TYPE_TARGET_TCP }],
        },
        scope_id: {
          logicalOperator: 'and',
          values: [{ equals: scope2.id }, { notEquals: scope1.id }],
        },
      },
    };

    const result = await queryIndexedDb(indexedDb.db, resource, query);
    assert.strictEqual(result.length, 5);
  });

  test('it cannot filter with "contains" as initial operation', async function (assert) {
    assert.expect(1);
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = {
      filters: {
        scope_id: [{ contains: scope1.id }],
      },
    };

    try {
      await queryIndexedDb(indexedDb.db, resource, query);
    } catch (e) {
      assert.strictEqual(
        e.message,
        'Contains is not supported as the first filter.',
      );
    }
  });

  test('it cannot filter with "contains" as subsequent operation', async function (assert) {
    assert.expect(2);
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = {
      filters: {
        scope_id: {
          logicalOperator: 'and',
          values: [{ equals: scope1.id }, { contains: scope2.id.slice(0, 2) }],
        },
      },
    };

    const result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 5);

    query.filters.scope_id.logicalOperator = 'or';

    try {
      await queryIndexedDb(indexedDb.db, resource, query);
    } catch (e) {
      assert.strictEqual(
        e.message,
        'Contains is not supported as a filter option with "or" operator.',
      );
    }
  });

  // TODO: Modify test cases that use comparison opertators to compare fields that
  // are of type number. Additionally, add test case for searching on boolean fields.
  test('it filters by single field with "gt" as initial operation', async function (assert) {
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = {
      filters: {
        scope_id: [{ gt: scope1.id }],
      },
    };

    const result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 5);
  });

  test('it filters by single field with "gt" as subsequent operation', async function (assert) {
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = {
      filters: {
        scope_id: {
          logicalOperator: 'and',
          values: [{ equals: scope2.id }, { gt: scope1.id }],
        },
      },
    };

    let result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 5);

    query.filters.scope_id.logicalOperator = 'or';

    result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 5);
  });

  test('it filters by single field with "gte" as initial operation', async function (assert) {
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = {
      filters: {
        scope_id: [{ gte: scope1.id }],
      },
    };

    const result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 10);
  });

  test('it filters by single field with "gte" as subsequent operation', async function (assert) {
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = {
      filters: {
        scope_id: {
          logicalOperator: 'and',
          values: [{ equals: scope2.id }, { gte: scope1.id }],
        },
      },
    };

    let result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 5);

    query.filters.scope_id.logicalOperator = 'or';

    result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 10);
  });

  test('it filters by single field with "lt" as initial operation', async function (assert) {
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = {
      filters: {
        scope_id: [{ lt: scope2.id }],
      },
    };

    const result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 5);
  });

  test('it filters by single field with "lt" as subsequent operation', async function (assert) {
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = {
      filters: {
        scope_id: {
          logicalOperator: 'and',
          values: [{ equals: scope1.id }, { lt: scope2.id }],
        },
      },
    };

    let result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 5);

    query.filters.scope_id.logicalOperator = 'or';

    result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 5);
  });

  test('it filters by single field with "lte" as initial operation', async function (assert) {
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = {
      filters: {
        scope_id: [{ lte: scope2.id }],
      },
    };

    const result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 10);
  });

  test('it filters by single field with "lte" as subsequent operation', async function (assert) {
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = {
      filters: {
        scope_id: {
          logicalOperator: 'and',
          values: [{ equals: scope1.id }, { lte: scope2.id }],
        },
      },
    };

    let result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 5);

    query.filters.scope_id.logicalOperator = 'or';

    result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 10);
  });

  test('it filters by single field with "notEquals" as initial operation', async function (assert) {
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = {
      filters: {
        scope_id: [{ notEquals: scope1.id }],
      },
    };

    const result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 5);
  });

  test('it filters by single field with "notEquals" as subsequent operation', async function (assert) {
    await seedIndexDb(resource, store, indexedDb, this.server);
    const query = {
      filters: {
        scope_id: {
          logicalOperator: 'and',
          values: [{ equals: scope2.id }, { notEquals: scope1.id }],
        },
      },
    };

    let result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 5);

    query.filters.scope_id.logicalOperator = 'or';

    result = await queryIndexedDb(indexedDb.db, resource, query);

    assert.strictEqual(result.length, 5);
  });

  test('it filters and returns zero results', async function (assert) {
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

  test('it filters on boolean type fields with truthy value', async function (assert) {
    const authMethod = this.server.create('auth-method', {
      name: 'Generated_auth_method',
      scopeId: scope1.id,
    });
    scope1.update({ primaryAuthMethodId: authMethod.id });
    await seedIndexDb('auth-method', store, indexedDb, this.server);
    const query = { filters: { is_primary: [{ equals: 'true' }] } };

    const result = await queryIndexedDb(indexedDb.db, 'auth-method', query);

    assert.strictEqual(result.length, 1);
  });

  test('it filters on boolean type fields with falsy value', async function (assert) {
    const authMethod = this.server.create('auth-method', {
      name: 'Generated_auth_method',
      scopeId: scope1.id,
    });
    scope1.update({ primaryAuthMethodId: authMethod.id });
    await seedIndexDb('auth-method', store, indexedDb, this.server);
    const query = { filters: { is_primary: [{ equals: 'false' }] } };

    const result = await queryIndexedDb(indexedDb.db, 'auth-method', query);

    assert.strictEqual(result.length, 0);
  });
});
