/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Transform from '@ember-data/serializer/transform';

export default class KeyValueMapArrayTransform extends Transform {
  deserialize(serialized) {
    const keyValues = serialized || [];
    return keyValues.map((keyValueString) => ({
      from: keyValueString.split('=')[0],
      to: keyValueString.split('=')[1],
    }));
  }

  serialize(deserialized) {
    const keyValues = deserialized || [];
    return keyValues.map(({ from, to }) => `${from}=${to}`);
  }
}
