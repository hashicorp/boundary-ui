/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

export default class HostSourceIdArrayTransform {
  deserialize(serialized) {
    const stringValues = serialized || [];
    return stringValues.map(({ id: host_source_id, ...obj }) => ({
      host_source_id,
      ...obj,
    }));
  }

  serialize(deserialized) {
    const strings = deserialized || [];
    return strings.map(({ host_source_id: id, ...obj }) => ({ id, ...obj }));
  }

  static create() {
    return new this();
  }
}
