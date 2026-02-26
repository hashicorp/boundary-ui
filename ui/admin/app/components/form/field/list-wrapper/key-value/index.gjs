/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { set } from '@ember/object';
import { uniqueId, hash, fn } from "@ember/helper";
import Table from "@hashicorp/design-system-components/components/hds/table/index";
import t from "ember-intl/helpers/t";
import FormFieldListWrapperKeyValueText from "admin/components/form/field/list-wrapper/key-value/text";
import setFromEvent from "rose/helpers/set-from-event";
import FormFieldListWrapperKeyValueSelect from "admin/components/form/field/list-wrapper/key-value/select";
import Button from "@hashicorp/design-system-components/components/hds/button/index";
import { on } from "@ember/modifier";
import or from "ember-truth-helpers/helpers/or";
import not from "ember-truth-helpers/helpers/not";

export default class MappingListComponent extends Component {
  // =attributes

  /**
   * @type {string}
   */
  @tracked newOptionKey = '';

  /**
   * @type {string}
   */
  @tracked newOptionValue = '';

  /**
   * Returns an array of key/value pair that the user enters
   * @type {object}
   */

  get options() {
    return this.args?.options || this.args?.model?.[this.args.name];
  }

  /**
   * Determines if we need to show an empty row to the users to enter more key/value pairs based on removeDuplicates arg,
   * by default it is true
   * @type {object}
   */
  get showNewRow() {
    if (this.args.showNewRow) {
      return this.args.showNewRow();
    } else {
      return true;
    }
  }

  // =actions

  /**
   * If a new key value is entered and an addOption method was specified,
   * calls addOption with the new key and value. Resets key and value.
   * Otherwise use the model argument to create the array and update the model
   */

  @action
  addOption() {
    if (this.args.addOption) {
      if (this.newOptionKey) {
        this.args.addOption({
          key: this.newOptionKey,
          value: this.newOptionValue,
        });
      }
    } else {
      const field = this.args.name;
      const existingArray = this.args.model[field] ?? [];

      const newArray = [
        ...existingArray,
        { key: this.newOptionKey, value: this.newOptionValue },
      ];
      set(this.args.model, field, newArray);
    }

    this.newOptionKey = '';
    this.newOptionValue = '';
  }

  /**
   * If removeOptionByIndex method was passed, use that.
   * Otherwise, use the model to remove an option by index. We recreate a new array after
   * splicing out the item so that ember is aware that the array has been modified.
   * @param index {number}
   */
  @action
  removeOptionByIndex(index) {
    if (this.args.removeOptionByIndex) {
      this.args.removeOptionByIndex(index);
    } else {
      const field = this.args.name;
      const newArray = this.args.model[field].filter((_, i) => i !== index);
      set(this.args.model, field, newArray);
    }
  }
<template>
{{#let (uniqueId) (uniqueId) as |keyHeaderID valueHeaderID|}}
  <Table class="list-wrapper-field" name={{@name}}>
    <:head as |H|>
      <H.Tr>
        <H.Th id={{keyHeaderID}}>
          {{#if @keyLabel}}
            {{@keyLabel}}
          {{else}}
            {{t "form.key.label"}}
          {{/if}}</H.Th>
        <H.Th id={{valueHeaderID}}>
          {{#if @valueLabel}}
            {{@valueLabel}}
          {{else}}
            {{t "form.value.label"}}
          {{/if}}
        </H.Th>
        <H.Th>
          {{t "titles.actions"}}
        </H.Th>
      </H.Tr>
    </:head>
    <:body as |B|>
      {{#each this.options as |option index|}}
        <B.Tr>
          <B.Td>
            {{yield (hash text=(component FormFieldListWrapperKeyValueText disabled=@disabled value=option.key ariaLabelledBy=keyHeaderID setContext=(setFromEvent option "key")) select=(component FormFieldListWrapperKeyValueSelect disabled=@disabled value=option.key ariaLabelledBy=keyHeaderID setContext=(setFromEvent option "key") width=@width)) to="key"}}
          </B.Td>

          <B.Td>
            {{yield (hash text=(component FormFieldListWrapperKeyValueText disabled=@disabled value=option.value ariaLabelledBy=valueHeaderID setContext=(setFromEvent option "value")) select=(component FormFieldListWrapperKeyValueSelect disabled=@disabled value=option.value ariaLabelledBy=valueHeaderID width=@width setContext=(setFromEvent option "value"))) to="value"}}
          </B.Td>

          <B.Td>
            {{#if this.removeOptionByIndex}}
              <Button data-test-remove-button @text={{t "actions.remove"}} @color="critical" @icon="trash" @isIconOnly={{true}} disabled={{@disabled}} {{on "click" (fn this.removeOptionByIndex index)}} />
            {{/if}}
          </B.Td>
        </B.Tr>
      {{/each}}
      {{#if this.showNewRow}}
        <B.Tr>
          <B.Td>
            {{#if (has-block "newKey")}}
              {{yield (hash text=(component FormFieldListWrapperKeyValueText disabled=@disabled value=this.newOptionKey ariaLabelledBy=keyHeaderID setContext=(setFromEvent this "newOptionKey")) select=(component FormFieldListWrapperKeyValueSelect disabled=@disabled value=this.newOptionKey ariaLabelledBy=keyHeaderID width=@width setContext=(setFromEvent this "newOptionKey"))) to="newKey"}}

            {{else}}
              {{yield (hash text=(component FormFieldListWrapperKeyValueText disabled=@disabled value=this.newOptionKey ariaLabelledBy=keyHeaderID setContext=(setFromEvent this "newOptionKey")) select=(component FormFieldListWrapperKeyValueSelect disabled=@disabled value=this.newOptionKey ariaLabelledBy=keyHeaderID width=@width setContext=(setFromEvent this "newOptionKey"))) to="key"}}
            {{/if}}
          </B.Td>

          <B.Td>
            {{#if (has-block "newValue")}}
              {{yield (hash text=(component FormFieldListWrapperKeyValueText disabled=@disabled value=this.newOptionValue ariaLabelledBy=valueHeaderID setContext=(setFromEvent this "newOptionValue")) select=(component FormFieldListWrapperKeyValueSelect disabled=@disabled value=this.newOptionValue ariaLabelledBy=valueHeaderID width=@width setContext=(setFromEvent this "newOptionValue"))) to="newValue"}}

            {{else}}
              {{yield (hash text=(component FormFieldListWrapperKeyValueText disabled=@disabled value=this.newOptionValue ariaLabelledBy=valueHeaderID setContext=(setFromEvent this "newOptionValue")) select=(component FormFieldListWrapperKeyValueSelect disabled=@disabled value=this.newOptionValue ariaLabelledBy=valueHeaderID width=@width setContext=(setFromEvent this "newOptionValue"))) to="value"}}
            {{/if}}
          </B.Td>

          <B.Td>

            <Button @text={{t "actions.add"}} @color="secondary" type="button" disabled={{or @disabled (not this.newOptionKey)}} {{on "click" this.addOption}} />
          </B.Td>
        </B.Tr>
      {{/if}}
    </:body>
  </Table>
{{/let}}</template>}
