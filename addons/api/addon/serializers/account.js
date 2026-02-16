/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationSerializer from './application';
import {
  TYPE_AUTH_METHOD_PASSWORD,
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';

export default class AccountSerializer extends ApplicationSerializer {
  // =properties

  /**
   * @type {boolean}
   */
  serializeScopeID = false;

  // =methods

  /**
   * If `adapterOptions.method` is `set-password`, the serialization should
   * include only **password** and the version.
   * If `adapterOptions.password` is set, the serialization should
   * include **password** in it's `attributes`.
   * @override
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serialize(snapshot) {
    switch (snapshot.record.type) {
      case TYPE_AUTH_METHOD_PASSWORD:
        return this.serializePassword(...arguments);
      case TYPE_AUTH_METHOD_OIDC:
        return this.serializeOIDC(...arguments);
      case TYPE_AUTH_METHOD_LDAP:
        return this.serializeLDAP(...arguments);
    }
  }

  /**
   * LDAP serialization limits the `attributes` posted on create and omits
   * `attributes` entirely on update.
   */
  serializeLDAP(snapshot) {
    const { isNew } = snapshot?.record || {};
    let serialized = super.serialize(...arguments);
    delete serialized.attributes;
    if (isNew) {
      serialized.attributes = {};
      const { login_name } = snapshot.record;
      if (login_name) serialized.attributes.login_name = login_name;
    } else {
      // LDAP does not support updating the readonly auth method ID or type attributes.
      delete serialized.auth_method_id;
      delete serialized.type;
    }
    return serialized;
  }

  /**
   * OIDC serialization limits the `attributes` posted on create and omits
   * `attributes` entirely on update.
   */
  serializeOIDC(snapshot) {
    const { isNew } = snapshot?.record || {};
    let serialized = super.serialize(...arguments);
    delete serialized.attributes;
    if (isNew) {
      serialized.attributes = {};
      const { issuer, subject } = snapshot.record;
      if (issuer) serialized.attributes.issuer = issuer;
      if (subject) serialized.attributes.subject = subject;
    } else {
      // OIDC does not support updating the readonly auth method ID or type attributes.
      delete serialized.auth_method_id;
      delete serialized.type;
    }
    return serialized;
  }

  /**
   * Password serialization omits `attributes` and handles password-related
   * custom methods.
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serializePassword(snapshot) {
    const password = snapshot?.adapterOptions?.password;
    let serialized = super.serialize(...arguments);
    // Only login_name is serialized into password attributes.
    const { login_name } = serialized.attributes;
    if (login_name) {
      serialized.attributes = { login_name };
    } else {
      serialized.attributes = {};
    }
    // New record case
    if (password && snapshot?.record?.isNew) {
      serialized.attributes.password = password;
    }
    // Set password custom method
    if (snapshot?.adapterOptions?.method === 'set-password') {
      serialized = this.serializeForSetPassword(snapshot, password);
    }
    // Change password custom method
    if (snapshot?.adapterOptions?.method === 'change-password') {
      const { currentPassword, newPassword } = snapshot?.adapterOptions || {};
      serialized = this.serializeForChangePassword(
        snapshot,
        currentPassword,
        newPassword,
      );
    }
    return serialized;
  }

  /**
   * Returns a payload containing only new password.
   * @param {Snapshot} snapshot
   * @param {string} password
   * @return {object}
   */
  serializeForSetPassword(snapshot, password) {
    return {
      version: snapshot.attr('version'),
      password,
    };
  }

  /**
   * Returns a payload containing current and new passwords.
   * @param {Snapshot} snapshot
   * @param {string} current_password
   * @param {string} new_password
   * @return {object}
   */
  serializeForChangePassword(snapshot, current_password, new_password) {
    return {
      version: snapshot.attr('version'),
      current_password,
      new_password,
    };
  }
}
