/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Transform from '@ember-data/serializer/transform';

export default class AccountValueMapArrayTransform extends Transform {
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
}
