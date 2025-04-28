/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  modelName: 'auth-method',

  _hashForModel(model) {
    const json = ApplicationSerializer.prototype._hashForModel.apply(
      this,
      arguments,
    );
    // If the scope marks this auth method as primary, designate it
    // as such with a read-only boolean field (this is how the API behaves).
    const isPrimary =
      model.scope && model.scope.primaryAuthMethodId === model.id;
    json.is_primary = isPrimary;
    delete json.attributes?.client_certificate_key;
    delete json.attributes?.bind_password;
    delete json.attributes?.client_secret;
    return json;
  },
});
