/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { set } from '@ember/object';
import Table from "@hashicorp/design-system-components/components/hds/table/index";
import Base from "@hashicorp/design-system-components/components/hds/form/select/base";
import t from "ember-intl/helpers/t";
import { on } from "@ember/modifier";
import setFromEvent from "rose/helpers/set-from-event";
import eq from "ember-truth-helpers/helpers/eq";
import Button from "@hashicorp/design-system-components/components/hds/button/index";
import { fn } from "@ember/helper";
import or from "ember-truth-helpers/helpers/or";
import not from "ember-truth-helpers/helpers/not";

export default class MappingListSelectComponent extends Component {
  // =attributes

  /**
   * @type {string}
   */
  @tracked newOptionValue = '';

  get options() {
    return this.args.options || this.args.model[this.args.name];
  }

  /**
   * If a new input is entered and an addOption method was specified,
   * calls addOption with the new input. Resets previous value.
   * Otherwise use the model argument to create the array and update the model
   */

  @action
  addOption() {
    if (this.args.addOption && this.newOptionValue) {
      this.args.addOption({
        value: this.newOptionValue,
      });
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
<template>{{!--
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
--}}

<Table class="list-wrapper-field" name={{@name}}>

  <:body as |B|>

    {{#each this.options as |select index|}}
      <B.Tr>
        <B.Td>
          <Base @value={{select.value}} @width={{@width}} disabled={{@disabled}} aria-label={{t "titles.value"}} {{on "change" (setFromEvent select "value")}} as |F|>
            <F.Options>
              {{#each @selectOptions as |selectOption|}}
                <option value={{selectOption}} selected={{eq select.value selectOption}}>
                  {{selectOption}}
                </option>
              {{/each}}
            </F.Options>
          </Base>
        </B.Td>

        <B.Td>
          {{#if this.removeOptionByIndex}}
            <Button data-test-remove-option-button={{select.value}} @text={{t "actions.remove"}} @color="critical" @icon="trash" @isIconOnly={{true}} disabled={{@disabled}} {{on "click" (fn this.removeOptionByIndex index)}} />
          {{/if}}
        </B.Td>
      </B.Tr>
    {{/each}}

    <B.Tr>
      <B.Td>
        <Base @value={{this.newOptionValue}} @width={{@width}} disabled={{@disabled}} aria-label={{t "titles.value"}} {{on "change" (setFromEvent this "newOptionValue")}} as |F|>

          <F.Options>
            <option disabled={{@disabled}} hidden selected value>
              {{t "titles.choose-an-option"}}
            </option>
            {{#each @selectOptions as |selectOption|}}
              <option value={{selectOption}} selected={{eq selectOption this.newOptionValue}}>
                {{selectOption}}
              </option>
            {{/each}}
          </F.Options>

        </Base>
      </B.Td>

      <B.Td>
        <Button data-test-add-option-button @text={{t "actions.add"}} @color="secondary" type="button" disabled={{or @disabled (not this.newOptionValue)}} {{on "click" this.addOption}} />
      </B.Td>
    </B.Tr>
  </:body>
</Table></template>}
