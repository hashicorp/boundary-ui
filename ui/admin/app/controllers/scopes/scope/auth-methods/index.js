/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class ScopesScopeAuthMethodsIndexController extends Controller {
  // =attributes

  /**
   * True if the current scope has a primary auth method set.
   * @type {boolean}
   */
  get hasPrimaryAuthMethod() {
    return Boolean(this.scopeModel.primary_auth_method_id);
  }

  // =actions

  /**
   * Removes an item from array `property` at `index` on the
   * passed `authMethod`.  This is used to manage entries in fragment array
   * fields such as `signing_algorithms`.
   * @param {AuthMethodModel} authMethod
   * @param {string} property
   * @param {number} index
   */
  @action
  async removeItemByIndex(authMethod, property, index) {
    const array = authMethod.get(property).filter((item, i) => i !== index);
    authMethod.set(property, array);
  }

  /**
   * Adds a string item to array `property` on the passed `authMethod`.
   * This is used to manage entries in fragment OIDC string array fields such
   * as `signing_algorithms`.
   * @param {AuthMethodModel} authMethod
   * @param {string} property
   * @param {string} value
   */
  @action
  async addStringItem(authMethod, property, value) {
    const existingArray = authMethod[property] ?? [];
    const array = [...existingArray, { value }];
    authMethod.set(property, array);
  }
}
