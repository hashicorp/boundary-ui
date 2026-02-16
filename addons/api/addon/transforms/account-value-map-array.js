/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

export default class AccountValueMapArrayTransform {
  deserialize(serialized) {
    const accountValues = serialized || [];
    return accountValues.map((accountValueString) => ({
      key: accountValueString.split('=')[0],
      value: accountValueString.split('=')[1],
    }));
  }

  serialize(deserialized) {
    const accountValues = deserialized || [];
    return accountValues.map(({ key, value }) => `${key}=${value}`);
  }

  static create() {
    return new this();
  }
}
