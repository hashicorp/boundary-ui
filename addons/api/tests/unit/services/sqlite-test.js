/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'dummy/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { modelMapping } from 'api/services/sqlite';
import { underscore } from '@ember/string';

const supportedModels = Object.keys(modelMapping);

module('Unit | Service | sqlite', function (hooks) {
  setupTest(hooks);
  setupSqlite(hooks);

  test.each(
    'Mapping matches table columns',
    supportedModels,
    async function (assert, resource) {
      const service = this.owner.lookup('service:sqlite');

      const tableColumns = await service.fetchResource({
        sql: `SELECT * FROM pragma_table_info('${underscore(resource)}')`,
      });

      const columnNames = tableColumns.map((column) => column.name);

      const modelKeys = Object.keys(modelMapping[resource]);

      // Last column should always be "data" which we don't map
      assert.strictEqual(columnNames[columnNames.length - 1], 'data');
      assert.deepEqual(columnNames.slice(0, -1), modelKeys);
    },
  );

  test.each(
    'Mapping matches fts table columns',
    supportedModels,
    async function (assert, resource) {
      const service = this.owner.lookup('service:sqlite');

      const tableColumns = await service.fetchResource({
        sql: `SELECT * FROM pragma_table_info('${underscore(resource)}_fts')`,
      });

      const columnNames = tableColumns.map((column) => column.name);
      const modelKeys = Object.keys(modelMapping[resource]);

      assert.deepEqual(columnNames, modelKeys);
    },
  );

  test('it inserts and deletes large amounts of rows', async function (assert) {
    const service = this.owner.lookup('service:sqlite');

    const targets = [];
    const numberOfTargets = 35_000;

    for (let i = 0; i < numberOfTargets; i++) {
      targets.push([
        `ttcp_${i}`,
        'tcp',
        `name${i}`,
        null,
        '',
        'p_SWAXCPqUPr',
        '2025-07-17T21:39:11.171Z',
        'test data',
      ]);
    }
    await service.insertResource('target', targets);

    let count = await service.fetchResource({
      sql: `SELECT count(*) as count FROM target`,
    });
    let total = count[0];

    assert.strictEqual(total.count, numberOfTargets);

    const ids = targets.map((target) => target[0]);
    await service.deleteResource('target', ids);

    count = await service.fetchResource({
      sql: `SELECT count(*) as count FROM target`,
    });
    total = count[0];

    assert.strictEqual(total.count, 0);
  });
});
