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

    <Hds::Form::RadioCard::Group @name={{t 'form.type.label'}} as |G|>
      <G.Legend>{{t 'form.type.label'}}</G.Legend>
      {{#each @hostCatalogTypes as |hostCatalogType|}}
        <G.RadioCard
          @value={{hostCatalogType}}
          @maxWidth='20rem'
          @checked={{eq hostCatalogType @model.type}}
          {{on 'input' (fn @changeType hostCatalogType)}}
          as |R|
        >
          <R.Label>{{t
              (concat 'resources.host-catalog.types.' hostCatalogType)
            }}</R.Label>
          <R.Description>{{t
              (concat 'resources.host-catalog.help.' hostCatalogType)
            }}</R.Description>
        </G.RadioCard>
      {{/each}}
    </Hds::Form::RadioCard::Group>
  {{/if}}

  {{#if (can 'save model' @model)}}
    <form.actions
      @enableEditText={{t 'actions.edit-form'}}
      @submitText={{t 'actions.save'}}
      @cancelText={{t 'actions.cancel'}}
    />
  {{/if}}
</Rose::Form>