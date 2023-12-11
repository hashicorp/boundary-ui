import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { run } from '@ember/runloop';

// rose
import RoseForm from 'rose/components/rose/form';

// hds
import HdsFormTextInputField from '@hashicorp/design-system-components/components/hds/form/text-input/field';

// modifiers
import { on } from '@ember/modifier';

// helpers
import t from 'ember-intl/helpers/t';
import { fn } from '@ember/helper';
import setFromEvent from 'rose/helpers/set-from-event';

export default class FormAccountPasswordChangePasswordIndex extends Component {
  @service accountActions;

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

    /**
   * Unsets the password fields.
   */
  resetPasswords() {
    this.currentPassword = null;
    this.newPassword = null;
  }

  // =actions



  /**
   * Unset passwords then redirect to index route for further processing.
   */
  @action
  cancel() {
    this.resetPasswords();
    this.router.replaceWith('index');
  }

  /**
   * Call passed submit function with passwords.
   * Unset passwords before callack.
   * @param {function} fn
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  @action
  submit(currentPassword, newPassword) {
    run(() => this.resetPasswords());
    run(() => this.accountActions.changePassword(this.args.model, currentPassword, newPassword));
  }

  <template><RoseForm
  class='full-width'
  @onSubmit={{fn this.submit this.currentPassword this.newPassword}}
  @cancel={{this.cancel}}
  @disabled={{@model.isSaving}}
  as |form|
>

  <HdsFormTextInputField
    @isRequired={{true}}
    @value={{this.currentPassword}}
    @type='password'
    name='currentPassword'
    autocomplete='current-password'
    disabled={{form.disabled}}
    {{on 'input' (setFromEvent this 'currentPassword')}}
    as |F|
  >
    <F.Label>{{t 'form.current_password.label'}}</F.Label>
  </HdsFormTextInputField>

  <HdsFormTextInputField
    @isRequired={{true}}
    @value={{this.newPassword}}
    @type='password'
    name='newPassword'
    autocomplete='new-password'
    disabled={{form.disabled}}
    {{on 'input' (setFromEvent this 'newPassword')}}
    as |F|
  >
    <F.Label>{{t 'form.new_password.label'}}</F.Label>
  </HdsFormTextInputField>

  <form.actions
    @submitDisabled={{this.cannotSave}}
    @submitText={{t 'actions.save'}}
    @cancelText={{t 'actions.cancel'}}
  />
</RoseForm></template>
}