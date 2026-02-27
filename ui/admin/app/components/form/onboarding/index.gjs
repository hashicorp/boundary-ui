{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

<Rose::Form
  class='full-width'
  @cancel={{@cancel}}
  @onSubmit={{this.submit}}
  @disabled={{this.isSaving}}
  as |form|
>
  <div class='create-resources-form'>
    <Hds::Form::TextInput::Field
      name='targetAddress'
      @type='text'
      @value={{this.targetAddress}}
      @isRequired={{true}}
      @isInvalid={{this.targetAddressInvalid}}
      {{on 'input' (set-from-event this 'targetAddress')}}
      as |F|
    >
      <F.Label>{{t 'onboarding.add-target.titles.target-address'}}</F.Label>
      <F.HelperText>
        {{t 'onboarding.add-target.descriptions.target-address'}}
      </F.HelperText>

      {{#if this.targetAddressInvalid}}
        <F.Error as |E|>
          <E.Message>{{t 'errors.required-field'}}</E.Message>
        </F.Error>
      {{/if}}
    </Hds::Form::TextInput::Field>

    <Hds::Form::TextInput::Field
      name='targetPort'
      @type='text'
      @value={{this.targetPort}}
      @isRequired={{true}}
      @isInvalid={{this.targetPortInvalid}}
      {{on 'input' (set-from-event this 'targetPort')}}
      as |F|
    >
      <F.Label>{{t 'onboarding.add-target.titles.target-port'}}</F.Label>
      <F.HelperText>
        {{t 'onboarding.add-target.descriptions.target-port'}}
      </F.HelperText>
      {{#if this.targetPortInvalid}}
        <F.Error as |E|>
          <E.Message>{{t 'errors.required-field'}}</E.Message>
        </F.Error>
      {{/if}}
    </Hds::Form::TextInput::Field>
  </div>

  <Hds::Form::Fieldset as |F|>
    <F.Legend>{{t 'onboarding.add-target.titles.target-setup-info'}}</F.Legend>
    <F.Control>{{t
        'onboarding.add-target.descriptions.target-setup-info'
      }}</F.Control>
    <F.Control><Image @name='ssh-target-creation' /></F.Control>
  </Hds::Form::Fieldset>

  <form.actions
    @submitText={{t 'actions.save'}}
    @cancelText={{t 'actions.do-this-later'}}
  />
</Rose::Form>