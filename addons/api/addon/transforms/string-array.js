/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

export default class StringArrayTransform {
  deserialize(serialized) {
    const stringValues = serialized || [];
    return stringValues.map((value) => ({ value }));
  }

  serialize(deserialized) {
    const strings = deserialized || [];
    return strings.map(({ value }) => value);
  }

  static create() {
    return new this();
  }
}
