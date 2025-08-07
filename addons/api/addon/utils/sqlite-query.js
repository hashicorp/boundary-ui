/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { modelMapping } from 'api/services/sqlite';
import { searchTables } from 'api/services/sqlite';
import { typeOf } from '@ember/utils';

/**
 * Takes a POJO representing a filter query and builds a SQL query.
 *
 * @example
 *   const filter = generateSQLExpressions(type, {
 *     search: generated',
 *     filters: {
 *       scope_id: {
 *         logicalOperator: 'and',
 *         values: [{ notEquals: 'scope1' }, { notEquals: 'scope2' }],
 *       },
 *     },
 *   });
 */
export function generateSQLExpressions(
  resource,
  query = {},
  { page, pageSize, select } = {},
) {
  let { search, filters, sort = {} } = query;
  const conditions = [];
  const parameters = [];

  addFilterConditions(filters, parameters, conditions);
  addSearchConditions(search, resource, parameters, conditions);

  const { attribute, customSort, direction } = sort;
  let orderByClause = '';

  if (customSort?.attributeMap) {
    // We have to check if the attribute is valid for the resource
    // as we can't use parameterized queries for ORDER BY
    const validAttributes = Object.keys(modelMapping[resource]);
    if (validAttributes.includes(attribute)) {
      let whenClauses = '';
      Object.keys(customSort.attributeMap).forEach((key) => {
        whenClauses += `WHEN '${key}' THEN '${customSort.attributeMap[key]}' `;
      });
      orderByClause = `ORDER BY CASE ${attribute} ${whenClauses}END ${direction === 'desc' ? 'DESC' : 'ASC'}`;
    }
  } else if (customSort?.attributes) {
    const validAttributes = Object.keys(modelMapping[resource]);
    if (validAttributes.includes(...customSort.attributes)) {
      const commaSeparatedVals = customSort.attributes.join(', ');
      orderByClause = `ORDER BY COALESCE(${commaSeparatedVals}) COLLATE NOCASE ${direction === 'desc' ? 'DESC' : 'ASC'}, COALESCE(${commaSeparatedVals}) ${direction === 'desc' ? 'DESC' : 'ASC'}`;
    }
  } else if (attribute) {
    const validAttributes = Object.keys(modelMapping[resource]);
    if (validAttributes.includes(attribute)) {
      orderByClause = `ORDER BY ${attribute} COLLATE NOCASE ${direction === 'desc' ? 'DESC' : 'ASC'}, ${attribute} ${direction === 'desc' ? 'DESC' : 'ASC'}`;
    }
  } else if (
    modelMapping[resource]?.created_time &&
    // Don't include any ordering for count statements
    !select?.some((str) => str.includes('count(*)'))
  ) {
    orderByClause = `ORDER BY created_time DESC`;
  }

  const whereClause = conditions.length ? `WHERE ${and(conditions)}` : '';

  const paginationClause = page && pageSize ? `LIMIT ? OFFSET ?` : '';
  if (paginationClause) {
    parameters.push(pageSize, (page - 1) * pageSize);
  }

  const selectClause = `SELECT ${select ? select.join(', ') : '*'} FROM "${resource}"`;

  return {
    // Replace any empty newlines or leading whitespace on each line to be consistent with formatting
    // This is mainly to help us read and test the generated SQL as it has no effect on the actual SQL execution.
    sql: `
      ${selectClause}
      ${whereClause}
      ${orderByClause}
      ${paginationClause}`
      .replace(/^\s+/gm, '')
      .trim(),
    parameters,
  };
}

function addFilterConditions(filters, parameters, conditions) {
  if (!filters) {
    return;
  }

  for (const [key, filterArrayOrObject] of Object.entries(filters)) {
    // Filter can be an array or an object with a `values` property
    const filterValueArray = Array.isArray(filterArrayOrObject)
      ? filterArrayOrObject
      : filterArrayOrObject.values;

    if (!filterValueArray || !filterValueArray.length) {
      continue;
    }

    const filterConditions = filterValueArray
      .filter((f) => f)
      .map((filterObjValue) => {
        let [operation, value] = Object.entries(filterObjValue)[0];

        // SQLite needs to be working with ISO strings
        if (typeOf(value) === 'date') {
          value = value.toISOString();
        }

        // Handle LIKE operator separately
        if (operation === 'contains') {
          parameters.push(`%${value}%`);
        } else {
          parameters.push(value);
        }

        return `${key}${OPERATORS[operation]}`;
      });

    const { logicalOperator } = filterArrayOrObject;
    // Default to `or` if we don't have a logical operator
    conditions.push(
      parenthetical(
        logicalOperator === 'and'
          ? and(filterConditions)
          : or(filterConditions),
      ),
    );
  }
}

function addSearchConditions(search, resource, parameters, conditions) {
  if (!search) {
    return;
  }

  if (searchTables.has(resource)) {
    // Use the special prefix indicator "*" for full-text search
    parameters.push(`"${search}"*`);
    // Use a subquery to match against the FTS table with rowids as SQLite is
    // much more efficient with FTS queries when using rowids or MATCH (or both).
    // We could have also used a join here but a subquery is simpler.
    conditions.push(
      `rowid IN (SELECT rowid FROM ${resource}_fts WHERE ${resource}_fts MATCH ?)`,
    );
    return;
  }

  const fields = Object.keys(modelMapping[resource]);
  const searchConditions = parenthetical(
    or(
      fields.map((field) => {
        parameters.push(`%${search}%`);
        return `${field}${OPERATORS['contains']}`;
      }),
    ),
  );
  conditions.push(searchConditions);
}

// Comparison Operators
const OPERATORS = {
  equals: ' = ?',
  notEquals: ' != ?',
  gt: ' > ?',
  gte: ' >= ?',
  lt: ' < ?',
  lte: ' <= ?',
  contains: ' LIKE ?',
};

// Logical Operators
const and = (clauses) => clauses.join(' AND ');
const or = (clauses) => clauses.join(' OR ');
const parenthetical = (expression) => (expression ? `(${expression})` : '');
