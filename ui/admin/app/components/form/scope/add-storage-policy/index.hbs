{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

<Rose::Form
  class='full-width'
  @onSubmit={{@submit}}
  @cancel={{@cancel}}
  as |form|
>
  <Hds::Form::Select::Field
    class='select-policy'
    @isRequired={{true}}
    @isInvalid={{@model.errors.storage_policy_id}}
    @value={{@model.storage_policy_id}}
    @type='text'
    @width='30%'
    name='policy_id'
    {{on 'change' this.selectPolicy}}
    as |F|
  >
    <F.Label>{{t 'resources.policy.title'}}</F.Label>
    <F.HelperText>
      {{t 'resources.policy.actions.apply'}}
    </F.HelperText>
    <F.Options>
      <option disabled hidden selected value=''>{{t
          'titles.choose-an-option'
        }}</option>
      {{#each @policyList as |policy|}}
        <option
          value={{policy.id}}
          selected={{eq @model.storage_policy_id policy.id}}
        >
          {{policy.displayName}}
        </option>
      {{/each}}
    </F.Options>
    {{#if @model.errors.storage_policy_id}}
      <F.Error as |E|>
        {{#each @model.errors.storage_policy_id as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Hds::Form::Select::Field>

  <Hds::Link::Standalone
    class='add-policy-link'
    @color='primary'
    @icon='plus'
    @text={{t 'resources.policy.actions.new'}}
    @route='scopes.scope.add-storage-policy.create'
  />
  <form.actions
    @enableEditText={{t 'actions.edit-form'}}
    @submitText={{t 'actions.save'}}
    @cancelText={{t 'actions.cancel'}}
  />

</Rose::Form>