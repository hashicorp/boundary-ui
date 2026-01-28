/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import GeneratedCredentialStoreModel from '../generated/models/credential-store';
import { equal } from '@ember/object/computed';

export const TYPE_CREDENTIAL_STORE_STATIC = 'static';
export const TYPE_CREDENTIAL_STORE_VAULT = 'vault';

export const TYPES_CREDENTIAL_STORE = Object.freeze([
  TYPE_CREDENTIAL_STORE_STATIC,
  TYPE_CREDENTIAL_STORE_VAULT,
]);

export default class CredentialStoreModel extends GeneratedCredentialStoreModel {
  // =attributes

  /**
   * @type {boolean}
   */
  @equal('type', 'vault') isVault;

  /**
   * @type {boolean}
   */
  @equal('type', 'static') isStatic;
}
