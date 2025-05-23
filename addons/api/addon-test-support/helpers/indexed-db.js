/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

/**
 * This test helper can help set up and cleanup the database in your tests.
 *
 * ```js
 * import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
 *
 * module('Acceptance | my test', function(hooks) {
 *  setupApplicationTest(hooks);
 *  setupIndexedDb(hooks);
 *
 *   // add your actual tests here
 * });
 * ```
 *
 * @param hooks
 */
export function setupIndexedDb(hooks) {
  hooks.beforeEach(async function () {
    const indexedDb = this.owner.lookup('service:indexed-db');
    await indexedDb.setup(`test-indexed-db-${Date.now()}`);
  });

  hooks.afterEach(async function () {
    const indexedDb = this.owner.lookup('service:indexed-db');

    await indexedDb.db.delete();
  });
}

export default setupIndexedDb;
