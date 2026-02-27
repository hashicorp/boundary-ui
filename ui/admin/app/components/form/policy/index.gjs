/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';

const RETENTION_POLICY = {
  forever: -1,
  custom: 1,
  do_not_protect: 0,
  soc: 2555,
  hipaa: 2190,
};

const DELETION_POLICY = { do_not_delete: 0, custom: 1 };

export default class FormPolicyComponent extends Component {
  //attributes

  //methods

  /**
   * Returns retention policy options list
   * @type {array}
   */
  get listRententionOptions() {
    return RETENTION_POLICY;
  }

  /**
   * Returns deletion policy options list, if the retain days are -1 (forever)
   * then we should force the delete option to be do not delete
   * @type {array}
   */
  get listDeletionOptions() {
    if (this.args.model.retain_for?.days < 0) {
      return { do_not_delete: 0 };
    } else {
      return DELETION_POLICY;
    }
  }

  /**
   * Returns policy type
   * API doesn't return days for do_not_protect,
   * so we set option to do_not_protect when there's no retain days
   * @type {string}
   */
  get selectRetentionPolicyType() {
    if (!this.args.model.retain_for?.days) return 'do_not_protect';

    const val = Object.keys(RETENTION_POLICY).find(
      (i) => RETENTION_POLICY[i] === this.args.model.retain_for?.days,
    );
    return val || 'custom';
  }

  /**
   * Returns policy type
   * @type {string}
   */
  get selectDeletePolicyType() {
    return this.args.model.delete_after?.days > 0 ? 'custom' : 'do_not_delete';
  }
}

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