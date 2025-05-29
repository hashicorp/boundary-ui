/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { assert, module, test } from 'qunit';
import { sortResults } from 'api/utils/sort-results';
import { faker } from '@faker-js/faker';
import { setupTest } from 'ember-qunit';

function createJsonApiMockRecord(id, type, attributes) {
  return {
    id,
    type,
    attributes,
  };
}

module('Unit | Utility | sortResults', function (hooks) {
  setupTest(hooks);

  module('Defaults', function () {
    test("throws an error when an attribute is not id, created_time or defined as a schema attribute, even when it exists on the record's attribute object", function (assert) {
      const result01 = createJsonApiMockRecord('id_01', 'target', {
        name: 'Result 01',
      });
      const result02 = createJsonApiMockRecord('id_02', 'target', {
        name: 'Result 02',
      });
      const result03 = createJsonApiMockRecord('id_03', 'target', {
        name: 'Result 03',
      });

      const shuffledResults = faker.helpers.shuffle([
        result01,
        result02,
        result03,
      ]);

      const querySort = { attribute: 'name' };

      // Note: `name` is not defined as a schema attribute but exists on the record
      const schema = { attributes: new Map() };
      schema.attributes.set('date', { type: 'date' });

      assert.throws(
        () => sortResults(shuffledResults, { querySort, schema }),
        /Error: The attribute "name" does not map to the model definition of type "target". Supported sortable attributes are 'id', 'created_time', or 'date'/,
      );
    });

    test('throws an error when results do not contain a valid sort direction', function (assert) {
      const result01 = createJsonApiMockRecord('id_01', 'target', {
        name: 'Result 01',
      });

      const querySort = {
        attribute: 'name',
        direction: 'invalid sort direction',
      };
      const schema = { attributes: new Map() };
      schema.attributes.set('name', { type: 'string' });
      assert.throws(
        () => sortResults([result01], { querySort, schema }),
        /Error: Invalid sort direction/,
      );
    });

    test('when passing no querySort, sorts using default created_time, descending order and string sorting', async function (assert) {
      const result01 = createJsonApiMockRecord('id_01', 'target', {
        created_time: '2021',
      });
      const result02 = createJsonApiMockRecord('id_02', 'target', {
        created_time: '2022',
      });
      const result03 = createJsonApiMockRecord('id_03', 'target', {
        created_time: '2023',
      });
      const result04 = createJsonApiMockRecord('id_04', 'target', {
        created_time: '2024',
      });

      const shuffledResults = faker.helpers.shuffle([
        result01,
        result02,
        result03,
        result04,
      ]);
      const querySort = {};
      const schema = { attributes: new Map() };
      schema.attributes.set('created_time', { type: 'string' });
      const sortedResults = sortResults(shuffledResults, {
        querySort,
        schema,
      });
      assert.deepEqual(
        sortedResults.map(({ attributes: { created_time } }) => created_time),
        ['2024', '2023', '2022', '2021'],
      );
    });

    test('when sorting by id, without being on the results attributes it sorts as expected ', function () {
      const result01 = createJsonApiMockRecord('id_01', 'target', {
        name: 'Result 01',
      });
      const result02 = createJsonApiMockRecord('id_02', 'target', {
        name: 'Result 02',
      });
      const result03 = createJsonApiMockRecord('id_03', 'target', {
        name: 'Result 03',
      });
      const result04 = createJsonApiMockRecord('id_04', 'target', {
        name: 'Result 04',
      });

      const shuffledResults = faker.helpers.shuffle([
        result01,
        result02,
        result03,
        result04,
      ]);
      const querySort = { attribute: 'id' };
      const schema = { attributes: new Map() };
      schema.attributes.set('id', { type: 'string' });
      const sortedResults = sortResults(shuffledResults, { querySort, schema });

      assert.deepEqual(
        sortedResults.map(({ id }) => id),
        ['id_01', 'id_02', 'id_03', 'id_04'],
      );
    });
  });

  module('string sorting', function () {
    test('it sorts by ascending (default) `name` using string sorting', async function (assert) {
      const result01 = createJsonApiMockRecord('id_01', 'target', {
        name: 'Result 01',
      });
      const result02 = createJsonApiMockRecord('id_02', 'target', {
        name: 'Result 02',
      });
      const result03 = createJsonApiMockRecord('id_03', 'target', {
        name: 'Result 03',
      });
      const result04 = createJsonApiMockRecord('id_04', 'target', {
        name: 'Result 04',
      });

      const shuffledResults = faker.helpers.shuffle([
        result01,
        result02,
        result03,
        result04,
      ]);
      const querySort = { attribute: 'name' };
      const schema = { attributes: new Map() };
      schema.attributes.set('name', { type: 'string' });
      const sortedResults = sortResults(shuffledResults, { querySort, schema });
      assert.deepEqual(
        sortedResults.map(({ attributes: { name } }) => name),
        ['Result 01', 'Result 02', 'Result 03', 'Result 04'],
      );
    });

    test('it sorts by ascending (default) `name` and `id` when `name` is not defined using string sorting', async function (assert) {
      const result01 = createJsonApiMockRecord('id_01', 'target', {
        name: 'Result 01',
      });
      const result02 = createJsonApiMockRecord('id_02', 'target', {});
      const result03 = createJsonApiMockRecord('id_03', 'target', {
        name: 'Result 03',
      });
      const result04 = createJsonApiMockRecord('id_04', 'target', {
        name: 'Result 04',
      });

      const shuffledResults = faker.helpers.shuffle([
        result01,
        result02,
        result03,
        result04,
      ]);
      const querySort = { attribute: 'name' };
      const schema = { attributes: new Map() };
      schema.attributes.set('name', { type: 'string' });
      const sortedResults = sortResults(shuffledResults, { querySort, schema });
      assert.deepEqual(
        sortedResults.map(({ attributes: { name } }) => name),
        [undefined, 'Result 01', 'Result 03', 'Result 04'],
      );
      assert.deepEqual(
        sortedResults.map(({ id }) => id),
        ['id_02', 'id_01', 'id_03', 'id_04'],
      );
    });

    test('it sorts by ascending then descending `name` using string sorting', async function (assert) {
      const result01 = createJsonApiMockRecord('id_01', 'target', {
        name: 'Result 01',
      });
      const result02 = createJsonApiMockRecord('id_02', 'target', {
        name: 'Result 02',
      });
      const result03 = createJsonApiMockRecord('id_03', 'target', {
        name: 'Result 03',
      });
      const result04 = createJsonApiMockRecord('id_04', 'target', {
        name: 'Result 04',
      });

      const shuffledResults = faker.helpers.shuffle([
        result01,
        result02,
        result03,
        result04,
      ]);
      const querySortAsc = { attribute: 'name', direction: 'asc' };
      const querySortDesc = { attribute: 'name', direction: 'desc' };
      const schema = { attributes: new Map() };
      schema.attributes.set('name', { type: 'string' });
      const sortedResultsAsc = sortResults(shuffledResults, {
        querySort: querySortAsc,
        schema,
      });
      const sortedResultsDesc = sortResults(shuffledResults, {
        querySort: querySortDesc,
        schema,
      });
      assert.deepEqual(
        sortedResultsAsc.map(({ attributes: { name } }) => name),
        ['Result 01', 'Result 02', 'Result 03', 'Result 04'],
      );
      assert.deepEqual(
        sortedResultsDesc.map(({ attributes: { name } }) => name),
        ['Result 04', 'Result 03', 'Result 02', 'Result 01'],
      );
    });
  });

  module('date sorting', function () {
    test('it sorts by ascending (default) `date` using date sorting', function (assert) {
      const result01 = createJsonApiMockRecord('id_01', 'target', {
        date: '2021',
      });
      const result02 = createJsonApiMockRecord('id_02', 'target', {
        date: '2022',
      });
      const result03 = createJsonApiMockRecord('id_03', 'target', {
        date: '2023',
      });
      const result04 = createJsonApiMockRecord('id_04', 'target', {
        date: '2024',
      });

      const shuffledResults = faker.helpers.shuffle([
        result01,
        result02,
        result03,
        result04,
      ]);
      const querySort = { attribute: 'date' };
      const schema = { attributes: new Map() };
      schema.attributes.set('date', { type: 'date' });

      const sortedResults = sortResults(shuffledResults, { querySort, schema });

      assert.deepEqual(
        sortedResults.map(({ attributes: { date } }) => date),
        ['2021', '2022', '2023', '2024'],
      );
    });

    test('it sorts by ascending then descending `date` using date sorting', function (assert) {
      const result01 = createJsonApiMockRecord('id_01', 'target', {
        date: '2021',
      });
      const result02 = createJsonApiMockRecord('id_02', 'target', {
        date: '2022',
      });
      const result03 = createJsonApiMockRecord('id_03', 'target', {
        date: '2023',
      });
      const result04 = createJsonApiMockRecord('id_04', 'target', {
        date: '2024',
      });

      const shuffledResults = faker.helpers.shuffle([
        result01,
        result02,
        result03,
        result04,
      ]);
      const querySortAsc = { attribute: 'date', direction: 'asc' };
      const querySortDesc = { attribute: 'date', direction: 'desc' };
      const schema = { attributes: new Map() };
      schema.attributes.set('date', { type: 'date' });

      const sortedResultsAsc = sortResults(shuffledResults, {
        querySort: querySortAsc,
        schema,
      });
      const sortedResultsDesc = sortResults(shuffledResults, {
        querySort: querySortDesc,
        schema,
      });

      assert.deepEqual(
        sortedResultsAsc.map(({ attributes: { date } }) => date),
        ['2021', '2022', '2023', '2024'],
      );
      assert.deepEqual(
        sortedResultsDesc.map(({ attributes: { date } }) => date),
        ['2024', '2023', '2022', '2021'],
      );
    });
  });

  module('number sorting', function () {
    test('it sorts by ascending (default) `sessions`', function (assert) {
      const result01 = createJsonApiMockRecord('id_01', 'target', {
        sessions: 10,
      });
      const result02 = createJsonApiMockRecord('id_01', 'target', {
        sessions: 200,
      });
      const result03 = createJsonApiMockRecord('id_01', 'target', {
        sessions: 3333,
      });
      const result04 = createJsonApiMockRecord('id_01', 'target', {
        sessions: 40444,
      });

      const shuffledResults = faker.helpers.shuffle([
        result01,
        result02,
        result03,
        result04,
      ]);
      const querySort = { attribute: 'sessions' };
      const schema = { attributes: new Map() };
      schema.attributes.set('sessions', { type: 'number' });

      const sortedResults = sortResults(shuffledResults, { querySort, schema });

      assert.deepEqual(
        sortedResults.map(({ attributes: { sessions } }) => sessions),
        [10, 200, 3333, 40444],
      );
    });

    test('it sorts by ascending then descending `sessions`', function (assert) {
      const result01 = createJsonApiMockRecord('id_01', 'target', {
        sessions: 10,
      });
      const result02 = createJsonApiMockRecord('id_01', 'target', {
        sessions: 200,
      });
      const result03 = createJsonApiMockRecord('id_01', 'target', {
        sessions: 3333,
      });
      const result04 = createJsonApiMockRecord('id_01', 'target', {
        sessions: 40444,
      });

      const shuffledResults = faker.helpers.shuffle([
        result01,
        result02,
        result03,
        result04,
      ]);
      const querySortAsc = { attribute: 'sessions', direction: 'asc' };
      const querySortDesc = { attribute: 'sessions', direction: 'desc' };
      const schema = { attributes: new Map() };
      schema.attributes.set('sessions', { type: 'number' });

      const sortedResultsAsc = sortResults(shuffledResults, {
        querySort: querySortAsc,
        schema,
      });
      const sortedResultsDesc = sortResults(shuffledResults, {
        querySort: querySortDesc,
        schema,
      });

      assert.deepEqual(
        sortedResultsAsc.map(({ attributes: { sessions } }) => sessions),
        [10, 200, 3333, 40444],
      );
      assert.deepEqual(
        sortedResultsDesc.map(({ attributes: { sessions } }) => sessions),
        [40444, 3333, 200, 10],
      );
    });
  });

  module('boolean sorting', function () {
    test('it sorts by ascending (default) `active`', function (assert) {
      const result01 = { attributes: { active: true } };
      const result02 = { attributes: { active: false } };
      const result03 = { attributes: { active: false } };
      const result04 = { attributes: { active: true } };
      const shuffledResults = faker.helpers.shuffle([
        result01,
        result02,
        result03,
        result04,
      ]);
      const querySort = { attribute: 'active' };
      const schema = { attributes: new Map() };
      schema.attributes.set('active', { type: 'boolean' });

      const sortedResults = sortResults(shuffledResults, { querySort, schema });

      assert.deepEqual(
        sortedResults.map(({ attributes: { active } }) => active),
        [false, false, true, true],
      );
    });

    test('it sorts by ascending then descending `active`', function (assert) {
      const result01 = { attributes: { active: true } };
      const result02 = { attributes: { active: false } };
      const result03 = { attributes: { active: false } };
      const result04 = { attributes: { active: true } };
      const shuffledResults = faker.helpers.shuffle([
        result01,
        result02,
        result03,
        result04,
      ]);
      const querySortAsc = { attribute: 'active', direction: 'asc' };
      const querySortDesc = { attribute: 'active', direction: 'desc' };
      const schema = { attributes: new Map() };
      schema.attributes.set('active', { type: 'boolean' });

      const sortedResultsAsc = sortResults(shuffledResults, {
        querySort: querySortAsc,
        schema,
      });
      const sortedResultsDesc = sortResults(shuffledResults, {
        querySort: querySortDesc,
        schema,
      });

      assert.deepEqual(
        sortedResultsAsc.map(({ attributes: { active } }) => active),
        [false, false, true, true],
      );

      assert.deepEqual(
        sortedResultsDesc.map(({ attributes: { active } }) => active),
        [true, true, false, false],
      );
    });
  });
});
