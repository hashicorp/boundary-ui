/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { computed, action } from '@ember/object';
import can from "admin/helpers/can";
import Form from "rose/components/rose/form";
import { fn } from "@ember/helper";
import KeyValue from "rose/components/rose/list/key-value";
import Label from "@hashicorp/design-system-components/components/hds/form/label/index";
import t from "ember-intl/helpers/t";
import Field from "@hashicorp/design-system-components/components/hds/form/text-input/field";
import { on } from "@ember/modifier";
import setFromEvent from "rose/helpers/set-from-event";
import Button from "@hashicorp/design-system-components/components/hds/button/index";

export default class FormRoleGrantsComponent extends Component {
  // =attributes

  /**
   * @type {string}
   */
  @tracked newGrantString = '';

  /**
   * Returns grants currently on model, in addition to
   * grants added (or deleted) interactively by user -
   * before form submission
   * @return {[string]}
   */
  @computed('args.model.grant_strings.[]')
  get grants() {
    return this.args.model.grant_strings.map((value) => ({ value }));
  }

  /**
   * Returns grants after form submission
   * @return {[object]}
   */
  @computed('grants.@each.value')
  get grantStrings() {
    return this.grants.map((obj) => obj.value);
  }

  /**
   * True if the grant string field is empty, false otherwise.  This is used
   * to disable the submit button.
   * @return {boolean}
   */
  @computed('newGrantString')
  get cannotSave() {
    return !this.newGrantString;
  }

  // =actions

  /**
   * Calls the passed function with the grant string as an argument and then
   * clears the value of the grant string field.
   * `@addGrant` should be passed by the context calling this component.
   * @param {Function} addGrantFn
   */
  @action
  createGrant(addGrantFn) {
    addGrantFn(this.newGrantString);
    this.newGrantString = '';
  }
<template>
{{#if (can "setGrants role" @model)}}
  <Form @onSubmit={{fn this.createGrant @addGrant}} @cancel={{@cancel}} @disabled={{@model.isSaving}}>
    <KeyValue as |list|>
      {{!-- Add grant field (only one per form) --}}
      <list.item as |item|>
        <item.key>
          <Label @controlId="add-grant">
            {{t "resources.role.grant.actions.create"}}
          </Label>
        </item.key>
        <item.cell>
          <Field {{on "input" (setFromEvent this "newGrantString")}} name="grant" title={{t "form.grant.help"}} @id="add-grant" @type="text" @value={{this.newGrantString}} />
        </item.cell>
        <item.cell>
          <Button disabled={{this.cannotSave}} type="submit" @color="secondary" @text={{t "actions.add"}} />
        </item.cell>
      </list.item>
    </KeyValue>
  </Form>
{{/if}}

<Form @onSubmit={{fn @submit this.grantStrings}} @cancel={{@cancel}} @disabled={{@model.isSaving}} as |form|>

  <KeyValue as |list|>
    {{#each this.grants as |grant index|}}
      <list.item as |item|>
        <item.key>
          <Label @controlId="update-grant-{{index}}">
            {{t "form.grant.label"}}
          </Label>
        </item.key>
        <item.cell>
          <Field {{on "input" (setFromEvent grant "value")}} name="grant" title={{t "form.grant.help"}} disabled={{if (can "setGrants role" @model) false true}} @id="update-grant-{{index}}" @type="text" @value={{grant.value}} @error={{@model.errors.grant_strings}} />
        </item.cell>
        <item.cell>
          {{#if (can "setGrants role" @model)}}
            <Button {{on "click" (fn @removeGrant grant.value)}} type="button" @color="secondary" @icon="trash" @isIconOnly={{true}} @text={{t "actions.remove"}} />
          {{/if}}
        </item.cell>
      </list.item>
    {{/each}}
  </KeyValue>

  {{#if (can "setGrants role" @model)}}
    <form.actions @submitText={{t "actions.save"}} @cancelText={{t "actions.cancel"}} />
  {{/if}}

</Form></template>}
