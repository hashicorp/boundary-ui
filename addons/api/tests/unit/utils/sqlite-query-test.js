/**
 * Copyright IBM Corp. 2021, 2025
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
        WHERE ("token".id = ?)`.removeExtraWhiteSpace(),
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
      ORDER BY "target".created_time DESC`.removeExtraWhiteSpace(),
    );
    assert.deepEqual(parameters, []);
  });

  test.each(
    'it generates select clause with various options',
    {
      'single field': {
        select: [{ field: 'name' }],
        expectedSelect: '"target".name',
      },
      'multiple fields': {
        select: [{ field: 'name' }, { field: 'type' }, { field: 'id' }],
        expectedSelect: '"target".name, "target".type, "target".id',
      },
      'field with alias': {
        select: [{ field: 'name', alias: 'resource_name' }],
        expectedSelect: '"target".name as resource_name',
      },
      'multiple fields with aliases': {
        select: [
          { field: 'name', alias: 'resource_name' },
          { field: 'type', alias: 'resource_type' },
        ],
        expectedSelect:
          '"target".name as resource_name, "target".type as resource_type',
      },
      'count with alias': {
        select: [{ field: 'id', isCount: true, alias: 'total_count' }],
        expectedSelect: 'count("target".id) as total_count',
      },
      'count without alias': {
        select: [{ field: '*', isCount: true }],
        expectedSelect: 'count(*)',
      },
      'count distinct': {
        select: [{ field: 'status', isCount: true, isDistinct: true }],
        expectedSelect: 'count(DISTINCT "target".status)',
      },
      'count distinct with alias': {
        select: [
          {
            field: 'type',
            isCount: true,
            isDistinct: true,
            alias: 'unique_types',
          },
        ],
        expectedSelect: 'count(DISTINCT "target".type) as unique_types',
      },
      'mixed regular and count fields': {
        select: [
          { field: 'name' },
          { field: 'id', isCount: true, alias: 'count' },
        ],
        expectedSelect: '"target".name, count("target".id) as count',
      },
      'field with distinct': {
        select: [{ field: 'type', isDistinct: true }],
        expectedSelect: 'DISTINCT "target".type',
      },
      'multiple distinct fields': {
        select: [
          { field: 'type', isDistinct: true },
          { field: 'status', isDistinct: true },
        ],
        expectedSelect: 'DISTINCT "target".type, "target".status',
      },
      'multiple distinct with count fields': {
        select: [
          { field: 'type', isDistinct: true, isCount: true },
          { field: 'status', isDistinct: true, isCount: true },
        ],
        expectedSelect:
          'count(DISTINCT "target".type), count(DISTINCT "target".status)',
      },
      'distinct with alias': {
        select: [{ field: 'type', isDistinct: true, alias: 'unique_type' }],
        expectedSelect: 'DISTINCT "target".type as unique_type',
      },
      'multiple distinct fields with aliases': {
        select: [
          { field: 'type', isDistinct: true, alias: 'unique_type' },
          { field: 'status', isDistinct: true, alias: 'unique_status' },
        ],
        expectedSelect:
          'DISTINCT "target".type as unique_type, "target".status as unique_status',
      },
      'count distinct multiple fields': {
        select: [
          {
            field: 'type',
            isCount: true,
            isDistinct: true,
            alias: 'type_count',
          },
          {
            field: 'status',
            isCount: true,
            isDistinct: true,
            alias: 'status_count',
          },
        ],
        expectedSelect:
          'count(DISTINCT "target".type) as type_count, count(DISTINCT "target".status) as status_count',
      },
    },
    function (assert, { select, expectedSelect }) {
      const { sql, parameters } = generateSQLExpressions(
        'target',
        {},
        { select },
      );

      assert.strictEqual(
        sql,
        `
        SELECT ${expectedSelect} FROM "target"
        ORDER BY "target".created_time DESC`.removeExtraWhiteSpace(),
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
        expectedWhereClause: 'WHERE ("target".type = ?)',
        expectedParams: ['ssh'],
      },
      notEquals: {
        query: {
          filters: {
            type: [{ notEquals: 'ssh' }],
          },
        },
        expectedWhereClause: 'WHERE ("target".type != ?)',
        expectedParams: ['ssh'],
      },
      contains: {
        query: {
          filters: {
            type: [{ contains: 'ssh' }],
          },
        },
        expectedWhereClause: 'WHERE ("target".type LIKE ?)',
        expectedParams: ['%ssh%'],
      },
      greaterThan: {
        query: {
          filters: {
            created_time: [{ gt: date }],
            numberField: [{ gt: 10 }],
          },
        },
        expectedWhereClause:
          'WHERE ("target".created_time > ?) AND ("target".numberField > ?)',
        expectedParams: [isoDateString, 10],
      },
      lessThan: {
        query: {
          filters: {
            created_time: [{ lt: date }],
            numberField: [{ lt: 10 }],
          },
        },
        expectedWhereClause:
          'WHERE ("target".created_time < ?) AND ("target".numberField < ?)',
        expectedParams: [isoDateString, 10],
      },
      greaterThanOrEqual: {
        query: {
          filters: {
            created_time: [{ gte: date }],
            numberField: [{ gte: 10 }],
          },
        },
        expectedWhereClause:
          'WHERE ("target".created_time >= ?) AND ("target".numberField >= ?)',
        expectedParams: [isoDateString, 10],
      },
      lessThanOrEqual: {
        query: {
          filters: {
            created_time: [{ lte: date }],
            numberField: [{ lte: 10 }],
          },
        },
        expectedWhereClause:
          'WHERE ("target".created_time <= ?) AND ("target".numberField <= ?)',
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
          'WHERE ("target".id NOT IN (?, ?)) AND ("target".status IN (?, ?)) AND ("target".type = ?)',
        expectedParams: ['id1', 'id2', 'active', 'pending', 'ssh'],
      },
      equalsNull: {
        query: {
          filters: {
            description: [{ equals: null }],
          },
        },
        expectedWhereClause: 'WHERE ("target".description IS NULL)',
        expectedParams: [],
      },
      notEqualsNull: {
        query: {
          filters: {
            description: [{ notEquals: null }],
          },
        },
        expectedWhereClause: 'WHERE ("target".description IS NOT NULL)',
        expectedParams: [],
      },
      mixedNullAndValues: {
        query: {
          filters: {
            status: [
              { equals: 'active' },
              { equals: 'pending' },
              { equals: null },
            ],
            type: [{ notEquals: null }, { notEquals: 'ssh' }],
          },
        },
        expectedWhereClause:
          'WHERE ("target".status IN (?, ?) OR "target".status IS NULL) AND ("target".type NOT IN (?) OR "target".type IS NOT NULL)',
        expectedParams: ['active', 'pending', 'ssh'],
      },
    },

    function (assert, { query, expectedWhereClause, expectedParams }) {
      const { sql, parameters } = generateSQLExpressions('target', query);
      assert.strictEqual(
        sql,
        `
        SELECT * FROM "target"
        ${expectedWhereClause}
        ORDER BY "target".created_time DESC`.removeExtraWhiteSpace(),
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
        ORDER BY "target".name COLLATE NOCASE ${expectedDirection}, "target".name ${expectedDirection}`.removeExtraWhiteSpace(),
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
        expectedOrderByClause: `ORDER BY COALESCE("target".name, "target".id) COLLATE NOCASE DESC, COALESCE("target".name, "target".id) DESC`,
      },
      'sort on multiple attributes': {
        sort: {
          attributes: ['name', 'id'],
        },
        expectedOrderByClause: `ORDER BY "target".name COLLATE NOCASE DESC, "target".id COLLATE NOCASE DESC, "target".name DESC, "target".id DESC`,
      },
      'sort on mapped attributes': {
        sort: {
          attributes: ['type'],
          customSort: { attributeMap: { ssh: 'SSH', tcp: 'Generic TCP' } },
        },
        expectedOrderByClause: `ORDER BY CASE "target".type WHEN 'ssh' THEN 'SSH' WHEN 'tcp' THEN 'Generic TCP' END DESC`,
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
        ORDER BY "target".created_time DESC
        LIMIT ? OFFSET ?`.removeExtraWhiteSpace(),
      );
      assert.deepEqual(parameters, expectedParams);
    },
  );

  test.each(
    'it generates FTS5 search correctly',
    {
      'string search with filters': {
        query: {
          search: 'favorite',
        },
        expectedSql: `
          SELECT * FROM "target"
          WHERE "target".rowid IN (SELECT rowid FROM target_fts WHERE target_fts MATCH ?)
          ORDER BY "target".created_time DESC`,
        expectedParams: ['"favorite"*'],
      },
      'object search with field-specific searches': {
        query: {
          search: {
            text: 'favorite',
            fields: ['name', 'description'],
          },
        },
        expectedSql: `
          SELECT * FROM "target"
          WHERE "target".rowid IN (SELECT rowid FROM target_fts WHERE target_fts MATCH ?)
          ORDER BY "target".created_time DESC`,
        expectedParams: ['name:"favorite"* OR description:"favorite"*'],
      },
      'search with related searches': {
        query: {
          search: {
            text: 'dev',
            select: 'id',
            relatedSearches: [
              {
                resource: 'alias',
                fields: ['name', 'description'],
                join: {
                  joinOn: 'destination_id',
                  joinFrom: 'id',
                },
              },
            ],
          },
        },
        expectedSql: `
          SELECT * FROM "target"
          WHERE "target".id IN (SELECT id FROM target_fts WHERE target_fts MATCH ?
                                UNION SELECT "target".id FROM alias_fts JOIN "target" ON "target".id = alias_fts.destination_id WHERE alias_fts MATCH ?)
          ORDER BY "target".created_time DESC`,
        expectedParams: ['"dev"*', 'name:"dev"* OR description:"dev"*'],
      },
      'search with multiple related searches': {
        query: {
          search: {
            text: 'dev',
            relatedSearches: [
              {
                resource: 'alias',
                fields: ['name', 'description'],
                join: {
                  joinOn: 'destination_id',
                },
              },
              {
                resource: 'session',
                fields: ['name'],
                join: {
                  joinOn: 'target_id',
                },
              },
            ],
          },
        },
        expectedSql: `
          SELECT * FROM "target"
          WHERE "target".rowid IN (SELECT rowid FROM target_fts WHERE target_fts MATCH ?
                                   UNION SELECT "target".rowid FROM alias_fts JOIN "target" ON "target".id = alias_fts.destination_id WHERE alias_fts MATCH ?
                                   UNION SELECT "target".rowid FROM session_fts JOIN "target" ON "target".id = session_fts.target_id WHERE session_fts MATCH ?)
          ORDER BY "target".created_time DESC`,
        expectedParams: [
          '"dev"*',
          'name:"dev"* OR description:"dev"*',
          'name:"dev"*',
        ],
      },
    },
    function (assert, { query, expectedSql, expectedParams }) {
      const { sql, parameters } = generateSQLExpressions('target', query);
      assert.strictEqual(sql, expectedSql.removeExtraWhiteSpace());
      assert.deepEqual(parameters, expectedParams);
    },
  );

  test.each(
    'it generates joins with filters',
    {
      'basic joins with filters': {
        query: {
          filters: {
            type: [{ equals: 'ssh' }],
            joins: [
              {
                resource: 'session',
                query: {
                  filters: {
                    status: [{ equals: 'active' }],
                  },
                },
                joinOn: 'target_id',
                joinType: 'INNER',
              },
              {
                resource: 'session-recording',
                query: {
                  filters: {
                    state: [{ equals: 'available' }],
                  },
                },
                joinFrom: 'idx',
                joinOn: 'target_id',
                joinType: 'LEFT',
              },
            ],
          },
        },
        select: [{ field: 'data' }],
        expectedSql: `
          SELECT "target".data FROM "target"
          INNER JOIN "session" session1 ON "target".id = session1.target_id LEFT JOIN "session_recording" session_recording1 ON "target".idx = session_recording1.target_id
          WHERE ("target".type = ?) AND ("session1".status = ?) AND ("session_recording1".state = ?)
          ORDER BY "target".created_time DESC`,
        expectedParams: ['ssh', 'active', 'available'],
      },
      'multiple joins same table': {
        query: {
          filters: {
            joins: [
              {
                resource: 'session',
                query: {
                  filters: {
                    status: [{ equals: 'active' }],
                  },
                },
                joinOn: 'target_id',
                joinType: 'INNER',
              },
              {
                resource: 'session',
                query: {
                  filters: {
                    status: [{ equals: 'pending' }],
                  },
                },
                joinOn: 'host_id',
                joinType: 'LEFT',
              },
            ],
          },
        },
        select: [{ field: 'id' }],
        expectedSql: `
          SELECT "target".id FROM "target"
          INNER JOIN "session" session1 ON "target".id = session1.target_id LEFT JOIN "session" session2 ON "target".id = session2.host_id
          WHERE ("session1".status = ?) AND ("session2".status = ?)
          ORDER BY "target".created_time DESC`,
        expectedParams: ['active', 'pending'],
      },
    },
    function (assert, { query, select, expectedSql, expectedParams }) {
      const { sql, parameters } = generateSQLExpressions('target', query, {
        select,
      });
      assert.strictEqual(sql, expectedSql.removeExtraWhiteSpace());
      assert.deepEqual(parameters, expectedParams);
    },
  );

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
      SELECT "target".data FROM "target"
      WHERE ("target".type = ?) AND ("target".status IN (?, ?)) AND ("target".created_time >= ?) AND "target".rowid IN (SELECT rowid FROM target_fts WHERE target_fts MATCH ?)
      ORDER BY "target".name COLLATE NOCASE DESC, "target".name DESC
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
    'it throws assertion error for invalid select combinations',
    {
      'mixing distinct with non-distinct columns': {
        select: [
          { field: 'type', isDistinct: true },
          { field: 'status', isDistinct: true },
          { field: 'name' },
        ],
        expectedError:
          /Can not combine non-distincts with multi column distincts/,
      },
      'mixing distinct with aggregate non-distinct columns': {
        select: [
          { field: 'type', isDistinct: true },
          { field: 'status', isDistinct: true },
          { field: 'name', isCount: true },
        ],
        expectedError:
          /Can not combine non-distincts with multi column distincts/,
      },
    },
    function (assert, { select, expectedError }) {
      assert.throws(() => {
        generateSQLExpressions('target', {}, { select });
      }, expectedError);
    },
  );

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
        ORDER BY "target".created_time DESC`.removeExtraWhiteSpace(),
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
