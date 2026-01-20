/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationSerializer from './application';

export default class AccountSerializer extends ApplicationSerializer {
  serialize(snapshot) {
    let serialized = super.serialize(...arguments);
    // The post request for revoke doesn't expect a payload,
    // so we return nothing
    if (snapshot?.adapterOptions?.method === 'revoke') {
      return {};
    }
    return serialized;
  }
}
