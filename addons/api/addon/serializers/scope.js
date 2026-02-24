/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationSerializer from './application';

export default class ScopeSerializer extends ApplicationSerializer {
  // =methods

  serialize(snapshot) {
    let serialized = super.serialize(...arguments);
    const policyId = snapshot?.adapterOptions?.policyId;

    if (policyId) {
      serialized = this.serializeWithStoragePolicy(snapshot, policyId);
    }

    return serialized;
  }

  /**
   * Returns a payload containing only version and storage policy id,
   * rather than existing instances on the model.
   * @param {Snapshot} snapshot
   * @param {[string]} hostSetIDs
   * @return {object}
   */
  serializeWithStoragePolicy(snapshot, policyId) {
    return {
      version: snapshot.attr('version'),
      storage_policy_id: policyId,
    };
  }
}
