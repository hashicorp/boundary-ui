/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { PWBWorker } from 'promise-worker-bi';
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import sharedServiceInit from './utils/shared-service';
import {
  CLEAR_DB,
  CREATE_TABLES,
  DELETE_STATEMENT,
  INSERT_STATEMENTS,
} from './utils/schema';

/** @type {import('@sqlite.org/sqlite-wasm').OpfsSAHPoolDatabase} */
let db;
/** @type {import('@sqlite.org/sqlite-wasm').SAHPoolUtil} */
let poolUtil;
/** @type {import('@sqlite.org/sqlite-wasm').Sqlite3Static} */
let sqlite3;

const { promise: ready, resolve: readyResolve } = Promise.withResolvers();

// Maximum number of host parameters for SQLite prepared statements.
// See "Maximum Number Of Host Parameters In A Single SQL Statement" in
// https://www.sqlite.org/limits.html
const MAX_HOST_PARAMETERS = 32766;
const SCHEMA_VERSION = 1;

// Some browsers do not allow calling getDirectory in private browsing modes even
// if we're in a secure context. This will cause the SQLite setup to fail so we should
// check ahead of time to see if we're able to call the API.
let canCallGetDirectory;
try {
  canCallGetDirectory = Boolean(await navigator.storage.getDirectory());
} catch {
  canCallGetDirectory = false;
}

const isSecure = self.isSecureContext && canCallGetDirectory;

// Error code for sqlite corruption errors.
// See https://sqlite.org/rescode.html#corrupt
const SQLITE_CORRUPT = 11;

const methods = {
  initializeSQLite: async () => {
    sqlite3 = await sqlite3InitModule({
      print: console.log,
      printErr: console.error,
    });
    const dbName = await promiseWorker.postMessage({
      method: 'getDatabaseName',
    });

    function setupDb() {
      const [row] = db.exec('PRAGMA user_version;', { rowMode: 'object' });
      // Check if we're on a newer schema version and clear the database if so
      if (SCHEMA_VERSION > row.user_version) {
        db.exec(CLEAR_DB);
      }

      db.exec(CREATE_TABLES(SCHEMA_VERSION));
      // Force an analyze on initial connection
      db.exec('PRAGMA optimize=0x10002;');
    }

    // Instantiate an in memory DB if we're not in a secure context as OPFS is unavailable otherwise
    if (!isSecure) {
      db = new sqlite3.oo1.DB(':memory:');
      setupDb();
      return;
    }

    let done = false;
    while (!done) {
      try {
        poolUtil = await sqlite3.installOpfsSAHPoolVfs();
        db = new poolUtil.OpfsSAHPoolDb(dbName);

        setupDb();
        done = true;
      } catch (/** @type {import('@sqlite.org/sqlite-wasm').SQLite3Error} */ err) {
        // If we get a SQLite3Error and the pool is at capacity, we'll assume the error is
        // because we hit the cap so we add more capacity and see if that solves it.
        if (
          err.name === 'SQLite3Error' &&
          poolUtil.getCapacity() === poolUtil.getFileCount()
        ) {
          await poolUtil.addCapacity(1);

          // If we have more than 20 files, that might indicate a problem so let's just
          // remove the VFS and wipe all the client data across users and restart.
          if (poolUtil.getCapacity() > 20) {
            await poolUtil.removeVfs();
          }
        } else {
          console.error('SQLite initialization error:', err);

          // We might have gotten ourselves into a bad state which corrupted the DB so clear it out and retry
          if (err?.resultCode === SQLITE_CORRUPT) {
            poolUtil.unlink(`/${dbName}`);
          } else {
            throw err;
          }
        }
      }
    }
  },
  analyzeDatabase: () => {
    db.exec('PRAGMA optimize');
  },
  clearDatabase: () => {
    db.exec(CLEAR_DB);
    db.exec(CREATE_TABLES(SCHEMA_VERSION));
  },
  deleteDatabase: () => {
    if (!db) {
      throw new Error('No database was initialized');
    }

    const name = db.dbFilename();
    db.close();
    db = null;
    poolUtil.unlink(`/${name}`);
  },
  downloadDatabase: () => {
    return sqlite3.capi.sqlite3_js_db_export(db);
  },
  fetchResource: ({ sql, parameters = [] }) => {
    try {
      return db.exec({
        sql,
        bind: parameters,
        rowMode: 'object',
      });
    } catch (err) {
      // TODO: Add error handling to rest of methods and properly return the error back to caller
      console.error('Fetch resource error:', err, sql, parameters);
      throw err;
    }
  },
  insertResource: ({ resource, items, modelMapping }) => {
    if (items.length === 0) {
      return [];
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
            sql: INSERT_STATEMENTS(resource, chunk, modelMapping),
            bind: chunk.flat(),
            rowMode: 'object',
          });
          results.push(result);
        }
        return results;
      });
    }

    db.exec({
      sql: INSERT_STATEMENTS(resource, items, modelMapping),
      bind: items.flat(),
      rowMode: 'object',
    });
  },
  deleteResource: ({ resource, ids }) => {
    // Check if we have too many parameters for the deletion and chunk if so
    if (ids?.length > MAX_HOST_PARAMETERS) {
      return db.transaction(() => {
        const results = [];
        for (let i = 0; i < ids.length; i += MAX_HOST_PARAMETERS) {
          const chunk = ids.slice(i, i + MAX_HOST_PARAMETERS);
          const result = db.exec({
            sql: DELETE_STATEMENT(resource, chunk),
            bind: chunk,
            rowMode: 'object',
          });
          results.push(result);
        }
        return results;
      });
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
  if (!sharedService) {
    await ready;
    return methods[method](payload);
  }

  await sharedService.status.ready;
  return sharedService.proxy[method](payload);
});

const initializeOnProviderChange = async (isProvider) => {
  if (!isProvider) {
    return;
  }
  // Initialize the SQLite database when we become a provider
  await sharedService.proxy.initializeSQLite();
};

// Only use the shared service in a secure context as weblocks aren't available otherwise
let sharedService;
if (isSecure) {
  sharedService = sharedServiceInit(
    'sqlite',
    methods,
    initializeOnProviderChange,
  );
} else {
  // Production builds error out when using top level awaits so we'll just use an async IIFE
  (async () => {
    await methods.initializeSQLite();
    readyResolve();
  })();
}
