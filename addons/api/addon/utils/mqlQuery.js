/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

/**
 * Takes a POJO representing a filter query and converts it to an
 * MQL expression string which is understood by the client daemon.
 *
 * @example
 *   const filter = generateMQLFilterExpression({
 *     name: { contains: 'search text' },
 *     scope: [{ equals: 'scope1'}, { equals: 'scope2' }],
 *   });
 *
 *   // (name % "search text") and (scope = "scope1" or scope = "scope2")
 */
export function generateMQLFilterExpression(filterObj) {
  if (!filterObj) {
    return null;
  }

  const expressions = Object.entries(filterObj)
    .map(([key, filterObjValue]) => {
      const filterValueArray = Array.isArray(filterObjValue)
        ? filterObjValue
        : filterObjValue.values;

      let clauses;
      const filterValues = filterValueArray.map((filterObjValue) => {
        if (!filterObjValue) {
          return null;
        }

        const [operation, value] = Object.entries(filterObjValue)[0];

        switch (operation) {
          case 'contains':
            return contains(key, value);
          case 'gt':
            return gt(key, value);
          case 'gte':
            return gte(key, value);
          case 'lt':
            return lt(key, value);
          case 'lte':
            return lte(key, value);
          case 'notEquals':
            return notEquals(key, value);
          default:
            return equals(key, value);
        }
      });

      // Default to `or` if we don't have a logical operator
      const { logicalOperator } = filterObjValue;
      if (logicalOperator === 'and') {
        clauses = and(filterValues);
      } else {
        clauses = or(filterValues);
      }

      return parenthetical(clauses);
    })
    .filter((item) => item);
  return and(expressions);
}

/**
 * Takes a POJO representing a search query and converts it to an
 * MQL expression string which is understood by the client daemon.
 *
 * @example
 *   const search = generateMQLSearchExpression({
 *     text: 'search',
 *     fields: ['id', 'name', 'description']
 *   });
 *
 *   // (id % 'search' or name % 'search' or description % 'search')
 */
export function generateMQLSearchExpression(searchObj) {
  if (!searchObj) {
    return null;
  }

  const { text, fields } = searchObj;

  return parenthetical(
    or(fields.map((field) => contains(field, text)).filter((item) => item)),
  );
}

/**
 * Generates the MQL expression when a user passes in both search and filters.
 */
export function generateMQLExpression(obj) {
  const { search, filters } = obj;

  const expressions = [
    generateMQLSearchExpression(search),
    generateMQLFilterExpression(filters),
  ].filter((item) => item);

  return and(expressions);
}

const isEmpty = (input) =>
  input === null || input === undefined || input === '';

// Escape any double quotes or backslashes
const sanitize = (input) => input?.replace(/(["\\])/g, '\\$1');

// Comparison Operators
const equals = (key, value) =>
  !isEmpty(value) ? `${key} = "${sanitize(value)}"` : null;

const notEquals = (key, value) =>
  !isEmpty(value) ? `${key} != "${sanitize(value)}"` : null;

const contains = (key, value) =>
  !isEmpty(value) ? `${key} % "${sanitize(value)}"` : null;

const gt = (key, value) =>
  !isEmpty(value) ? `${key} > "${sanitize(value)}"` : null;

const gte = (key, value) =>
  !isEmpty(value) ? `${key} >= "${sanitize(value)}"` : null;

const lt = (key, value) =>
  !isEmpty(value) ? `${key} < "${sanitize(value)}"` : null;

const lte = (key, value) =>
  !isEmpty(value) ? `${key} <= "${sanitize(value)}"` : null;

// Logical Operators
const and = (clauses) => clauses.join(' and ');

const or = (clauses) => clauses.join(' or ');

const parenthetical = (expression) => (expression ? `(${expression})` : null);
