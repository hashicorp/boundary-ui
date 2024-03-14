/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ApplicationSerializer from './application';
import {
  TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
  TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
  options,
} from '../models/credential-library';

export default class CredentialLibrarySerializer extends ApplicationSerializer {
  // =properties

  /**
   * @type {boolean}
   */
  serializeScopeID = false;

  /**
   * @override
   * @method serialize
   * @param {Snapshot} snapshot
   */
  serialize(snapshot) {
    switch (snapshot.record.type) {
      case TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC:
        return this.serializeVaultGeneric(...arguments);
      case TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE:
      default:
        return super.serialize(...arguments);
    }
  }
  serializeAttribute(snapshot, json) {
    const value = super.serializeAttribute(...arguments);
    const { credential_type, type, credential_mapping_overrides, isNew } =
      snapshot.record;

    if (
      type === TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC &&
      credential_mapping_overrides?.length &&
      !isNew
    ) {
      // API expects to send null to fields if it is undefined or deleted
      options.mapping_overrides[credential_type].forEach((item) => {
        const doesExist = credential_mapping_overrides.some(
          (obj) => obj.key === item,
        );
        if (!doesExist) {
          credential_mapping_overrides.push({ key: item, value: null });
        }
      });

      json.credential_mapping_overrides = credential_mapping_overrides.reduce(
        (result, currentValue) => {
          const { key, value } = currentValue;
          result[key] = value;
          return result;
        },
        {},
      );
      return value;
    }
  }

  serializeVaultGeneric() {
    const serialized = super.serialize(...arguments);

    if (serialized.attributes) {
      // Set `http_request_body` only if `http_method` is POST
      // otherwise set to null to have the field removed
      if (!serialized.attributes?.http_method?.match(/post/i)) {
        serialized.attributes.http_request_body = null;
      }
    }
    return serialized;
  }
}
