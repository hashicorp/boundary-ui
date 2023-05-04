/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ApplicationSerializer from './application';
import {
  TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
  TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
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

  serializeAttribute(snapshot, json, key, attribute) {
    super.serializeAttribute(...arguments);
    const { options } = attribute;
    const { type } = snapshot.record;

    // If an attribute has a `for` option, it must match the
    // record's `type`, else the attribute is excluded
    // from serialization.
    if (options?.for && options.for !== type) {
      if (options.isNestedAttribute) {
        delete json.attributes[key];
      } else {
        delete json[key];
      }
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
