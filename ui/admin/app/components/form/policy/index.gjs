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
    @isOptional={{true}}
    @value={{@model.name}}
    @isInvalid={{@model.errors.name}}
    @type='text'
    name='name'
    disabled={{form.disabled}}
    {{on 'input' (set-from-event @model 'name')}}
    as |F|
  >
    <F.Label>{{t 'form.name.label'}}</F.Label>
    <F.HelperText>{{t 'form.name.help'}}</F.HelperText>
    {{#if @model.errors.name}}
      <F.Error as |E|>
        {{#each @model.errors.name as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Hds::Form::TextInput::Field>
  <Hds::Form::Textarea::Field
    @isOptional={{true}}
    @value={{@model.description}}
    @isInvalid={{@model.errors.description}}
    name='description'
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

  {{! retention policy }}
  <Form::Policy::PolicySelection
    @name='retention_policy'
    @disabled={{form.disabled}}
    @model={{@model}}
    @options={{this.listRententionOptions}}
    @customInputName='retain_for'
    @inputValue={{@model.retain_for.days}}
    @selectedOption={{this.selectRetentionPolicyType}}
  />

  {{! deletion policy }}
  <Form::Policy::PolicySelection
    @name='deletion_policy'
    @disabled={{form.disabled}}
    @model={{@model}}
    @options={{this.listDeletionOptions}}
    @customInputName='delete_after'
    @inputValue={{@model.delete_after.days}}
    @selectedOption={{this.selectDeletePolicyType}}
  />

  {{#if (can 'save model' @model)}}
    <form.actions
      @enableEditText={{t 'actions.edit-form'}}
      @submitText={{t 'actions.save'}}
      @cancelText={{t 'actions.cancel'}}
    />
  {{/if}}
</Rose::Form>