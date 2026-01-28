/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationSerializer from './application';
import { TYPE_AUTH_METHOD_PASSWORD } from 'api/models/auth-method';

export default class AuthMethodSerializer extends ApplicationSerializer {
  // =methods

  /**
   * Delegates to a type-specific serialization, or default.
   * @override
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serialize(snapshot) {
    switch (snapshot.record.type) {
      case TYPE_AUTH_METHOD_PASSWORD:
        return this.serializePassword(...arguments);
      default:
        return this.serializeDefault(...arguments);
    }
  }

  /**
   * Password serialization omits `attributes`.
   * @return {object}
   */
  serializePassword() {
    let serialized = super.serialize(...arguments);
    delete serialized.attributes;
    return serialized;
  }

  /**
   * If `adapterOptions.state` is set, the serialization should
   * include **only state** and version.  Normally, this is not serialized.
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serializeDefault(snapshot) {
    let serialized = super.serialize(...arguments);
    const state = snapshot?.adapterOptions?.state;
    if (state) {
      serialized = this.serializeWithState(snapshot, state);
    } else {
      delete serialized.attributes.state;
    }
    return serialized;
  }

  /**
   * Returns a payload containing only state and version.
   * @param {Snapshot} snapshot
   * @param {string} state
   * @return {object}
   */
  serializeWithState(snapshot, state) {
    return {
      version: snapshot.attr('version'),
      attributes: { state },
    };
  }

  /**
   * Sorts the array in order of "is_primary" such that the primary method
   * appears first.  The "natural" order of auth methods places primary first.
   *
   * @override
   * @return {object}
   */
  normalizeArrayResponse() {
    const normalized = super.normalizeArrayResponse(...arguments);
    normalized.data = normalized.data.sort((a) =>
      a.attributes.is_primary ? -1 : 1,
    );
    return normalized;
  }

  /**
   * Sets `is_primary` to `false` if it is missing in the response.  The API
   * omits "zero" values per:
   * https://developers.google.com/protocol-buffers/docs/proto3#default
   *
   * TODO:  generalize this so that all zero values are reified.
   * @override
   * @param {Model} typeClass
   * @param {Object} hash
   * @return {Object}
   */
  normalize(typeClass, hash, ...rest) {
    let normalizedHash = structuredClone(hash);
    const normalized = super.normalize(typeClass, normalizedHash, ...rest);
    if (!normalized.data.attributes.is_primary) {
      normalized.data.attributes.is_primary = false;
    }
    // Remove secret fields as we don't track them after being created/updated
    normalized.data.attributes.client_certificate_key = '';
    normalized.data.attributes.bind_password = '';
    normalized.data.attributes.client_secret = '';
    return normalized;
  }
}
