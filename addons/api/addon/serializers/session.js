/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationSerializer from './application';

export default class SessionSerializer extends ApplicationSerializer {
  // =methods

  /**
   * If `adapterOptions.method` is `cancel`, the serialization should
   * include the version field only.
   * @override
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serialize(snapshot) {
    let serialized = super.serialize(...arguments);
    if (snapshot?.adapterOptions?.method === 'cancel') {
      serialized = this.serializeForCancel(snapshot);
    }
    return serialized;
  }

  /**
   * Returns a payload containing only version
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serializeForCancel(snapshot) {
    return {
      version: snapshot.attr('version'),
    };
  }
}
