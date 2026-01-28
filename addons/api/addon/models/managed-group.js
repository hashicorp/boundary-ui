/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import GeneratedManagedGroupModel from '../generated/models/managed-group';
import { attr } from '@ember-data/model';
import { A } from '@ember/array';
import { TYPE_AUTH_METHOD_OIDC, TYPE_AUTH_METHOD_LDAP } from './auth-method';

export default class ManagedGroupModel extends GeneratedManagedGroupModel {
  // =attributes

  /**
   * Members is read-only under normal circumstances.  But members can
   * be persisted via calls to `addMembers()` or `removeMembers()`.
   */
  @attr({
    readOnly: true,
    defaultValue: () => A(),
    emptyArrayIfMissing: true,
  })
  member_ids;

  /**
   * @type {boolean}
   */
  get isOIDC() {
    return this.type === TYPE_AUTH_METHOD_OIDC;
  }

  /**
   * @type {boolean}
   */
  get isLDAP() {
    return this.type === TYPE_AUTH_METHOD_LDAP;
  }
}
