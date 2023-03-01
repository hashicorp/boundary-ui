/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Transform from '@ember-data/serializer/transform';

export default class AccountClaimMapArrayTransform extends Transform {
  deserialize(serialized) {
    const accountClaims = serialized || [];
    return accountClaims.map((accountClaimString) => ({
      from: accountClaimString.split('=')[0],
      to: accountClaimString.split('=')[1],
    }));
  }

  serialize(deserialized) {
    const accountClaims = deserialized || [];
    return accountClaims.map(({ from, to }) => `${from}=${to}`);
  }
}
