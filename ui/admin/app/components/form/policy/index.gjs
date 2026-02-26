/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import Form from "rose/components/rose/form";
import Field from "@hashicorp/design-system-components/components/hds/form/text-input/field";
import { on } from "@ember/modifier";
import setFromEvent from "rose/helpers/set-from-event";
import t from "ember-intl/helpers/t";
import Field0 from "@hashicorp/design-system-components/components/hds/form/textarea/field";
import PolicySelection from "admin/components/form/policy/policy-selection/index";
import can from "admin/helpers/can";

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
<template>
<Form @onSubmit={{@submit}} @cancel={{@cancel}} @disabled={{@model.isSaving}} @showEditToggle={{if @model.isNew false true}} as |form|>
  <Field @isOptional={{true}} @value={{@model.name}} @isInvalid={{@model.errors.name}} @type="text" name="name" disabled={{form.disabled}} {{on "input" (setFromEvent @model "name")}} as |F|>
    <F.Label>{{t "form.name.label"}}</F.Label>
    <F.HelperText>{{t "form.name.help"}}</F.HelperText>
    {{#if @model.errors.name}}
      <F.Error as |E|>
        {{#each @model.errors.name as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field>
  <Field0 @isOptional={{true}} @value={{@model.description}} @isInvalid={{@model.errors.description}} name="description" disabled={{form.disabled}} as |F|>
    <F.Label>{{t "form.description.label"}}</F.Label>
    <F.HelperText>{{t "form.description.help"}}</F.HelperText>
    {{#if @model.errors.description}}
      <F.Error as |E|>
        {{#each @model.errors.description as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field0>

  {{!-- retention policy --}}
  <PolicySelection @name="retention_policy" @disabled={{form.disabled}} @model={{@model}} @options={{this.listRententionOptions}} @customInputName="retain_for" @inputValue={{@model.retain_for.days}} @selectedOption={{this.selectRetentionPolicyType}} />

  {{!-- deletion policy --}}
  <PolicySelection @name="deletion_policy" @disabled={{form.disabled}} @model={{@model}} @options={{this.listDeletionOptions}} @customInputName="delete_after" @inputValue={{@model.delete_after.days}} @selectedOption={{this.selectDeletePolicyType}} />

  {{#if (can "save model" @model)}}
    <form.actions @enableEditText={{t "actions.edit-form"}} @submitText={{t "actions.save"}} @cancelText={{t "actions.cancel"}} />
  {{/if}}
</Form></template>}
