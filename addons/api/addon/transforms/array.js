/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Transform from '@ember-data/serializer/transform';
import { TrackedArray } from 'tracked-built-ins';

export default class ArrayTransform extends Transform {
  deserialize(serialized) {
    const stringValues = new TrackedArray(serialized || []);
    return stringValues;
  }

  serialize(deserialized) {
    const strings = deserialized || [];
    return strings;
  }
}
