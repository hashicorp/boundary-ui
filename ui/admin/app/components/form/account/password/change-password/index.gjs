/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class FormAccountPasswordChangePasswordIndexComponent extends Component {
  // =properties

  /**
   * @type {string}
   */
  @tracked currentPassword;

  /**
   * @type {string}
   */
  @tracked newPassword;

  /**
   * @type {boolean}
   */
  get canSave() {
    return this.currentPassword && this.newPassword;
  }

  /**
   * @type {boolean}
   */
  get cannotSave() {
    return !this.canSave;
  }

  // =methods

  /**
   * Un-sets the password fields.
   */
  resetPasswords() {
    this.currentPassword = null;
    this.newPassword = null;
  }

  // =actions

  /**
   * Call passed submit function with passwords.
   * Unset passwords before callback.
   * @param {function} fn
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  @action
  submit(fn, currentPassword, newPassword) {
    this.resetPasswords();
    fn(currentPassword, newPassword);
  }

  /**
   * Call passed cancel function.
   * Unset passwords before callback.
   * @param {function} fn
   */
  @action
  cancel(fn) {
    this.resetPasswords();
    fn();
  }
}

{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

<Rose::Form
  class='full-width'
  @onSubmit={{fn this.submit @submit this.currentPassword this.newPassword}}
  @cancel={{fn this.cancel @cancel}}
  @disabled={{@model.isSaving}}
  as |form|
>

  <Hds::Form::TextInput::Field
    @isRequired={{true}}
    @value={{this.currentPassword}}
    @type='password'
    name='currentPassword'
    autocomplete='current-password'
    disabled={{form.disabled}}
    {{on 'input' (set-from-event this 'currentPassword')}}
    as |F|
  >
    <F.Label>{{t 'form.current_password.label'}}</F.Label>
  </Hds::Form::TextInput::Field>

  <Hds::Form::TextInput::Field
    @isRequired={{true}}
    @value={{this.newPassword}}
    @type='password'
    name='newPassword'
    autocomplete='new-password'
    disabled={{form.disabled}}
    {{on 'input' (set-from-event this 'newPassword')}}
    as |F|
  >
    <F.Label>{{t 'form.new_password.label'}}</F.Label>
  </Hds::Form::TextInput::Field>

  <form.actions
    @submitDisabled={{this.cannotSave}}
    @submitText={{t 'actions.save'}}
    @cancelText={{t 'actions.cancel'}}
  />

</Rose::Form>