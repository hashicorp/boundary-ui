/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import Form from "rose/components/rose/form";
import Field from "@hashicorp/design-system-components/components/hds/form/select/field";
import { on } from "@ember/modifier";
import t from "ember-intl/helpers/t";
import eq from "ember-truth-helpers/helpers/eq";
import Standalone from "@hashicorp/design-system-components/components/hds/link/standalone";

export default class FormAddStoragePolicyIndexComponent extends Component {
  //actions

  /**
   * select storage policy
   */
  @action
  selectPolicy({ target: { value: policyId } }) {
    this.args.model.storage_policy_id = policyId;
  }
<template>{{!--
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
--}}

<Form class="full-width" @onSubmit={{@submit}} @cancel={{@cancel}} as |form|>
  <Field class="select-policy" @isRequired={{true}} @isInvalid={{@model.errors.storage_policy_id}} @value={{@model.storage_policy_id}} @type="text" @width="30%" name="policy_id" {{on "change" this.selectPolicy}} as |F|>
    <F.Label>{{t "resources.policy.title"}}</F.Label>
    <F.HelperText>
      {{t "resources.policy.actions.apply"}}
    </F.HelperText>
    <F.Options>
      <option disabled hidden selected value>{{t "titles.choose-an-option"}}</option>
      {{#each @policyList as |policy|}}
        <option value={{policy.id}} selected={{eq @model.storage_policy_id policy.id}}>
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
  </Field>

  <Standalone class="add-policy-link" @color="primary" @icon="plus" @text={{t "resources.policy.actions.new"}} @route="scopes.scope.add-storage-policy.create" />
  <form.actions @enableEditText={{t "actions.edit-form"}} @submitText={{t "actions.save"}} @cancelText={{t "actions.cancel"}} />

</Form></template>}
