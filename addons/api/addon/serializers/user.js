/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationSerializer from './application';

export default class UserSerializer extends ApplicationSerializer {
  // =methods

  /**
   * If `adapterOptions.accountIDs` is set (to an array of user IDs),
   * then the payload is serialized via `serializewithAccounts`.
   * @override
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serialize(snapshot) {
    let serialized = super.serialize(...arguments);
    const accountIDs = snapshot?.adapterOptions?.accountIDs;
    if (accountIDs) {
      serialized = this.serializewithAccounts(snapshot, accountIDs);
    }
    return serialized;
  }

  /**
   * Returns a payload containing only the `account_ids` array (and version).
   * @param {Snapshot} snapshot
   * @param {[string]} account_ids
   * @return {object}
   */
  serializewithAccounts(snapshot, account_ids) {
    return {
      version: snapshot.attr('version'),
      account_ids,
    };
  }
}
