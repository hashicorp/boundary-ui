/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class FormAccountPasswordSetPasswordIndexComponent extends Component {
  // =properties

  /**
   * New password property
   * @type {string}
   */
  @tracked password;

  /**
   * @type {boolean}
   */
  get cannotSave() {
    return !this.password;
  }

  // =methods

  /**
   * Unsets the password field.
   */
  resetPassword() {
    this.password = null;
  }

  // =actions

  /**
   * Submit with password value when it is allowed.
   * Callback with no arguments otherwise.
   * @param {function} fn
   * @param {string} password
   */
  @action
  submit(fn, password) {
    this.resetPassword();
    fn(password);
  }
}

{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

<Rose::Form @onSubmit={{fn this.submit @submit this.password}} as |form|>

  <Hds::Form::TextInput::Field
    @isRequired={{true}}
    @value={{this.password}}
    @type='password'
    name='password'
    autocomplete='new-password'
    disabled={{form.disabled}}
    {{on 'input' (set-from-event this 'password')}}
    as |F|
  >
    <F.Label>{{t 'form.set_password.label'}}</F.Label>
    <F.HelperText>{{t 'form.set_password.help'}}</F.HelperText>
  </Hds::Form::TextInput::Field>

  <form.actions
    @submitDisabled={{this.cannotSave}}
    @showCancel={{false}}
    @submitText={{t 'actions.save'}}
    @cancelText={{t 'actions.cancel'}}
  />

</Rose::Form>