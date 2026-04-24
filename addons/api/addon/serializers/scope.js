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
    const method = snapshot?.adapterOptions?.method;

    if (policyId) {
      serialized = this.serializeWithStoragePolicy(snapshot, policyId);
    }

    if (method === 'set-alias-target-suffix') {
      serialized = this.serializeWithAliasSuffix(
        snapshot,
        snapshot.adapterOptions.alias_suffix,
      );
    }

    if (method === 'remove-alias-target-suffix') {
      serialized = { version: snapshot.attr('version') };
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

  /**
   * Returns a payload containing only version and alias_suffix,
   * used for the `set-alias-target-suffix` custom method.
   * @param {Snapshot} snapshot
   * @param {string} suffix
   * @return {object}
   */
  serializeWithAliasSuffix(snapshot, suffix) {
    return {
      version: snapshot.attr('version'),
      alias_suffix: suffix,
    };
  }
}
