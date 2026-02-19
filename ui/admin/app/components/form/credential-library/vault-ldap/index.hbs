{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

<Rose::Form
  @onSubmit={{@submit}}
  @cancel={{@cancel}}
  @disabled={{@model.isSaving}}
  @showEditToggle={{if @model.isNew false true}}
  as |form|
>
  <Hds::Form::TextInput::Field
    name='name'
    @value={{@model.name}}
    @isInvalid={{@model.errors.name}}
    @isOptional={{true}}
    disabled={{form.disabled}}
    {{on 'input' (set-from-event @model 'name')}}
    as |F|
  >
    <F.Label>{{t 'form.name.label'}}</F.Label>
    <F.HelperText>{{t 'form.name.help'}}</F.HelperText>
    {{#if @model.errors.name}}
      <F.Error as |E|>
        {{#each @model.errors.name as |error|}}
          <E.Message>
            {{error.message}}
          </E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Hds::Form::TextInput::Field>

  <Hds::Form::Textarea::Field
    name='description'
    @value={{@model.description}}
    @isInvalid={{@model.errors.description}}
    @isOptional={{true}}
    disabled={{form.disabled}}
    as |F|
  >
    <F.Label>{{t 'form.description.label'}}</F.Label>
    <F.HelperText>{{t 'form.description.help'}}</F.HelperText>
    {{#if @model.errors.description}}
      <F.Error as |E|>
        {{#each @model.errors.description as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Hds::Form::Textarea::Field>

  {{#if @model.isNew}}
    <Form::CredentialLibrary::Radio
      @model={{@model}}
      @changeType={{@changeType}}
    />
  {{else}}
    <InfoField
      @value={{t (concat 'resources.credential-library.types.' @model.type)}}
      as |F|
    >
      <F.Label>{{t 'form.type.label'}}</F.Label>
      <F.HelperText>
        {{t (concat 'resources.credential-library.help.' @model.type)}}
      </F.HelperText>
    </InfoField>
  {{/if}}

  <Hds::Form::TextInput::Field
    @isRequired={{true}}
    @isOptional={{false}}
    @value={{@model.path}}
    @isInvalid={{@model.errors.path}}
    @type='text'
    name='vault_path'
    disabled={{form.disabled}}
    {{on 'input' (set-from-event @model 'path')}}
    as |F|
  >
    <F.Label>{{t
        'resources.credential-library.form.vault_path.label'
      }}</F.Label>
    <F.HelperText>{{t
        'resources.credential-library.form.vault_path.help'
      }}</F.HelperText>
    {{#if @model.errors.path}}
      <F.Error as |E|>
        {{#each @model.errors.path as |error|}}
          <E.Message
            data-test-error-message-vault-path
          >{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Hds::Form::TextInput::Field>

  {{#if (can 'save model' @model)}}
    <form.actions
      @enableEditText={{t 'actions.edit-form'}}
      @submitText={{t 'actions.save'}}
      @cancelText={{t 'actions.cancel'}}
    />
  {{/if}}

</Rose::Form>