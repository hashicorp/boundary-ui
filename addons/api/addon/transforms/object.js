/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { TrackedObject } from 'tracked-built-ins';

export default class ObjectTransform {
  /**
   * @param serialized
   * @returns {object}
   */
  deserialize(serialized) {
    const obj = new TrackedObject(serialized || {});
    return obj;
  }

  /**
   * @param deserialized
   * @returns {object}
   */
  serialize(deserialized) {
    if (!deserialized) {
      return {};
    }
    return deserialized;
  }

  static create() {
    return new this();
  }
}
