/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import IndexedDbHandler from 'api/handlers/indexed-db-handler';
import RequestManager from '@ember-data/request';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { faker } from '@faker-js/faker';
import sinon from 'sinon';
import { assert } from '@ember/debug';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import TargetModel from 'api/models/target';

function createPaginatedResponseHandler(mirageRecords, { pageSize }) {
  assert('pageSize is required', pageSize);
  const pagesCount = mirageRecords.length / pageSize;

  const results = [];
  for (let i = 0; i < pagesCount; i++) {
    const items = mirageRecords.slice(i * pageSize, (i + 1) * pageSize);
    const isLastPage = i === pagesCount - 1;
    const list_token = `list-token-${faker.string.nanoid({ min: 5, max: 5 })}`;

    results.push({
      items,
      list_token,
      response_type: !isLastPage ? 'delta' : 'complete',
    });
  }

  function nextResult(listToken) {
    const index = results.findIndex(
      ({ list_token }) => list_token === listToken,
    );
    const nextResult = index === -1 ? null : results[index + 1];
    return nextResult;
  }

  // mirage handler compatible with paginated responses
  return function (_schema, request) {
    const listToken = request.queryParams.list_token;
    if (!listToken) {
      return results[0];
    }

    const result = nextResult(listToken);

    if (!result) {
      return new Response(
        404,
        {},
        `No results found for list token "${listToken}"`,
      );
    }

    return result;
  };
}

module('Unit | Handler | indexed-db-handler', function (hooks) {
  setupTest(hooks);
  setupIndexedDb(hooks);
  setupMirage(hooks);

  let manager,
    handler,
    store,
    applicationAdapter,
    handlerSpy,
    applicationAdapterSpy;
  hooks.beforeEach(async function setupIndexHandler() {
    store = this.owner.lookup('service:store');
    manager = new RequestManager();
    handler = new IndexedDbHandler(store);
    applicationAdapter = store.adapterFor('application');

    // spy on all handler and application adapter methods
    handlerSpy = sinon.spy(handler);
    applicationAdapterSpy = sinon.spy(applicationAdapter);

    store.requestManager = manager;
    manager.use([handler]);
  });

  module('fetching and batch loading', function (hooks) {
    // `testBatchLimit` and `serverResultPageLimit` are intentionally difference
    // so that multiple calls to the server are required to fetch a single batch,
    // and these multiples can be asserted in the tests individually
    const testBatchLimit = 10;
    const serverResultPageLimit = 5;
    let aliases, aliasResponseHandlerSpy;

    hooks.beforeEach(function setupMirageData() {
      handler.batchLimit = testBatchLimit;

      aliases = this.server.createList('alias', 50);

      const aliasResponseHandler = createPaginatedResponseHandler(
        this.server.schema.aliases.all().models,
        { pageSize: serverResultPageLimit },
      );

      aliasResponseHandlerSpy = sinon.spy(aliasResponseHandler);
      this.server.get('aliases', aliasResponseHandlerSpy);
    });

    test('it returns all data for a resource from the server', async function (assert) {
      const results = await store.query('alias', {});

      assert.strictEqual(
        aliases.length,
        results.length,
        'all records are returned',
      );

      const aliasesSortedByCreatedTime = [...aliases].sort(
        (a, b) => new Date(b.created_time) - new Date(a.created_time),
      );

      assert.deepEqual(
        aliasesSortedByCreatedTime.map(({ name }) => name),
        results.map(({ name }) => name),
        '`name` property matches between the returned results and the mirage records sorted by created_time',
      );
    });

    test('supports batching requests and writes to indexedDB', async function (assert) {
      await store.query('alias', {});

      assert.strictEqual(
        handlerSpy.writeToIndexedDb.callCount,
        aliases.length / testBatchLimit,
        'handler #writeToIndexedDb is called once for each batch',
      );

      assert.strictEqual(
        applicationAdapterSpy.query.callCount,
        aliases.length / testBatchLimit,
        'application adapter #query is called once for each batch',
      );

      assert.strictEqual(
        aliasResponseHandlerSpy.callCount,
        aliases.length / serverResultPageLimit,
        'server handler should be called once for each page',
      );
    });

    test('it loads from indexeddb only when peekIndexedDB option is used', async function (assert) {
      assert.strictEqual(handlerSpy.writeToIndexedDb.callCount, 0);
      assert.strictEqual(aliasResponseHandlerSpy.callCount, 0);

      const results = await store.query('alias', {});
      assert.strictEqual(results.length, 50);

      // first `store.query()` calls api and writes batches to indexededdb
      assert.strictEqual(handlerSpy.writeToIndexedDb.callCount, 5);
      assert.strictEqual(aliasResponseHandlerSpy.callCount, 10);

      await store.query('alias', {}, { peekIndexedDB: true });
      assert.strictEqual(results.length, 50);

      // second run does not increase call counts to api or writes to indexeddb
      assert.strictEqual(handlerSpy.writeToIndexedDb.callCount, 5);
      assert.strictEqual(aliasResponseHandlerSpy.callCount, 10);
    });
  });

  module('sorting', function () {
    test('it sorts by descending `created_time` by default', async function (assert) {
      const target2020 = this.server.create('target', {
        name: 'Target 2020',
        created_time: '2020-01-01T00:00:00Z',
      });

      const target2021 = this.server.create('target', {
        name: 'Target 2021',
        created_time: '2021-01-01T00:00:00Z',
      });

      const target2022 = this.server.create('target', {
        name: 'Target 2022',
        created_time: '2022-01-01T00:00:00Z',
      });

      const target2023 = this.server.create('target', {
        name: 'Target 2023',
        created_time: '2023-01-01T00:00:00Z',
      });

      const shuffledTargets = faker.helpers.shuffle([
        target2020,
        target2021,
        target2022,
        target2023,
      ]);

      this.server.get(
        'targets',
        createPaginatedResponseHandler(shuffledTargets, {
          pageSize: 1,
        }),
      );

      const results = await store.query('target', {});
      assert.deepEqual(
        results.map(({ name }) => name),
        ['Target 2023', 'Target 2022', 'Target 2021', 'Target 2020'],
      );
    });
  });

  module('option: pushToStore', function(hooks) {
    let mirageTargets;

    hooks.beforeEach(function() {
      mirageTargets = this.server.createList('target', 5);
    });

    test('it pushes fetched results to store by default', async function(assert) {
      this.server.get(
        'targets',
        createPaginatedResponseHandler(mirageTargets, {
          pageSize: 1,
        }),
      );

      assert.strictEqual(mirageTargets.length, 5);
      assert.strictEqual(store.peekAll('target').length, 0);
      const results = await store.query('target', {});
      assert.strictEqual(results.length, 5);
      assert.ok(results.every(result => result instanceof TargetModel), 'results are ember data models');
      assert.strictEqual(store.peekAll('target').length, 5);
    });

    test('it pushes fethed results to store when pushToStore is true', async function(assert) {
      this.server.get(
        'targets',
        createPaginatedResponseHandler(mirageTargets, {
          pageSize: 1,
        }),
      );

      assert.strictEqual(mirageTargets.length, 5);
      assert.strictEqual(store.peekAll('target').length, 0);
      const results = await store.query('target', {}, { pushToStore: true });
      assert.strictEqual(results.length, 5);
      assert.ok(results.every(result => result instanceof TargetModel), 'results are ember data models');
      assert.strictEqual(store.peekAll('target').length, 5);
    });

    test('it does not push fetchedResults to store when pushToStore is false', async function(assert) {
      this.server.get(
        'targets',
        createPaginatedResponseHandler(mirageTargets, {
          pageSize: 1,
        }),
      );

      assert.strictEqual(mirageTargets.length, 5);
      assert.strictEqual(store.peekAll('target').length, 0);
      const results = await store.query('target', {}, { pushToStore: false });
      assert.strictEqual(results.length, 5);
      assert.ok(results.every(result => !(result instanceof TargetModel)), 'results are not ember data models');
      assert.strictEqual(store.peekAll('target').length, 0);
    });
  });

  test('it supports searching', async function (assert) {
    this.server.create('target', {
      name: 'Magical Target',
      description: 'A target',
    });

    this.server.create('target', {
      name: 'Target 2',
      description: 'Target with magic',
    });

    this.server.createList('target', 4);

    this.server.get(
      'targets',
      createPaginatedResponseHandler(this.server.schema.targets.all().models, {
        pageSize: 1,
      }),
    );

    const results = await store.query('target', {
      query: { search: 'magic' },
    });

    assert.deepEqual(
      results
        // search results aren't returning in a consistent order so
        // the sorting is used to be able to assert
        .sort((a, b) => (a.name > b.name ? 1 : -1))
        .map(({ name, description }) => ({ name, description })),
      [
        {
          description: 'A target',
          name: 'Magical Target',
        },
        {
          description: 'Target with magic',
          name: 'Target 2',
        },
      ],
    );
  });

  test('it supports filtering', async function (assert) {
    this.server.create('target', {
      name: 'specific-target',
    });

    this.server.createList('target', 5);

    this.server.get(
      'targets',
      createPaginatedResponseHandler(this.server.schema.targets.all().models, {
        pageSize: 1,
      }),
    );

    const results = await store.query('target', {
      query: { filters: { name: [{ equals: 'specific-target' }] } },
    });

    assert.strictEqual(results[0].name, 'specific-target');
  });
});
