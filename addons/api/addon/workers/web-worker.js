/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { PWBWorker } from 'promise-worker-bi';
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

const promiseWorker = new PWBWorker();
promiseWorker.register((message) => {
  console.log(`Received from main: ${message}`);
});

const initializeSQLite = async () => {
  try {
    const sqlite3 = await sqlite3InitModule({
      print: console.log,
      printErr: console.error,
    });
    console.log(`SQLite Version: ${sqlite3?.version.libVersion}`);
    const poolUtil = await sqlite3.installOpfsSAHPoolVfs();
    const db = new poolUtil.OpfsSAHPoolDb('/boundary');
    console.log(db);
  } catch (err) {
    console.error('Initialization error:', err.name, err.message);
  }
};

(async () => {
  await initializeSQLite();
})();
