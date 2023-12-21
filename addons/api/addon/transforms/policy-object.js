/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Transform from '@ember-data/serializer/transform';

export default class PolicyObjectTransform extends Transform {
  /**
   * Normalize a policy object in year
   * The API returns the policy deletion and retention information in days format,
   * but we make the conversion to years format by rounding to the closest integer
   * @param serialized
   * @returns {object}
   */
  deserialize(serialized) {
    if (!Object.keys(serialized)) return;
    const years = Math.round(serialized.days / 365);
    serialized.days = years;
    return serialized;
  }

  /**
   * Serialize a policy object in years format to days
   * The API expects the policy deletion and retention information in days format
   * We display this information in years to be in consistent with common regulation practices
   * @param deserialized
   * @returns {object}
   */
  serialize(deserialized) {
    if (!Object.keys(deserialized)) return;
    const days = Math.round(deserialized.days * 365);
    deserialized.days = days;

    return deserialized;
  }
}
