/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationSerializer from './application';
export default class CredentialStoreSerializer extends ApplicationSerializer {
  /**
   * @override
   * @method serialize
   * @param {Snapshot} snapshot
   */
  serialize(snapshot) {
    switch (snapshot.record.type) {
      case 'vault':
        return this.serializeVault(...arguments);
      case 'static':
      default:
        return this.serializeStatic(...arguments);
    }
  }

  serializeVault() {
    const serialized = super.serialize(...arguments);
    if (serialized.attributes) {
      // Client certificate key cannot be unset when certificate is set.
      // If it's falsy, it must be removed.
      if (
        !serialized.attributes?.client_certificate_key &&
        serialized.attributes?.client_certificate
      ) {
        delete serialized.attributes.client_certificate_key;
      }
    }
    return serialized;
  }

  serializeStatic() {
    const serialized = super.serialize(...arguments);
    // Delete attributes for static cred store
    delete serialized.attributes;
    return serialized;
  }

  normalize(typeClass, hash, ...rest) {
    const normalizedHash = structuredClone(hash);
    const normalized = super.normalize(typeClass, normalizedHash, ...rest);
    // Remove secret fields as we don't track them after being created/updated
    normalized.data.attributes.token = '';
    return normalized;
  }
}
