import { modelMapping } from 'api/services/sqlite-db';
import {
  DummyDriver,
  Kysely,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
} from 'kysely';

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
  let { search, filters } = query;
  const conditions = [];
  const parameters = [];

  addFilterConditions(filters, parameters, conditions);
  addSearchConditions(search, resource, parameters, conditions);

  const whereClause = conditions.length ? `WHERE ${and(conditions)}` : '';

  const paginationClause = page && pageSize ? `LIMIT ? OFFSET ?` : '';
  if (paginationClause) {
    parameters.push(pageSize, (page - 1) * pageSize);
  }

  const selectClause = `SELECT ${select ? select.join(', ') : '*'} FROM ${resource}`;

  return {
    sql: `${selectClause} ${whereClause} ${paginationClause}`.trim(),
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
        const [operation, value] = Object.entries(filterObjValue)[0];

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
  equals: ' = ? ',
  notEquals: ' != ? ',
  gt: ' > ? ',
  gte: ' >= ? ',
  lt: ' < ? ',
  lte: ' <= ? ',
  contains: ' LIKE ? ',
};

// Logical Operators
const and = (clauses) => clauses.join(' AND ');
const or = (clauses) => clauses.join(' OR ');
const parenthetical = (expression) => (expression ? `(${expression})` : '');

export function generateSQLExpressionsKysely(
  resource,
  query = {},
  { page, pageSize, select } = {},
) {
  let { search } = query;
  const db = new Kysely({
    dialect: {
      createAdapter: () => new SqliteAdapter(),
      createDriver: () => new DummyDriver(),
      createIntrospector: (db) => new SqliteIntrospector(db),
      createQueryCompiler: () => new SqliteQueryCompiler(),
    },
  });

  let queryBuilder = db.selectFrom(resource);

  if (select?.includes('count')) {
    queryBuilder = queryBuilder.select(db.fn.countAll().as('total'));
  } else if (select) {
    queryBuilder = queryBuilder.select(select);
  } else {
    queryBuilder = queryBuilder.selectAll();
  }

  if (search) {
    queryBuilder = queryBuilder.where((eb) =>
      eb.or(
        Object.keys(modelMapping[resource]).map((field) =>
          eb(field, 'like', `%${search}%`),
        ),
      ),
    );
  }

  if (page && pageSize) {
    queryBuilder = queryBuilder.limit(pageSize).offset((page - 1) * pageSize);
  }

  return queryBuilder.compile();
}
