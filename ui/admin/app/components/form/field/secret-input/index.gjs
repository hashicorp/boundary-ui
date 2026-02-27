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