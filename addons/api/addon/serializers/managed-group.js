/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ApplicationSerializer from './application';
import {
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';

export default class ManagedGroupSerializer extends ApplicationSerializer {
  // =properties
  /**
   * @type {boolean}
   */
  serializeScopeID = false;

  /**
   * Delegates to a type-specific serialization, or default.
   * @override
   * @param {Snapshot} snapshot
   * @return {object}
   */

  serialize(snapshot) {
    switch (snapshot.record.type) {
      case TYPE_AUTH_METHOD_OIDC:
        return this.serializeOIDC(...arguments);
      case TYPE_AUTH_METHOD_LDAP:
      default:
        return super.serialize(...arguments);
    }
  }

  serializeOIDC() {
    const serialized = super.serialize(...arguments);
    if (serialized.attributes.filter_string !== undefined) {
      serialized.attributes.filter = serialized.attributes.filter_string;
    }
    delete serialized.attributes.filter_string;
    return serialized;
  }

  normalize(typeClass, hash, ...rest) {
    const normalizedHash = structuredClone(hash);

    if (normalizedHash?.attributes?.filter) {
      normalizedHash.attributes.filter_string =
        normalizedHash.attributes.filter;
      delete normalizedHash.attributes.filter;
    }

    return super.normalize(typeClass, normalizedHash, ...rest);
  }
}
