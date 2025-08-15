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

      const querySort = { attributes: ['name'] };

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
        attributes: ['name'],
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
      const querySort = { attributes: ['id'] };
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
      const querySort = { attributes: ['name'] };
      const schema = { attributes: new Map() };
      schema.attributes.set('name', { type: 'string' });
      const sortedResults = sortResults(shuffledResults, { querySort, schema });
      assert.deepEqual(
        sortedResults.map(({ attributes: { name } }) => name),
        ['Result 01', 'Result 02', 'Result 03', 'Result 04'],
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
      const querySortAsc = { attributes: ['name'], direction: 'asc' };
      const querySortDesc = { attributes: ['name'], direction: 'desc' };
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

    test('it sorts by ascending then descending `name` using string sorting with Upper case preference', async function (assert) {
      const result01 = createJsonApiMockRecord('id_01', 'target', {
        name: 'orange',
      });
      const result02 = createJsonApiMockRecord('id_02', 'target', {
        name: 'Orange',
      });
      const result03 = createJsonApiMockRecord('id_03', 'target', {
        name: 'banana',
      });
      const result04 = createJsonApiMockRecord('id_04', 'target', {
        name: 'Banana',
      });
      const result05 = createJsonApiMockRecord('id_04', 'target', {
        name: 'apple',
      });
      const shuffledResults = faker.helpers.shuffle([
        result01,
        result02,
        result03,
        result04,
        result05,
      ]);
      const querySortAsc = { attributes: ['name'], direction: 'asc' };
      const querySortDesc = { attributes: ['name'], direction: 'desc' };
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
        ['apple', 'Banana', 'banana', 'Orange', 'orange'],
      );
      assert.deepEqual(
        sortedResultsDesc.map(({ attributes: { name } }) => name),
        ['orange', 'Orange', 'banana', 'Banana', 'apple'],
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
      const querySort = { attributes: ['date'] };
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
      const querySortAsc = { attributes: ['date'], direction: 'asc' };
      const querySortDesc = { attributes: ['date'], direction: 'desc' };
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
      const querySort = { attributes: ['sessions'] };
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
      const querySortAsc = { attributes: ['sessions'], direction: 'asc' };
      const querySortDesc = { attributes: ['sessions'], direction: 'desc' };
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
      const querySort = { attributes: ['active'] };
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
      const querySortAsc = { attributes: ['active'], direction: 'asc' };
      const querySortDesc = { attributes: ['active'], direction: 'desc' };
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

  module('custom function sorting', function () {
    const result01 = createJsonApiMockRecord('id_01', 'target', {
      name: 'target1',
    });
    const result02 = createJsonApiMockRecord('id_02', 'target', {
      name: 'target2',
    });
    const result03 = createJsonApiMockRecord('id_03', 'target', {
      name: 'target3',
    });
    const result04 = createJsonApiMockRecord('id_04', 'target', {
      name: 'target4',
    });

    const nameMap = {
      target3: 'Alpha',
      target4: 'Beta',
      target1: 'Delta',
      target2: 'Epsilon',
    };

    const schema = { attributes: new Map() };

    test.each(
      'it sorts by `name` using custom sorting function',
      {
        'ascending (default)': {
          querySort: {
            attributes: ['name'],
            customSort: { attributeMap: nameMap },
          },
          expectedResults: ['target3', 'target4', 'target1', 'target2'],
        },
        descending: {
          querySort: {
            attributes: ['name'],
            customSort: { attributeMap: nameMap },
            direction: 'desc',
          },
          expectedResults: ['target2', 'target1', 'target4', 'target3'],
        },
        ascending: {
          querySort: {
            attributes: ['name'],
            customSort: { attributeMap: nameMap },
            direction: 'asc',
          },
          expectedResults: ['target3', 'target4', 'target1', 'target2'],
        },
      },
      function (assert, input) {
        const shuffledResults = faker.helpers.shuffle([
          result01,
          result02,
          result03,
          result04,
        ]);
        schema.attributes.set('name', { type: 'string' });
        const sortedResults = sortResults(shuffledResults, {
          querySort: input.querySort,
          schema,
        });

        assert.deepEqual(
          sortedResults.map(({ attributes: { name } }) => name),
          input.expectedResults,
        );
      },
    );
  });
});
