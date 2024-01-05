/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Transform from '@ember-data/serializer/transform';
import { TrackedObject } from 'tracked-built-ins';

export default class ObjectTransform extends Transform {
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
      return null;
    }
    return deserialized;
  }
}
