/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { generateSQLExpressions } from 'api/utils/sqlite-query';
import { module, test } from 'qunit';

module('Unit | Utility | sqlite-query', function (hooks) {
  const date = new Date(2025, 1, 1);
  const isoDateString = date.toISOString();

  hooks.beforeEach(function () {
    String.prototype.removeExtraWhiteSpace = function () {
      return this.replace(/^\s+/gm, '').trim();
    };
  });

  hooks.afterEach(function () {
    delete String.prototype.removeExtraWhiteSpace;
  });

  test('it grabs resources not in the model mapping', function (assert) {
    const query = {
      filters: { id: [{ equals: 'tokenKey' }] },
    };

    const { sql, parameters } = generateSQLExpressions('token', query);
    assert.strictEqual(
      sql,
      `
        SELECT * FROM "token"
        WHERE (id = ?)`.removeExtraWhiteSpace(),
    );
    assert.deepEqual(parameters, ['tokenKey']);
  });

  test('it executes count queries correctly', function (assert) {
    const select = {
      select: [{ field: '*', isCount: true, alias: 'total' }],
    };

    const { sql, parameters } = generateSQLExpressions('target', {}, select);
    assert.strictEqual(
      sql,
      `
      SELECT count(*) as total FROM "target"
      ORDER BY created_time DESC`.removeExtraWhiteSpace(),
    );
    assert.deepEqual(parameters, []);
  });

  test.each(
    'it generates DISTINCT queries correctly',
    [
      {
        select: [{ field: 'type', isDistinct: true }],
        expectedSelect: 'type',
      },
      {
        select: [
          { field: 'type', isDistinct: true },
          { field: 'status', isDistinct: true },
        ],
        expectedSelect: 'type, status',
      },
    ],
    function (assert, { select, expectedSelect }) {
      const { sql, parameters } = generateSQLExpressions(
        'target',
        {},
        { select },
      );

      assert.strictEqual(
        sql,
        `
        SELECT DISTINCT ${expectedSelect} FROM "target"
        ORDER BY created_time DESC`.removeExtraWhiteSpace(),
      );
      assert.deepEqual(parameters, []);
    },
  );

  test.each(
    'it generates filters correctly',
    {
      equals: {
        query: {
          filters: {
            type: [{ equals: 'ssh' }],
          },
        },
        expectedWhereClause: 'WHERE (type = ?)',
        expectedParams: ['ssh'],
      },
      notEquals: {
        query: {
          filters: {
            type: [{ notEquals: 'ssh' }],
          },
        },
        expectedWhereClause: 'WHERE (type != ?)',
        expectedParams: ['ssh'],
      },
      contains: {
        query: {
          filters: {
            type: [{ contains: 'ssh' }],
          },
        },
        expectedWhereClause: 'WHERE (type LIKE ?)',
        expectedParams: ['%ssh%'],
      },
      greaterThan: {
        query: {
          filters: {
            created_time: [{ gt: date }],
            numberField: [{ gt: 10 }],
          },
        },
        expectedWhereClause: 'WHERE (created_time > ?) AND (numberField > ?)',
        expectedParams: [isoDateString, 10],
      },
      lessThan: {
        query: {
          filters: {
            created_time: [{ lt: date }],
            numberField: [{ lt: 10 }],
          },
        },
        expectedWhereClause: 'WHERE (created_time < ?) AND (numberField < ?)',
        expectedParams: [isoDateString, 10],
      },
      greaterThanOrEqual: {
        query: {
          filters: {
            created_time: [{ gte: date }],
            numberField: [{ gte: 10 }],
          },
        },
        expectedWhereClause: 'WHERE (created_time >= ?) AND (numberField >= ?)',
        expectedParams: [isoDateString, 10],
      },
      lessThanOrEqual: {
        query: {
          filters: {
            created_time: [{ lte: date }],
            numberField: [{ lte: 10 }],
          },
        },
        expectedWhereClause: 'WHERE (created_time <= ?) AND (numberField <= ?)',
        expectedParams: [isoDateString, 10],
      },
      logicalOperators: {
        query: {
          filters: {
            id: {
              logicalOperator: 'and',
              values: [{ notEquals: 'id1' }, { notEquals: 'id2' }],
            },
            status: {
              logicalOperator: 'or',
              values: [{ equals: 'active' }, { equals: 'pending' }],
            },
            type: [{ equals: 'ssh' }],
          },
        },
        expectedWhereClause:
          'WHERE (id NOT IN (?, ?)) AND (status IN (?, ?)) AND (type = ?)',
        expectedParams: ['id1', 'id2', 'active', 'pending', 'ssh'],
      },
    },

    function (assert, { query, expectedWhereClause, expectedParams }) {
      const { sql, parameters } = generateSQLExpressions('target', query);
      assert.strictEqual(
        sql,
        `
        SELECT * FROM "target"
        ${expectedWhereClause}
        ORDER BY created_time DESC`.removeExtraWhiteSpace(),
      );
      assert.deepEqual(parameters, expectedParams);
    },
  );

  test.each(
    'it generates sort direction correctly',
    [
      ['asc', 'ASC'],
      ['desc', 'DESC'],
    ],
    function (assert, [direction, expectedDirection]) {
      const query = {
        sort: { attributes: ['name'], direction },
      };

      const { sql, parameters } = generateSQLExpressions('target', query);
      assert.strictEqual(
        sql,
        `
        SELECT * FROM "target"
        ORDER BY name COLLATE NOCASE ${expectedDirection}, name ${expectedDirection}`.removeExtraWhiteSpace(),
      );
      assert.deepEqual(parameters, []);
    },
  );

  test.each(
    'it generates sort order clause correctly',
    {
      'sort on multiple attributes and coalesced': {
        sort: {
          attributes: ['name', 'id'],
          isCoalesced: true,
        },
        expectedOrderByClause: `ORDER BY COALESCE(name, id) COLLATE NOCASE DESC, COALESCE(name, id) DESC`,
      },
      'sort on multiple attributes': {
        sort: {
          attributes: ['name', 'id'],
        },
        expectedOrderByClause: `ORDER BY name COLLATE NOCASE DESC, id COLLATE NOCASE DESC, name DESC, id DESC`,
      },
      'sort on mapped attributes': {
        sort: {
          attributes: ['type'],
          customSort: { attributeMap: { ssh: 'SSH', tcp: 'Generic TCP' } },
        },
        expectedOrderByClause: `ORDER BY CASE type WHEN 'ssh' THEN 'SSH' WHEN 'tcp' THEN 'Generic TCP' END DESC`,
      },
    },
    function (assert, { sort, expectedOrderByClause }) {
      const query = {
        sort: { ...sort, direction: 'desc' },
      };

      const { sql, parameters } = generateSQLExpressions('target', query);
      assert.strictEqual(
        sql,
        `
        SELECT * FROM "target"
        ${expectedOrderByClause}`.removeExtraWhiteSpace(),
      );
      assert.deepEqual(parameters, []);
    },
  );

  test.each(
    'it generates pagination clause',
    [
      { page: 1, pageSize: 10, expectedParams: [10, 0] },
      { page: 3, pageSize: 10, expectedParams: [10, 20] },
      { page: 7, pageSize: 50, expectedParams: [50, 300] },
    ],
    function (assert, { page, pageSize, expectedParams }) {
      const { sql, parameters } = generateSQLExpressions(
        'target',
        {},
        { page, pageSize },
      );
      assert.strictEqual(
        sql,
        `
        SELECT * FROM "target"
        ORDER BY created_time DESC
        LIMIT ? OFFSET ?`.removeExtraWhiteSpace(),
      );
      assert.deepEqual(parameters, expectedParams);
    },
  );

  test('it generates FTS5 search with filters', function (assert) {
    const query = {
      search: 'favorite',
      filters: {
        id: {
          logicalOperator: 'and',
          values: [{ notEquals: 'id1' }, { notEquals: 'id2' }],
        },
        status: [{ equals: 'active' }, { equals: 'pending' }],
      },
    };

    const { sql, parameters } = generateSQLExpressions('target', query);
    assert.strictEqual(
      sql,
      `
        SELECT * FROM "target"
        WHERE (id NOT IN (?, ?)) AND (status IN (?, ?)) AND rowid IN (SELECT rowid FROM target_fts WHERE target_fts MATCH ?)
        ORDER BY created_time DESC`.removeExtraWhiteSpace(),
    );
    assert.deepEqual(parameters, [
      'id1',
      'id2',
      'active',
      'pending',
      '"favorite"*',
    ]);
  });

  test('it generates SQL with all clauses combined', function (assert) {
    const query = {
      search: 'favorite',
      filters: {
        type: [{ equals: 'ssh' }],
        status: {
          logicalOperator: 'or',
          values: [{ equals: 'active' }, { equals: 'pending' }],
        },
        created_time: [{ gte: date }],
      },
      sort: { attributes: ['name'], direction: 'desc' },
    };

    const { sql, parameters } = generateSQLExpressions('target', query, {
      page: 2,
      pageSize: 15,
      select: [{ field: 'data' }],
    });

    assert.strictEqual(
      sql,
      `
      SELECT data FROM "target"
      WHERE (type = ?) AND (status IN (?, ?)) AND (created_time >= ?) AND rowid IN (SELECT rowid FROM target_fts WHERE target_fts MATCH ?)
      ORDER BY name COLLATE NOCASE DESC, name DESC
      LIMIT ? OFFSET ?`.removeExtraWhiteSpace(),
    );

    assert.deepEqual(parameters, [
      'ssh',
      'active',
      'pending',
      isoDateString,
      '"favorite"*',
      15,
      15,
    ]);
  });

  test.each(
    'it handles empty and invalid fields',
    {
      emptyObject: {},
      emptySearch: { search: '' },
      emptyFilter: { filters: {} },
      emptyFilterAttributes: { filters: { type: [] } },
      invalidSortAttribute: {
        sort: { attributes: ['test'], direction: 'asc' },
      },
      invalidCoalescedSortAttribute: {
        sort: {
          attributes: ['id', 'test'],
          direction: 'asc',
          isCoalesced: true,
        },
      },
      onlyPage: { page: 10 },
      onlyPageSize: { pageSize: 5 },
    },
    function (assert, query) {
      const { sql: targetSql, parameters: targetParameters } =
        generateSQLExpressions('target', query);
      assert.strictEqual(
        targetSql,
        `
        SELECT * FROM "target"
        ORDER BY created_time DESC`.removeExtraWhiteSpace(),
      );
      assert.deepEqual(targetParameters, []);

      const { sql: resourceSql, parameters: resourceParameters } =
        generateSQLExpressions('resource', query);
      assert.strictEqual(
        resourceSql,
        `
        SELECT * FROM "resource"`.removeExtraWhiteSpace(),
      );
      assert.deepEqual(resourceParameters, []);
    },
  );
});
