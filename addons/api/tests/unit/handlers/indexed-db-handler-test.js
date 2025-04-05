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

  let manager, handler, store, applicationAdapter;
  hooks.beforeEach(async function setupIndexHandler() {
    store = this.owner.lookup('service:store');
    manager = new RequestManager();
    handler = new IndexedDbHandler(store);
    applicationAdapter = store.adapterFor('application');

    // spy on all handler and application adapter methods
    sinon.spy(handler);
    sinon.spy(applicationAdapter);

    store.requestManager = manager;
    manager.use([handler]);
  });

  module('fetching and batch loading', function (hooks) {
    // `testBatchLimit` and `serverResultPageLimit` are intentionally difference
    // so that multiple calls to the server are required to fetch a single batch,
    // and these multiples can be asserted in the tests individually
    const testBatchLimit = 10;
    const serverResultPageLimit = 5;

    hooks.beforeEach(function () {
      handler.batchLimit = testBatchLimit;
    });

    let aliases, aliasResponseHandlerSpy;

    hooks.beforeEach(function setupMirageData() {
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
        handler.writeToIndexedDb.callCount,
        aliases.length / testBatchLimit,
        'handler #writeToIndexedDb is called once for each batch',
      );

      assert.strictEqual(
        applicationAdapter.query.callCount,
        aliases.length / testBatchLimit,
        'application adapter #query is called once for each batch',
      );

      assert.strictEqual(
        aliasResponseHandlerSpy.callCount,
        aliases.length / serverResultPageLimit,
        'server handler should be called once for each page',
      );
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
});
