/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { get } from '@ember/object';
import { modelIndexes } from '../services/indexed-db';

/**
 * Takes a POJO representing a filter query and builds a query to
 * query indexedDb with. Note that the first filter is important as that
 * will use the actual index in indexedDb while any subsequent ones will be less efficient.
 *
 * @example
 *   const filter = queryIndexedDb(indexedDb, type, {
 *     search: generated',
 *     filters: {
 *       scope_id: {
 *         logicalOperator: 'and',
 *         values: [{ notEquals: 'scope1' }, { notEquals: 'scope2' }],
 *       },
 *     },
 *   });
 */
export async function queryIndexedDb(indexedDb, resource, query) {
  let { search, filters = {} } = query ?? {};
  let filterCollection = indexedDb[resource];

  search = getSearchObject(search, resource);
  filters = cleanObject(filters);

  if (Object.keys(filters).length) {
    // Remove the first item to use as the initial collection and then reduce the remaining ones
    const entries = Object.entries(filters);
    const [firstKey, firstFilterArrayOrObject] = entries.shift();

    filterCollection = await entries.reduce(
      async (currCollection, [key, filterArrayOrObject]) => {
        // Grab the results from the set of one filters to be `AND` together with the rest of the filters
        const filterResults = await buildInitialWhereClause({
          table: indexedDb[resource],
          key,
          filterArrayOrObject,
        }).primaryKeys();
        const resultIdsSet = new Set(filterResults);

        return (await currCollection).and((record) => {
          return resultIdsSet.has(record.id);
        });
      },
      buildInitialWhereClause({
        key: firstKey,
        table: indexedDb[resource],
        filterArrayOrObject: firstFilterArrayOrObject,
      }),
    );
  }

  if (search) {
    const { text, fields } = search;

    filterCollection = filterCollection.filter((record) =>
      fields
        .map((key) => get(record, key))
        .some((element) => {
          if (typeof element === 'string') {
            return element?.toLowerCase().includes(text?.toLowerCase());
          }
        }),
    );
  }

  // filterCollection can be Dexie Table or a Dexie Collection.
  // This is an important detail you need to keep in mind when working on it.
  return filterCollection.toArray();
}

const buildInitialWhereClause = ({ filterArrayOrObject, table, key }) => {
  const filterValueArray = Array.isArray(filterArrayOrObject)
    ? filterArrayOrObject
    : filterArrayOrObject.values;

  const { logicalOperator } = filterArrayOrObject;

  // Short circuit if all the filter types were equals or notEquals since indexedDb
  // can more efficiently query if we pass all values at once
  const checkAllFilterType = (type) =>
    filterValueArray.every((obj) => Object.keys(obj)[0] === type);
  if (checkAllFilterType('equals')) {
    return table
      .where(getKey(key))
      .anyOf(filterValueArray.map((obj) => obj['equals']));
  }
  if (checkAllFilterType('notEquals')) {
    return table
      .where(getKey(key))
      .noneOf(filterValueArray.map((obj) => obj['notEquals']));
  }

  // Remove the first item to use as the initial where clause and then reduce the remaining ones
  const [firstOperation, firstFilterValue] = Object.entries(
    filterValueArray[0],
  )[0];

  // Not all are filters are equals or notEquals,
  // manually build the initial where clause and resulting collections
  return filterValueArray.slice(1).reduce(
    (result, currObj) => {
      const [operation, value] = Object.entries(currObj)[0];

      return buildIndexedDbCollection({
        key: getKey(key),
        value,
        collection: result,
        operation,
        logicalOperator,
      });
    },
    buildIndexedDbWhere({
      table,
      key: getKey(key),
      operation: firstOperation,
      value: firstFilterValue,
    }),
  );
};

/**
 * Builds the initial where clause for indexed DB to filter on. Note that this makes
 * the first filter important as that will do the real filtering from indexed DB while
 * any subsequent filter has to be done in memory.
 */
const buildIndexedDbWhere = ({ table, key, value, operation }) => {
  const baseWhereClause = table.where(key);
  switch (operation) {
    case 'contains':
      // We return an error due to not being able to support contains on first filter due to performance.
      throw new Error('Contains is not supported as the first filter.');
    case 'gt':
      return baseWhereClause.above(value);
    case 'gte':
      return baseWhereClause.aboveOrEqual(value);
    case 'lt':
      return baseWhereClause.below(value);
    case 'lte':
      return baseWhereClause.belowOrEqual(value);
    case 'notEquals':
      return baseWhereClause.notEqual(value);
    default:
      return baseWhereClause.equals(value);
  }
};

/**
 * Continues building the queries for indexed DB to filter on. Note that these are not true
 * indexed DB queries and in fact just standard JS filters for logical "and" queries and parallel queries
 * to indexed DB for logical "or" queries that get deduped.
 */
const buildIndexedDbCollection = ({
  key,
  value,
  collection,
  operation,
  logicalOperator,
}) => {
  if (logicalOperator === 'and') {
    switch (operation) {
      case 'contains':
        return collection.and((record) => get(record, key)?.includes(value));
      case 'gt':
        return collection.and((record) => get(record, key) > value);
      case 'gte':
        return collection.and((record) => get(record, key) >= value);
      case 'lt':
        return collection.and((record) => get(record, key) < value);
      case 'lte':
        return collection.and((record) => get(record, key) <= value);
      case 'notEquals':
        return collection.and((record) => get(record, key) !== value);
      default:
        return collection.and((record) => get(record, key) === value);
    }
  }

  switch (operation) {
    case 'contains':
      // We return an error due to not being able to support contains on this filter due to performance.
      throw new Error(
        'Contains is not supported as a filter option with "or" operator.',
      );
    case 'gt':
      return collection.or(key).above(value);
    case 'gte':
      return collection.or(key).aboveOrEqual(value);
    case 'lt':
      return collection.or(key).below(value);
    case 'lte':
      return collection.or(key).belowOrEqual(value);
    case 'notEquals':
      return collection.or(key).notEqual(value);
    default:
      return collection.or(key).equals(value);
  }
};

/**
 * Translates the fields passed in from the UI for resources to the keys indexed DB knows them as.
 * Usually it's the path of the actual normalized model.
 */
const getKey = (key) => {
  switch (key) {
    case 'scope_id':
      return `attributes.scope.${key}`;
    case 'id':
      return key;
    default:
      return `attributes.${key}`;
  }
};

/**
 * Cleans the object to remove any keys that have a value of an empty array. This makes
 * it easier so we don't have to worry about empty arrays getting queried in indexed db.
 */
const cleanObject = (obj) => {
  if (!obj) {
    return {};
  }

  return Object.entries(obj).reduce((result, [key, value]) => {
    if (Array.isArray(value)) {
      if (value.length > 0) {
        result[key] = value;
      }
    } else if (value.values.length > 0) {
      result[key] = value;
    }

    return result;
  }, {});
};

/**
 * Makes the search object that is expected when a user searches. Uses
 * the indexes we setup in indexed db.
 */
const getSearchObject = (text, resource) => {
  if (!text) {
    return null;
  }

  return {
    text,
    fields: modelIndexes[resource]
      .split(', ')
      .map((index) => index.replace('&', '')),
  };
};
