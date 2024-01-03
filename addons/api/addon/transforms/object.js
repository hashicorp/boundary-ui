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
    if (Object.keys(serialized).length) {
      const obj = new TrackedObject(serialized);
      return obj;
    } else {
      return {};
    }
  }

  /**
   * @param deserialized
   * @returns {object}
   */
  serialize(deserialized) {
    if (Object.keys(deserialized).length) {
      return deserialized;
    } else {
      return {};
    }
  }
}
