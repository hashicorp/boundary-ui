/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { PWBWorker } from 'promise-worker-bi';
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import sharedServiceInit from './utils/shared-service';

const methods = {
  initializeSQLite: async () => {
    try {
      const sqlite3 = await sqlite3InitModule({
        print: console.log,
        printErr: console.error,
      });
      console.log(`SQLite Version: ${sqlite3?.version.libVersion}`);
      const poolUtil = await sqlite3.installOpfsSAHPoolVfs();
      new poolUtil.OpfsSAHPoolDb('/boundary');
    } catch (err) {
      console.error('Initialization error:', err.name, err.message);
    }
  },
};

const promiseWorker = new PWBWorker();
promiseWorker.register(async ({ method, payload }) => {
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

const sharedService = sharedServiceInit(
  'sqlite',
  methods,
  initializeOnProviderChange,
);
