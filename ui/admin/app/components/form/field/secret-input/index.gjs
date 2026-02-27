/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class FormFieldSecretInputIndexComponent extends Component {
  // =properties
  /**
   * Tracks when secret can be updated
   * @type {boolean}
   */
  @tracked isEditing = false;

  /**
   * Returns true if the resource form is in read only mode
   * @type {boolean}
   */
  get isDisabled() {
    return this.args.isDisabled;
  }

  /**
   * Returns true if the resource form is in edit mode and
   * `edit` button is enabled for the secret field.
   * This state lets the user to update the secret fields if they like
   * @type {boolean}
   */
  get isActionable() {
    return this.args.showEditButton && !this.isEditing;
  }

  // =actions

  /**
   * Sets the secret field to be updated
   * when `edit` button is clicked in Actionable view
   */
  @action
  enableEdit() {
    if (!this.args.isDisabled) this.isEditing = true;
  }

  /**
   * Clears updated secret when cancel button is
   * clicked in Actionable view.
   * Sets the secret field back to disabled mode
   */
  @action
  cancelEdit() {
    this.isEditing = false;
    this.args.cancel();
  }
}

{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

<div class='secret-input' ...attributes>
  {{#if (or this.isDisabled this.isActionable)}}
    <span class='overlay'></span>
  {{/if}}
  <Hds::Form::TextInput::Field
    @isRequired={{@isRequired}}
    @isInvalid={{@isInvalid}}
    @value={{@value}}
    @type={{or @type 'password'}}
    name={{@name}}
    disabled={{or @isDisabled (not this.isEditing)}}
    @hasVisibilityToggle={{false}}
    as |F|
  >
    {{yield F}}
  </Hds::Form::TextInput::Field>

  {{#if this.isDisabled}}
    <Hds::Button
      @text={{t 'actions.edit'}}
      @icon='edit'
      disabled={{@isDisabled}}
    />
  {{else if this.isActionable}}
    <Hds::Button
      @text={{t 'actions.edit'}}
      @icon='edit'
      @color='secondary'
      {{on 'click' this.enableEdit}}
    />
  {{else}}
    <Hds::Button
      @text={{t 'actions.cancel'}}
      @color='secondary'
      {{on 'click' this.cancelEdit}}
    />
  {{/if}}
</div>