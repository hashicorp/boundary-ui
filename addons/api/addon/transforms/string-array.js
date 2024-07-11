/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Transform from '@ember-data/serializer/transform';

export default class StringArrayTransform extends Transform {
  deserialize(serialized) {
    const stringValues = serialized || [];
    return stringValues.map((value) => ({ value }));
  }

  serialize(deserialized) {
    const strings = deserialized || [];
    return strings.map(({ value }) => value);
  }
}
