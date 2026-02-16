/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * This test helper can help set up and cleanup the database in your tests.
 *
 * ```js
 * import { setupSqlite } from 'api/test-support/helpers/sqlite';
 *
 * module('Acceptance | my test', function(hooks) {
 *  setupApplicationTest(hooks);
 *  setupSqlite(hooks);
 *
 *   // add your actual tests here
 * });
 * ```
 *
 * @param hooks
 */
export function setupSqlite(hooks) {
  hooks.beforeEach(async function () {
    const sqliteDb = this.owner.lookup('service:sqlite');
    await sqliteDb.setup(`test-sqlite-${uuidv4()}`);
  });

  hooks.afterEach(async function () {
    const sqliteDb = this.owner.lookup('service:sqlite');

    await sqliteDb.deleteDatabase();
  });
}

export default setupSqlite;
