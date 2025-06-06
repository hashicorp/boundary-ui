import { PWBWorker } from 'promise-worker-bi';
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import sharedServiceInit from './shared-service';

let db;

const methods = {
  initializeSQLite: async () => {
    try {
      const sqlite3 = await sqlite3InitModule({
        print: console.log,
        printErr: console.error,
      });
      console.log(`SQLite Version: ${sqlite3?.version.libVersion}`);
      const poolUtil = await sqlite3.installOpfsSAHPoolVfs();
      db = new poolUtil.OpfsSAHPoolDb('/boundary');
    } catch (err) {
      console.error('Initialization error:', err.name, err.message);
    }
  },
};

const promiseWorker = new PWBWorker();
promiseWorker.register(async ({ method, payload }) => {
  switch (method) {
    case 'initializeSQLite':
      {
        await sharedService.status.ready;
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
