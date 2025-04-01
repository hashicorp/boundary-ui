import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import IndexedDbHandler from 'api/handlers/indexed-db-handler';
import RequestManager from '@ember-data/request';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { faker } from '@faker-js/faker';
import sinon from 'sinon';
import { assert } from '@ember/debug';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';

function createPaginatedResponses(mirageRecords, { pageSize }) {
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

  return {
    results,

    nextResult(listToken) {
      const index = results.findIndex(
        ({ list_token }) => list_token === listToken,
      );
      const nextResult = index === -1 ? null : results[index + 1];
      return nextResult ?? null;
    },
  };
}

module('Unit | Handler | indexed-db-handler', function (hooks) {
  setupTest(hooks);
  setupIndexedDb(hooks);
  setupMirage(hooks);

  const testBatchLimit = 10;
  let previousBatchLimit;
  hooks.beforeEach(function setBatchLimitConfig() {
    const environmentConfig =
      this.owner.resolveRegistration('config:environment');
    previousBatchLimit = environmentConfig.api.batchLimit;
    environmentConfig.api.batchLimit = testBatchLimit;
  });
  hooks.afterEach(function restoreBatchLimitConfig() {
    const environmentConfig =
      this.owner.resolveRegistration('config:environment');
    environmentConfig.api.batchLimit = previousBatchLimit;
  });

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

  // this number is intentionally different from the `testBatchLimit` so
  // that multiple calls to the server are required to fetch a single batch,
  // and these multiples can be asserted in the tests individually
  const serverResultPageLimit = 5;
  let aliases, aliasesServerHandlerSpy;
  hooks.beforeEach(function setupMirageData() {
    aliases = this.server.createList('alias', 50);
    const paginatedResponses = createPaginatedResponses(
      this.server.schema.aliases.all().models,
      { pageSize: serverResultPageLimit },
    );

    // mock response for aliases query
    aliasesServerHandlerSpy = sinon.spy(function (_schema, request) {
      const listToken = request.queryParams.list_token;
      if (!listToken) {
        return paginatedResponses.results[0];
      }

      const result = paginatedResponses.nextResult(listToken);
      assert('requested paginated result should exist', result);
      return result;
    });
    this.server.get('aliases', aliasesServerHandlerSpy);
  });

  test('it returns data sorted by created_time', async function (assert) {
    const results = await store.query('alias', {});

    assert.strictEqual(
      aliases.length,
      results.length,
      'all records are returned',
    );

    const aliasesSortedByCreatedTime = [...aliases].sort(
      (a, b) => new Date(b.created_time) - new Date(a.created_time),
    );
    assert.notDeepEqual(
      aliases,
      aliasesSortedByCreatedTime,
      'aliases are not sorted by created_time by default',
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
      aliasesServerHandlerSpy.callCount,
      aliases.length / serverResultPageLimit,
      'server handler should be called once for each page',
    );
  });
});
