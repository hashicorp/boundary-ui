/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { computed, action } from '@ember/object';

export default class FormRoleGrantsComponent extends Component {
  // =attributes

  /**
   * @type {string}
   */
  @tracked newGrantString = '';

  /**
   * Returns grants currently on model, in addition to
   * grants added (or deleted) interactively by user -
   * before form submission
   * @return {[string]}
   */
  @computed('args.model.grant_strings.[]')
  get grants() {
    return this.args.model.grant_strings.map((value) => ({ value }));
  }

  /**
   * Returns grants after form submission
   * @return {[object]}
   */
  @computed('grants.@each.value')
  get grantStrings() {
    return this.grants.map((obj) => obj.value);
  }

  /**
   * True if the grant string field is empty, false otherwise.  This is used
   * to disable the submit button.
   * @return {boolean}
   */
  @computed('newGrantString')
  get cannotSave() {
    return !this.newGrantString;
  }

  // =actions

  /**
   * Listens on user input and populates newGrantString tracked prop
   * @param {string} event
   */
  @action
  onInputFieldChanged(event) {
    this.newGrantString = event.target.value;
  }

  /**
   * Listens on user input and updates existing grants
   * @param {string} grant
   * @param {string} event
   */
  @action
  onUpdateGrant(grant, event) {
    grant.value = event.target.value;
  }

  /**
   * Calls the passed function with the grant string as an argument and then
   * clears the value of the grant string field.
   * `@addGrant` should be passed by the context calling this component.
   * @param {Function} addGrantFn
   */
  @action
  createGrant(addGrantFn) {
    addGrantFn(this.newGrantString);
    this.newGrantString = '';
  }
}
