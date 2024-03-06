/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { computed, action } from '@ember/object';

export default class FormRoleGrantsComponent extends Component {
  // =attributes

  /**
   * @type {[object]}
   */
  @computed('args.model.grant_strings.[]')
  get grants() {
    return this.args.model.grant_strings.map((value) => ({ value }));
  }

  /**
   * @type {[string]}
   */
  @computed('grants.@each.value')
  get grantStrings() {
    return this.grants.map((obj) => obj.value);
  }

  // =actions

  /**
   * Calls the passed function with the grant string as an argument
   * `@addGrant` should be passed by the context calling this component.
   * @param {Function} addGrantFn
   */
  @action
  createGrant(addGrantFn, e) {
    addGrantFn(e.value);
  }
}
