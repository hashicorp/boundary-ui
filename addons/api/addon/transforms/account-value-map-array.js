/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Transform from '@ember-data/serializer/transform';

export default class AccountValueMapArrayTransform extends Transform {
  deserialize(serialized) {
    const accountValues = serialized || [];
    return accountValues.map((accountValueString) => ({
      from: accountValueString.split('=')[0],
      to: accountValueString.split('=')[1],
    }));
  }

  serialize(deserialized) {
    const accountValues = deserialized || [];
    return accountValues.map(({ from, to }) => `${from}=${to}`);
  }
}
