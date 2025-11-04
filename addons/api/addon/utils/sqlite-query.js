/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { modelMapping } from 'api/services/sqlite';
import { typeOf } from '@ember/utils';
import { underscore } from '@ember/string';
import { assert } from '@ember/debug';

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
  const tableName = underscore(resource);
  const joins = [];

  addFilterConditions({ filters, parameters, conditions, joins, tableName });
  addSearchConditions({ search, resource, tableName, parameters, conditions });

  const selectClause = constructSelectClause(select, tableName);
  const joinClause = constructJoinClause(joins);
  const orderByClause = constructOrderByClause(resource, tableName, sort);
  const whereClause = conditions.length ? `WHERE ${and(conditions)}` : '';

  const paginationClause = page && pageSize ? `LIMIT ? OFFSET ?` : '';
  if (paginationClause) {
    parameters.push(pageSize, (page - 1) * pageSize);
  }

  return {
    // Replace any empty newlines or leading whitespace on each line to be consistent with formatting
    // This is mainly to help us read and test the generated SQL as it has no effect on the actual SQL execution.
    sql: `
      ${selectClause}
      ${joinClause}
      ${whereClause}
      ${orderByClause}
      ${paginationClause}`
      .replace(/^\s+/gm, '')
      .trim(),
    parameters,
  };
}

function addFilterConditions({
  filters,
  parameters,
  conditions,
  joins,
  tableName,
}) {
  if (!filters) {
    return;
  }

  for (const [key, filterArrayOrObject] of Object.entries(filters)) {
    // Filter can be an array or an object with a `values` property
    const filterValueArray = Array.isArray(filterArrayOrObject)
      ? filterArrayOrObject
      : filterArrayOrObject.values;

    if (!filterValueArray || !filterValueArray.length || key === 'joins') {
      continue;
    }

    // When attribute conditions are a series of equals/notEquals
    // replace with in/notIn to avoid hitting the sqlite maximum
    // expression tree depth.
    const firstOperator = Object.keys(filterValueArray[0])[0];
    const allOperatorsEqual = filterValueArray
      .flatMap((item) => Object.keys(item))
      .every((op) => op === firstOperator);
    if (
      filterValueArray.length > 1 &&
      (firstOperator === 'equals' || firstOperator === 'notEquals') &&
      allOperatorsEqual
    ) {
      const operation = firstOperator === 'equals' ? 'in' : 'notIn';
      const nullOperator =
        firstOperator === 'equals' ? 'IS NULL' : 'IS NOT NULL';
      const values = filterValueArray
        .filter(
          (filterObjValue) =>
            filterObjValue && Object.values(filterObjValue)[0] !== null,
        )
        .map((filterObjValue) => {
          let value = Object.values(filterObjValue)[0];
          if (typeOf(value) === 'date') {
            value = value.toISOString();
          }
          parameters.push(value);
          return value;
        });

      // Add a check for null values as an IN clause will mistakenly use `=` for null values.
      // We'll add an extra OR clause to handle nulls separately.
      const isNullValue = filterValueArray.some(
        (filterObjValue) => Object.values(filterObjValue)[0] === null,
      );

      const filterCondition = `"${tableName}".${key}${OPERATORS[operation](values)}${isNullValue ? ` OR "${tableName}".${key} ${nullOperator}` : ''}`;
      conditions.push(parenthetical(filterCondition));
      continue;
    }

    const filterConditions = filterValueArray
      .filter((f) => f)
      .map((filterObjValue) => {
        let [operation, value] = Object.entries(filterObjValue)[0];

        // Handle null values: convert equals/notEquals to IS NULL or IS NOT NULL
        if (value === null) {
          if (operation === 'equals') {
            return `"${tableName}".${key} IS NULL`;
          }
          if (operation === 'notEquals') {
            return `"${tableName}".${key} IS NOT NULL`;
          }
        }

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

        return `"${tableName}".${key}${OPERATORS[operation]}`;
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

  if (filters.joins?.length > 0) {
    const tableNameIndex = {};

    filters.joins.forEach((join) => {
      const {
        resource,
        query,
        joinFrom = 'id',
        joinOn,
        joinType = 'INNER',
      } = join;
      const joinTableName = underscore(resource);
      tableNameIndex[resource] ??= 1;
      // Alias in the possible scenario we join the same table more than once
      const alias = `${joinTableName}${tableNameIndex[resource]}`;

      joins.push({
        type: joinType,
        table: joinTableName,
        alias,
        condition: `"${tableName}".${joinFrom} = ${alias}.${joinOn}`,
      });

      // Add the conditions from the join query
      if (query?.filters) {
        addFilterConditions({
          filters: query.filters,
          parameters,
          conditions,
          tableName: alias,
        });
      }

      tableNameIndex[resource]++;
    });
  }
}

function addSearchConditions({
  search,
  resource,
  tableName,
  parameters,
  conditions,
}) {
  if (!search || !modelMapping[resource]) {
    return;
  }

  // Use the special prefix indicator "*" for full-text search
  if (typeOf(search) === 'object') {
    if (!search?.text) {
      return;
    }

    parameters.push(
      or(search.fields.map((field) => `${field}:"${search.text}"*`)),
    );
  } else {
    parameters.push(`"${search}"*`);
  }

  // Use a subquery to match against the FTS table with rowids as SQLite is
  // much more efficient with FTS queries when using rowids or MATCH (or both).
  // We could have also used a join here but a subquery is simpler.
  conditions.push(
    `"${tableName}".rowid IN (SELECT rowid FROM ${tableName}_fts WHERE ${tableName}_fts MATCH ?)`,
  );
}

function constructSelectClause(select = [{ field: '*' }], tableName) {
  const distinctColumns = select.filter(({ isDistinct }) => isDistinct);
  const nonDistinctColumns = select.filter(({ isDistinct }) => !isDistinct);

  const buildColumnExpression = ({ field, isCount, alias, isDistinct }) => {
    let column = field === '*' ? field : `"${tableName}".${field}`;

    // If there's just distinct with nothing else, this will be handled separately
    // and we will just return the column back as is
    if (isCount && isDistinct) {
      column = `count(DISTINCT ${column})`;
    } else if (isCount) {
      column = `count(${column})`;
    }

    if (alias) {
      column = `${column} as ${alias}`;
    }

    return column;
  };

  let selectColumns;

  if (distinctColumns.length > 0) {
    // Check if any columns also have COUNT (or other aggregate function in the future)
    const hasAggregateDistinct = distinctColumns.some((col) => col.isCount);

    if (hasAggregateDistinct) {
      selectColumns = distinctColumns.map(buildColumnExpression).join(', ');

      // Add back in the non distinct columns
      if (nonDistinctColumns.length > 0) {
        const regularPart = nonDistinctColumns
          .map(buildColumnExpression)
          .join(', ');
        selectColumns = `${selectColumns}, ${regularPart}`;
      }
    } else {
      assert(
        'Can not combine non-distincts with multi column distincts',
        nonDistinctColumns.length === 0,
      );

      // Only do multi column DISTINCT with no aggregate functions
      selectColumns = `DISTINCT ${distinctColumns.map(buildColumnExpression).join(', ')}`;
    }
  } else {
    selectColumns = select.map(buildColumnExpression).join(', ');
  }

  return `SELECT ${selectColumns} FROM "${tableName}"`;
}

function constructJoinClause(joins) {
  if (!joins || joins.length === 0) {
    return '';
  }

  return joins
    .map(
      ({ type, table, alias, condition }) =>
        `${type} JOIN "${table}" ${alias} ON ${condition}`,
    )
    .join(' ');
}

function constructOrderByClause(resource, tableName, sort) {
  const defaultOrderByClause = `ORDER BY "${tableName}".created_time DESC`;

  const { attributes, customSort, direction, isCoalesced } = sort;
  const sortDirection = direction === 'desc' ? 'DESC' : 'ASC';
  const attributesWithTableName = attributes?.map(
    (attribute) => `"${tableName}".${attribute}`,
  );

  // We have to check if the attributes are valid for the resource
  // as we can't use parameterized queries for ORDER BY
  const validAttributes = Object.keys(modelMapping[resource] ?? {});
  if (attributes?.some((attr) => !validAttributes.includes(attr))) {
    return modelMapping[resource]?.created_time ? defaultOrderByClause : '';
  }

  if (customSort?.attributeMap) {
    const whenClauses = Object.keys(customSort.attributeMap).reduce(
      (acc, key) => {
        return acc + `WHEN '${key}' THEN '${customSort.attributeMap[key]}' `;
      },
      '',
    );
    return `ORDER BY CASE ${attributesWithTableName.join(', ')} ${whenClauses}END ${sortDirection}`;
  } else if (attributes?.length > 0) {
    const commaSeparatedVals = attributesWithTableName.join(', ');

    // In places where `collate nocase` is used, it is to ensure case is ignored on the initial sort.
    // Then, a sort on the same condition is performed to ensure upper-case strings are given preference in a tie.
    if (isCoalesced) {
      return `ORDER BY COALESCE(${commaSeparatedVals}) COLLATE NOCASE ${sortDirection}, COALESCE(${commaSeparatedVals}) ${sortDirection}`;
    }

    const attributesWithNoCollate = attributes
      .map((attr) => `"${tableName}".${attr} COLLATE NOCASE ${sortDirection}`)
      .join(', ');
    const attributesWithDirection = attributes
      .map((attr) => `"${tableName}".${attr} ${sortDirection}`)
      .join(', ');
    return `ORDER BY ${attributesWithNoCollate}, ${attributesWithDirection}`;
  } else if (modelMapping[resource]?.created_time) {
    return defaultOrderByClause;
  } else {
    return '';
  }
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
  in: (values) => ` IN (${values.map(() => '?').join(', ')})`,
  notIn: (values) => ` NOT IN (${values.map(() => '?').join(', ')})`,
};

// Logical Operators
const and = (clauses) => clauses.join(' AND ');
const or = (clauses) => clauses.join(' OR ');
const parenthetical = (expression) => (expression ? `(${expression})` : '');
