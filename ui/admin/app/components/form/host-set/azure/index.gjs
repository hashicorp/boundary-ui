{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

<Rose::Form
  @edit={{@edit}}
  @onSubmit={{@submit}}
  @cancel={{@cancel}}
  @disabled={{@model.isSaving}}
  @showEditToggle={{if @model.isNew false true}}
  as |form|
>

  <Hds::Form::TextInput::Field
    name='name'
    @value={{@model.name}}
    @isOptional={{true}}
    @isInvalid={{@model.errors.name}}
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

  <InfoField @value={{@model.type}} as |F|>
    <F.Label>{{t 'form.type.label'}}</F.Label>
  </InfoField>

  <InfoField @value={{t 'descriptions.provider'}} @icon='azure-color' as |F|>
    <F.Label>{{t 'titles.provider'}}</F.Label>
    <F.HelperText>
      {{t 'resources.host-catalog.types.azure'}}
    </F.HelperText>
  </InfoField>

  <Form::Field::ListWrapper
    @layout='horizontal'
    @isOptional={{true}}
    @disabled={{form.disabled}}
  >
    <:fieldset as |F|>
      <F.Legend>
        {{t 'resources.host-set.form.preferred_endpoints.label'}}
      </F.Legend>
      <F.HelperText>
        {{t 'resources.host-set.form.preferred_endpoints.help'}}
      </F.HelperText>

      {{#if @model.errors.preferred_endpoints}}
        <F.Error as |E|>
          {{#each @model.errors.preferred_endpoints as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </:fieldset>

    <:field as |F|>
      <F.TextInput
        @name='preferred_endpoints'
        @options={{@model.preferred_endpoints}}
        @model={{@model}}
      />
    </:field>
  </Form::Field::ListWrapper>

  <Hds::Form::Textarea::Field
    name='filter'
    @value={{@model.filter_string}}
    @isOptional={{true}}
    @isInvalid={{@model.errors.filter_string}}
    disabled={{form.disabled}}
    as |F|
  >
    <F.Label>{{t 'resources.host-set.form.filter.label'}}</F.Label>
    <F.HelperText>{{t
        'resources.host-set.form.filter.azure.help'
      }}</F.HelperText>
    {{#if @model.errors.filter_string}}
      <F.Error as |E|>
        {{#each @model.errors.filter_string as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Hds::Form::Textarea::Field>

  <Hds::Form::TextInput::Field
    name='sync_interval_seconds'
    @value={{@model.sync_interval_seconds}}
    @isInvalid={{@model.errors.sync_interval_seconds}}
    @isOptional={{true}}
    disabled={{form.disabled}}
    {{on 'input' (set-from-event @model 'sync_interval_seconds')}}
    as |F|
  >
    <F.Label>{{t 'form.sync-interval.label'}}</F.Label>
    <F.HelperText>
      {{t 'form.sync-interval.help'}}
      <Hds::Link::Inline @href={{doc-url 'host-set.sync-interval-seconds'}}>
        {{t 'actions.learn-more'}}
      </Hds::Link::Inline>
    </F.HelperText>
    {{#if @model.errors.sync_interval_seconds}}
      <F.Error as |E|>
        {{#each @model.errors.sync_interval_seconds as |error|}}
          <E.Message>{{error.message}}</E.Message>
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