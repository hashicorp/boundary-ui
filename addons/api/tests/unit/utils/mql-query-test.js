/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import {
  generateMQLSearchExpression,
  generateMQLFilterExpression,
  generateMQLExpression,
} from 'api/utils/mql-query';
import { module, test } from 'qunit';

module('Unit | Utility | mql-query', function () {
  module('generateMQLSearchExpression tests', function () {
    test('it generates search correctly', function (assert) {
      const result = generateMQLSearchExpression({
        text: 'search',
        fields: ['id', 'name', 'description'],
      });

      assert.strictEqual(
        result,
        '(id % "search" or name % "search" or description % "search")',
      );
    });

    test('it sanitizes search correctly', function (assert) {
      const result = generateMQLSearchExpression({
        text: String.raw`\backslash\ and "quotes"`,
        fields: ['id', 'name', 'description'],
      });

      assert.strictEqual(
        result,
        '(id % "\\\\backslash\\\\ and \\"quotes\\"" or name % "\\\\backslash\\\\ and \\"quotes\\"" or description % "\\\\backslash\\\\ and \\"quotes\\"")',
      );
    });

    test('it generates null when search is empty', function (assert) {
      const result = generateMQLSearchExpression({
        text: '',
        fields: ['id', 'name', 'description'],
      });

      assert.strictEqual(result, null);
    });
  });

  module('generateMQLFilterExpression tests', function () {
    test('it generates empty string when object is empty', function (assert) {
      const result = generateMQLFilterExpression({});

      assert.strictEqual(result, '');
    });

    test('it generates conditions in filters by ORing them together', function (assert) {
      const result = generateMQLFilterExpression({
        scope_id: [{ equals: 'scope1' }, { equals: 'scope2' }],
      });

      assert.strictEqual(
        result,
        '(scope_id = "scope1" or scope_id = "scope2")',
      );
    });

    test('it generates filters by ANDing separate filters together', function (assert) {
      const result = generateMQLFilterExpression({
        name: [{ contains: 'nameFilter' }],
        scope_id: [{ equals: 'scope1' }, { equals: 'scope2' }],
      });

      assert.strictEqual(
        result,
        '(name % "nameFilter") and (scope_id = "scope1" or scope_id = "scope2")',
      );
    });

    test('it generates each condition correctly', function (assert) {
      const result = generateMQLFilterExpression({
        name: [{ contains: 'nameFilter' }, { notEquals: 'otherFilter' }],
        id: [{ equals: 'woop' }],
        num: [{ gt: 50 }, { gte: 60 }, { lt: 100 }, { lte: 90 }],
      });

      assert.strictEqual(
        result,
        '(name % "nameFilter" or name != "otherFilter") and (id = "woop") and (num > 50 or num >= 60 or num < 100 or num <= 90)',
      );
    });

    test('it generates filters with logicalOperator specified', function (assert) {
      const andResult = generateMQLFilterExpression({
        id: {
          logicalOperator: 'and',
          values: [
            { notEquals: 'foo' },
            { notEquals: 'bar' },
            { notEquals: 'baz' },
          ],
        },
        scope_id: [{ equals: 'scope1' }],
      });
      const orResult = generateMQLFilterExpression({
        id: {
          logicalOperator: 'or',
          values: [
            { notEquals: 'foo' },
            { notEquals: 'bar' },
            { notEquals: 'baz' },
          ],
        },
        scope_id: [{ equals: 'scope1' }],
      });

      assert.strictEqual(
        andResult,
        '(id != "foo" and id != "bar" and id != "baz") and (scope_id = "scope1")',
      );
      assert.strictEqual(
        orResult,
        '(id != "foo" or id != "bar" or id != "baz") and (scope_id = "scope1")',
      );
    });

    test('it sanitizes filters correctly', function (assert) {
      const result = generateMQLFilterExpression({
        name: [{ equals: String.raw`\backslash\ and "quotes"` }],
        num: [{ gt: 50 }, { gte: 60 }, { lt: 100 }, { lte: 90 }],
      });

      assert.strictEqual(
        result,
        '(name = "\\\\backslash\\\\ and \\"quotes\\"") and (num > 50 or num >= 60 or num < 100 or num <= 90)',
      );
    });
  });

  module('generateMQLExpression tests', function () {
    test('it generates both search and filters correctly', function (assert) {
      const result = generateMQLExpression({
        filters: {
          name: [{ contains: 'nameFilter' }, { notEquals: 'otherFilter' }],
          id: {
            logicalOperator: 'and',
            values: [{ notEquals: 'foo' }, { notEquals: 'bar' }],
          },
          num: [{ gt: 50 }, { gte: 60 }, { lt: 100 }, { lte: 90 }],
        },
        search: {
          text: 'search',
          fields: ['id', 'name', 'description'],
        },
      });

      assert.strictEqual(
        result,
        '(id % "search" or name % "search" or description % "search") and (name % "nameFilter" or name != "otherFilter") and (id != "foo" and id != "bar") and (num > 50 or num >= 60 or num < 100 or num <= 90)',
      );
    });

    test('it generates empty string when nothing is provided', function (assert) {
      const result = generateMQLExpression({
        filters: {
          name: [],
          id: [],
        },
        search: {
          text: '',
          fields: ['id', 'name', 'description'],
        },
      });

      assert.strictEqual(result, '');
    });

    test('it generates just search when filters are empty', function (assert) {
      const result = generateMQLExpression({
        filters: {
          name: [],
          scope_id: [],
        },
        search: {
          text: 'search',
          fields: ['id', 'name', 'description'],
        },
      });

      assert.strictEqual(
        result,
        '(id % "search" or name % "search" or description % "search")',
      );
    });

    test('it generates just filters when search is empty', function (assert) {
      const result = generateMQLExpression({
        filters: {
          name: [{ contains: 'nameFilter' }],
          scope_id: [{ equals: 'scope1' }, { equals: 'scope2' }],
        },
        search: {
          text: '',
          fields: ['id', 'name', 'description'],
        },
      });

      assert.strictEqual(
        result,
        '(name % "nameFilter") and (scope_id = "scope1" or scope_id = "scope2")',
      );
    });
  });
});
