import { PWBWorker } from 'promise-worker-bi';
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import sharedServiceInit from './shared-service';
import {
  CLEAR_DB,
  CREATE_TABLES,
  DELETE_STATEMENT,
  INSERT_STATEMENTS,
} from './schema';

/** @type {import('@sqlite.org/sqlite-wasm').OpfsSAHPoolDatabase} */
let db;
/** @type {import('@sqlite.org/sqlite-wasm').SAHPoolUtil} */
let poolUtil;

// Maximum number of host parameters for SQLite prepared statements.
// See "Maximum Number Of Host Parameters In A Single SQL Statement" in
// https://www.sqlite.org/limits.html
const MAX_HOST_PARAMETERS = 32766;

const methods = {
  initializeSQLite: async () => {
    try {
      const sqlite3 = await sqlite3InitModule({
        print: console.log,
        printErr: console.error,
      });
      console.log(`SQLite Version: ${sqlite3?.version.libVersion}`);
      poolUtil = await sqlite3.installOpfsSAHPoolVfs();
      db = new poolUtil.OpfsSAHPoolDb('/boundary');
      db.exec(CREATE_TABLES);
    } catch (err) {
      console.error('Initialization error:', err.name, err.message);
    }
  },
  clearDatabase: async () => {
    db.exec(CLEAR_DB);
  },
  fetchResource: async ({ resource, args: { page, pageSize, select } }) => {
    // TODO: Create parser for sql queries and use prepared statement
    try {
      return db.exec({
        sql: `
          SELECT ${select ?? '*'}
          FROM ${resource}
          ${pageSize && page ? `LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}` : ''}`,
        rowMode: 'object',
      });
    } catch (err) {
      console.error('Fetch resource error:', err);
      throw err;
    }
  },
  insertResource: async ({ resource, items }) => {
    if (items.length === 0) {
      return [];
    }
    const insertStatementGenerator = INSERT_STATEMENTS[resource];

    if (!insertStatementGenerator) {
      throw new Error(`Insert statement for resource "${resource}" not found.`);
    }

    const numberOfParameters = items.reduce((acc, item) => {
      return acc + item.length;
    }, 0);

    // We want to use as many VALUES as part of the insert statement as it's quicker
    // than doing multiple inserts. If we have too many rows to insert, we'll manually
    // chunk them up to avoid hitting the maximum number of host parameters
    // and execute these separate insert statements in a transaction
    if (numberOfParameters > MAX_HOST_PARAMETERS) {
      const chunkSize = Math.floor(MAX_HOST_PARAMETERS / items[0].length);

      return db.transaction(() => {
        const results = [];
        for (let i = 0; i < items.length; i += chunkSize) {
          const chunk = items.slice(i, i + chunkSize);
          const result = db.exec({
            sql: insertStatementGenerator(chunk),
            bind: chunk.flat(),
            rowMode: 'object',
          });
          results.push(result);
        }
        return results;
      });
    }

    db.exec({
      sql: insertStatementGenerator(items),
      bind: items.flat(),
      rowMode: 'object',
    });
  },
  deleteResource: async ({ resource, ids }) => {
    if (ids.length === 0) {
      return [];
    }
    return db.exec({
      sql: DELETE_STATEMENT(resource, ids),
      bind: ids,
      rowMode: 'object',
    });
  },
};

const promiseWorker = new PWBWorker();
promiseWorker.register(async ({ method, payload }) => {
  await sharedService.status.ready;

  switch (method) {
    case 'initializeSQLite':
      {
        const isServiceProvider = await sharedService.status.isServiceProvider;
        if (isServiceProvider && !db) {
          await sharedService.proxy[method]();
        }
      }
      break;
    default: {
      return sharedService.proxy[method](payload);
    }
  }
});

const sharedService = sharedServiceInit('sqlite', methods);
