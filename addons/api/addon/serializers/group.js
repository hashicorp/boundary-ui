/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationSerializer from './application';

export default class GroupSerializer extends ApplicationSerializer {
  // =methods

  /**
   * If `adapterOptions.memberIDs` is set (to an array of user IDs),
   * then the payload is serialized via `serializewithMembers`.
   * @override
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serialize(snapshot) {
    let serialized = super.serialize(...arguments);
    const memberIDs = snapshot?.adapterOptions?.memberIDs;
    if (memberIDs) serialized = this.serializewithMembers(snapshot, memberIDs);
    return serialized;
  }

  /**
   * Returns a payload containing only the `member_ids` array (and version).
   * @param {Snapshot} snapshot
   * @param {[string]} memberIDs
   * @return {object}
   */
  serializewithMembers(snapshot, memberIDs) {
    return {
      version: snapshot.attr('version'),
      member_ids: memberIDs,
    };
  }
}
