/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  modelName: 'credential',

  _hashForModel(model) {
    const json = ApplicationSerializer.prototype._hashForModel.apply(
      this,
      arguments,
    );
    json.credential_store_id = model.credentialStoreId;

    // in a real API, the password, private_key, and private_key_passphrase
    // fields are not returned so we delete them from the response
    delete json.attributes?.password;
    delete json.attributes?.private_key;
    delete json.attributes?.private_key_passphrase;
    delete json.attributes?.json_object;
    return json;
  },
});
