/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Form from "rose/components/rose/form";
import InfoField from "admin/components/info-field/index";
import t from "ember-intl/helpers/t";
import Field from "@hashicorp/design-system-components/components/hds/form/text-input/field";
import { on } from "@ember/modifier";
import setFromEvent from "rose/helpers/set-from-event";
import Field0 from "@hashicorp/design-system-components/components/hds/form/textarea/field";
import Fieldset from "@hashicorp/design-system-components/components/hds/form/fieldset/index";
import { uniqueId, fn } from "@ember/helper";
import Table from "@hashicorp/design-system-components/components/hds/table/index";
import Button from "@hashicorp/design-system-components/components/hds/button/index";
import or from "ember-truth-helpers/helpers/or";
import not from "ember-truth-helpers/helpers/not";
import can from "admin/helpers/can";

export default class FormManagedGroupLdapComponent extends Component {
  // =attributes
  /**
   * @type {string}
   */
  @tracked newGroup = '';

  @action
  addGroupName() {
    if (this.newGroup) {
      this.args.addStringItem('group_names', this.newGroup);
    }
    this.newGroup = '';
  }
<template>
<Form @edit={{@edit}} @onSubmit={{@submit}} @cancel={{@cancel}} @disabled={{@model.isSaving}} @showEditToggle={{if @model.isNew false true}} as |form|>
  <InfoField @value={{@model.type}} disabled={{form.disabled}} as |F|>
    <F.Label>{{t "form.type.label"}}</F.Label>
  </InfoField>

  <Field @isOptional={{true}} name="name" @value={{@model.name}} @isInvalid={{@model.errors.name}} disabled={{form.disabled}} {{on "input" (setFromEvent @model "name")}} as |F|>
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

  <Fieldset @isRequired={{true}} as |F|>
    <F.Legend>{{t "resources.managed-group.form.group_names.label"}}</F.Legend>
    <F.HelperText>{{t "resources.managed-group.form.group_names.help"}}</F.HelperText>
    {{#let (uniqueId) as |valueHeaderID|}}
      <F.Control>
        <Table class="list-wrapper-field" name="group_names">
          <:head as |H|>
            <H.Tr>
              <H.Th id={{valueHeaderID}}>{{t "titles.value"}}</H.Th>
              <H.Th>{{t "titles.actions"}}</H.Th>
            </H.Tr>
          </:head>
          <:body as |B|>
            {{#each @model.group_names as |group i|}}
              <B.Tr>
                <B.Td>
                  <Field @value={{group.value}} disabled={{form.disabled}} aria-labelledby={{valueHeaderID}} {{on "input" (setFromEvent group "value")}} />
                </B.Td>
                <B.Td>
                  <Button @text={{t "actions.remove"}} @color="critical" @icon="trash" @isIconOnly={{true}} disabled={{form.disabled}} {{on "click" (fn @removeItemByIndex "group_names" i)}} />
                </B.Td>
              </B.Tr>
            {{/each}}
            <B.Tr>
              <B.Td>
                <Field @value={{this.newGroup}} @type="text" disabled={{form.disabled}} aria-labelledby={{valueHeaderID}} {{on "input" (setFromEvent this "newGroup")}} />
              </B.Td>
              <B.Td>
                <Button @text={{t "actions.add"}} @color="secondary" disabled={{or form.disabled (not this.newGroup)}} {{on "click" this.addGroupName}} />
              </B.Td>
            </B.Tr>
          </:body>
        </Table>
      </F.Control>
    {{/let}}
    {{#if @model.errors.group_names}}
      <F.Error as |E|>
        {{#each @model.errors.group_names as |error|}}
          <E.Message data-test-error-message-group-names>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Fieldset>

  {{#if (can "save model" @model)}}
    <form.actions @enableEditText={{t "actions.edit-form"}} @submitText={{t "actions.save"}} @cancelText={{t "actions.cancel"}} />
  {{/if}}

</Form></template>}
