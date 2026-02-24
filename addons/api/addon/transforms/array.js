/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { TrackedArray } from 'tracked-built-ins';

export default class ArrayTransform {
  deserialize(serialized) {
    const arr = new TrackedArray(serialized || []);
    return arr;
  }

  serialize(deserialized) {
    const arr = deserialized || [];
    return arr;
  }

  static create() {
    return new this();
  }
}
