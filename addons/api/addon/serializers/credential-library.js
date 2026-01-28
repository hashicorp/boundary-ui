/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
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
        return this.serializeVaultSshCertificate(...arguments);
      default:
        return super.serialize(...arguments);
    }
  }

  serializeVaultGeneric(snapshot) {
    const { isNew } = snapshot;
    const serialized = super.serialize(...arguments);

    if (serialized.attributes) {
      // Set `http_request_body` only if `http_method` is POST
      // otherwise set to null to have the field removed
      if (!serialized.attributes?.http_method?.match(/post/i)) {
        serialized.attributes.http_request_body = null;
      }
      this.handleCredentialMappingOverrides(serialized, isNew);
      return serialized;
    }
  }

  serializeVaultSshCertificate() {
    const serialized = super.serialize(...arguments);
    if (serialized.attributes) {
      const { key_type } = serialized.attributes;
      if (key_type !== 'rsa' && key_type !== 'ecdsa') {
        // If the key type is not RSA or ECDSA, set key_bits to null
        serialized.attributes.key_bits = null;
      }
      return serialized;
    }
  }

  /**
   * Handle credential mapping overrides for serialization.
   * @param {Object} serialized - The serialized object.
   * @param {boolean} isNew - Indicates if the record is new.
   */
  handleCredentialMappingOverrides(serialized, isNew) {
    const { credential_type, credential_mapping_overrides } = serialized;
    if (Object.keys(credential_mapping_overrides).length === 0) {
      serialized.credential_mapping_overrides = null;
    }
    // API expects to send null to fields if it is undefined or deleted
    if (credential_mapping_overrides && !isNew) {
      serialized.credential_mapping_overrides = options.mapping_overrides[
        credential_type
      ].reduce((obj, key) => {
        if (credential_mapping_overrides[key]) {
          obj[key] = credential_mapping_overrides[key];
        } else {
          obj[key] = null;
        }
        return obj;
      }, {});
    }
  }
}
