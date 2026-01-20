/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import GeneratedCredentialModel from '../generated/models/credential';

/**
 * Supported Credential types.
 */

export const TYPE_CREDENTIAL_USERNAME_PASSWORD = 'username_password';
export const TYPE_CREDENTIAL_SSH_PRIVATE_KEY = 'ssh_private_key';
export const TYPE_CREDENTIAL_JSON = 'json';
export const TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN =
  'username_password_domain';
export const TYPE_CREDENTIAL_PASSWORD = 'password';

export const TYPES_CREDENTIAL = Object.freeze([
  TYPE_CREDENTIAL_USERNAME_PASSWORD,
  TYPE_CREDENTIAL_SSH_PRIVATE_KEY,
  TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
  TYPE_CREDENTIAL_JSON,
  TYPE_CREDENTIAL_PASSWORD,
]);

export default class CredentialModel extends GeneratedCredentialModel {
  // =attributes
  /**
   * All Credentials are prefixed with "cred" and are considered
   * static due to their relation with Static Credential Stores.
   *
   * True if credential starts with the "cred" prefix.
   * @type {boolean}
   */
  get isStatic() {
    return this.id.startsWith('cred');
  }

  /**
   * True if type is `json`.
   * @type {boolean}
   */
  get isJSON() {
    return this.type === TYPE_CREDENTIAL_JSON;
  }

  /**
   * True if credential is an unknown type.
   * @type {boolean}
   */
  get isUnknown() {
    return !TYPES_CREDENTIAL.includes(this.type);
  }
}
