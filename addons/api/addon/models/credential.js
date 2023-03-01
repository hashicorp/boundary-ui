/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import GeneratedCredentialModel from '../generated/models/credential';

/**
 * Supported Credential types.
 */
export const types = ['username_password', 'ssh_private_key', 'json'];

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
    return this.type === 'json';
  }

  /**
   * True if credential is an unknown type.
   * @type {boolean}
   */
  get isUnknown() {
    return !types.includes(this.type);
  }
}
