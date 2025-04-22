/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  modelName: 'credential-store',

  _hashForModel(/* model */) {
    const json = ApplicationSerializer.prototype._hashForModel.apply(
      this,
      arguments,
    );
    // in a real API, the following fields are set-only and returned in
    // associated HMAC fields
    delete json.attributes?.token;
    delete json.attributes?.client_certificate_key;
    return json;
  },
});
