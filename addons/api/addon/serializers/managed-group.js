/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
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

  /**
   * Extracts errors from the payload and transforms specific keys if needed.
   * @override
   * @return {object}
   */
  extractErrors() {
    const errors = super.extractErrors(...arguments);
    if (errors?.filter) {
      errors.filter_string = errors.filter;
      delete errors.filter;
    }
    return errors;
  }
}
