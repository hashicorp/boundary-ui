/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ApplicationSerializer from './application';
import { TYPE_AUTH_METHOD_PASSWORD } from 'api/models/auth-method';

const fieldsByType = {
  oidc: [
    'state',
    'issuer',
    'client_id',
    'client_secret',
    'client_secret_mac',
    'max_age',
    'api_url_prefix',
    'callback_url',
    'disable_discovered_config_validation',
    'dry_run',
    'claims_scopes',
    'signing_algorithms',
    'allowed_audiences',
    'idp_ca_certs',
    'account_claim_maps',
  ],
  ldap: [],
};

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

  serializeAttribute(snapshot, json, key, attribute) {
    const value = super.serializeAttribute(...arguments);
    const { type } = snapshot.record;
    const { options } = attribute;

    // This deletes any fields that don't belong to the record type
    if (type != 'password' && options.isNestedAttribute && json.attributes) {
      if (!fieldsByType[type].includes(key)) delete json.attributes[key];
    }

    // This deletes any secret fields that don't belong to the record type
    if (options.isNestedSecret && json.secrets) {
      if (!fieldsByType[type].includes(key)) delete json.secrets[key];
    }

    return value;
  }

  /**
   * Default serialization omits `attributes`.
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
      serialized = this.serializeAuthMethodWithState(snapshot, state);
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
  serializeDefaultWithState(snapshot, state) {
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
      a.attributes.is_primary ? -1 : 1
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
    // switch (normalizedHash.type) {
    //   case 'oidc':
    //     normalizedHash = this.normalizeOIDC(normalizedHash);
    //     break;
    // }
    const normalized = super.normalize(typeClass, normalizedHash, ...rest);
    if (!normalized.data.attributes.is_primary) {
      normalized.data.attributes.is_primary = false;
    }
    return normalized;
  }
}
