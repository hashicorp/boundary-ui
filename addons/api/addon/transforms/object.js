/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Transform from '@ember-data/serializer/transform';
import { TrackedObject } from 'tracked-built-ins';
import { typeOf } from '@ember/utils';

export default class ObjectTransform extends Transform {
  /**
   * @param serialized
   * @returns {object}
   */
  deserialize(serialized) {
    if (typeOf(serialized) === 'object') {
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
    if (typeOf(deserialized) === 'object') {
      const obj = new TrackedObject(deserialized);
      return obj;
    } else {
      return {};
    }
  }
}
