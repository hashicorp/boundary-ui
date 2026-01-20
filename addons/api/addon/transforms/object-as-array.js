/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

export default class ObjectAsArrayTransform {
  deserialize(serialized) {
    const obj = serialized || {};
    return Object.entries(obj).map(([key, value]) => ({ key, value }));
  }

  serialize(deserialized) {
    const array = deserialized || [];

    if (!array.length) {
      return null;
    }

    return array.reduce((result, currentValue) => {
      const { key, value } = currentValue;
      result[key] = value;

      return result;
    }, {});
  }

  static create() {
    return new this();
  }
}
