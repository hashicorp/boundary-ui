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
          <E.Message data-test-error-message-name>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Hds::Form::TextInput::Field>

  <Hds::Form::Textarea::Field
    name='description'
    @isOptional={{true}}
    @value={{@model.description}}
    @isInvalid={{@model.errors.description}}
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

  <InfoField @value={{@model.address}} disabled={{form.disabled}} as |F|>
    <F.Label>{{t 'form.address.label'}}</F.Label>
    <F.HelperText>{{t 'form.worker_address.help'}}</F.HelperText>
  </InfoField>

  {{#let
    (relative-datetime-live @model.last_status_time)
    (format-date @model.last_status_time format='yymmddt')
    as |relativeDate customFormat|
  }}
    <InfoField
      @value={{if
        @model.last_status_time
        (concat relativeDate ', ' customFormat)
      }}
      readonly={{true}}
      as |F|
    >
      <F.Label>{{t 'form.worker_last_seen.label'}}</F.Label>
      <F.HelperText>{{t 'form.worker_last_seen.help'}}</F.HelperText>
    </InfoField>

  {{/let}}

  <InfoField @value={{@model.release_version}} readonly={{true}} as |F|>
    <F.Label>{{t 'form.worker_release_version.label'}}</F.Label>
    <F.HelperText>{{t 'form.worker_release_version.help'}}</F.HelperText>
  </InfoField>

  {{#if (can 'save worker' @model)}}
    <form.actions
      @enableEditText={{t 'actions.edit-form'}}
      @submitText={{t 'actions.save'}}
      @cancelText={{t 'actions.cancel'}}
    />
  {{/if}}
</Rose::Form>