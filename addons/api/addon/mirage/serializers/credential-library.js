/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  modelName: 'credential-library',

  _hashForModel(model) {
    const json = ApplicationSerializer.prototype._hashForModel.apply(
      this,
      arguments,
    );
    json.credential_store_id = model.credentialStoreId;

    // BE API only updates these fields if there's an update mask, otherwise they remain unmodified
    // but we don't need this flow in our mocks, so we are deleting fields with null value

    if (json.credential_mapping_overrides) {
      Object.keys(json.credential_mapping_overrides).forEach((key) => {
        if (json.credential_mapping_overrides[key] === null) {
          delete json.credential_mapping_overrides[key];
        }
      });
    }
    return json;
  },
});
