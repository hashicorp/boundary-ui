/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { set } from '@ember/object';
import Table from "@hashicorp/design-system-components/components/hds/table/index";
import Field from "@hashicorp/design-system-components/components/hds/form/text-input/field";
import t from "ember-intl/helpers/t";
import { on } from "@ember/modifier";
import setFromEvent from "rose/helpers/set-from-event";
import Button from "@hashicorp/design-system-components/components/hds/button/index";
import { fn } from "@ember/helper";
import or from "ember-truth-helpers/helpers/or";
import not from "ember-truth-helpers/helpers/not";

export default class MappingListTextInputComponent extends Component {
  // =attributes

  /**
   * @type {string}
   */
  @tracked newOptionValue = '';

  // =actions

  /**
   * If a new input is entered and an addOption method was specified,
   * calls addOption with the new input. Resets previous value.
   * Otherwise use the model argument to create the array and update the model
   */

  @action
  addOption() {
    if (this.args.addOption) {
      if (this.newOptionValue) {
        this.args.addOption({
          value: this.newOptionValue,
        });
      }
    } else {
      const field = this.args.name;
      const existingArray = this.args.model[field] ?? [];
      const newArray = [...existingArray, { value: this.newOptionValue }];
      set(this.args.model, field, newArray);
    }

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
<Table class="list-wrapper-field" name={{@name}}>

  <:body as |B|>

    {{#each @options as |option index|}}
      <B.Tr>
        <B.Td>
          <Field @value={{option.value}} @type="text" disabled={{@disabled}} aria-label={{t "titles.value"}} {{on "input" (setFromEvent option "value")}} />
        </B.Td>

        <B.Td>
          {{#if this.removeOptionByIndex}}
            <Button data-test-remove-button @text={{t "actions.remove"}} @color="critical" @icon="trash" @isIconOnly={{true}} disabled={{@disabled}} {{on "click" (fn this.removeOptionByIndex index)}} />
          {{/if}}
        </B.Td>
      </B.Tr>
    {{/each}}

    <B.Tr>

      <B.Td>
        <Field @value={{this.newOptionValue}} @type="text" disabled={{@disabled}} aria-label={{t "titles.value"}} {{on "input" (setFromEvent this "newOptionValue")}} />
      </B.Td>

      <B.Td>
        <Button @text={{t "actions.add"}} @color="secondary" type="button" disabled={{or @disabled (not this.newOptionValue)}} {{on "click" this.addOption}} />
      </B.Td>
    </B.Tr>

  </:body>
</Table></template>}
