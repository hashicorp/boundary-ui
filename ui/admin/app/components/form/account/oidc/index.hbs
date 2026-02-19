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
  <InfoField @value={{@model.type}} readonly={{true}} as |F|>
    <F.Label>{{t 'form.type.label'}}</F.Label>
  </InfoField>

  {{#unless @model.isNew}}

    <InfoField @value={{@model.issuer}} readonly={{true}} as |F|>
      <F.Label>{{t 'form.issuer.label'}}</F.Label>
    </InfoField>

    <InfoField @value={{@model.subject}} readonly={{true}} as |F|>
      <F.Label>{{t 'form.subject.label'}}</F.Label>
    </InfoField>

    <InfoField @value={{@model.email}} readonly={{true}} as |F|>
      <F.Label>{{t 'form.email.label'}}</F.Label>
    </InfoField>

    <InfoField @value={{@model.full_name}} readonly={{true}} as |F|>
      <F.Label>{{t 'form.full_name.label'}}</F.Label>
    </InfoField>
  {{/unless}}

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
          <E.Message data-test-error-message-name>{{error.message}}</E.Message>
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

  {{#if @model.isNew}}
    <Hds::Form::TextInput::Field
      name='issuer'
      @value={{@model.issuer}}
      @isInvalid={{@model.errors.issuer}}
      disabled={{form.disabled}}
      {{on 'input' (set-from-event @model 'issuer')}}
      as |F|
    >
      <F.Label>{{t 'form.issuer.label'}}</F.Label>
      {{#if @model.errors.issuer}}
        <F.Error as |E|>
          {{#each @model.errors.issuer as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </Hds::Form::TextInput::Field>

    <Hds::Form::TextInput::Field
      name='subject'
      @value={{@model.subject}}
      @isInvalid={{@model.errors.subject}}
      disabled={{form.disabled}}
      {{on 'input' (set-from-event @model 'subject')}}
      as |F|
    >
      <F.Label>{{t 'form.subject.label'}}</F.Label>
      {{#if @model.errors.subject}}
        <F.Error as |E|>
          {{#each @model.errors.subject as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </Hds::Form::TextInput::Field>
  {{/if}}

  {{#if (can 'save model' @model)}}
    <form.actions
      @enableEditText={{t 'actions.edit-form'}}
      @submitText={{t 'actions.save'}}
      @cancelText={{t 'actions.cancel'}}
    />
  {{/if}}

</Rose::Form>