/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationSerializer from './application';

export default class AliasSerializer extends ApplicationSerializer {
  // =methods

  /**
   * Serializes an alias, ensuring base_value is included when available.
   * @override
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serialize(snapshot) {
    const serialized = super.serialize(...arguments);

    // Ensure base_value is included in the payload
    if (snapshot.record.base_value !== undefined) {
      serialized.base_value = snapshot.record.base_value;
    }

    return serialized;
  }
}
