/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { set } from '@ember/object';
import { uniqueId, fn } from "@ember/helper";
import Table from "@hashicorp/design-system-components/components/hds/table/index";
import t from "ember-intl/helpers/t";
import Base from "@hashicorp/design-system-components/components/hds/form/select/base";
import { on } from "@ember/modifier";
import eq from "ember-truth-helpers/helpers/eq";
import Field from "@hashicorp/design-system-components/components/hds/form/text-input/field";
import Button from "@hashicorp/design-system-components/components/hds/button/index";
import setFromEvent from "rose/helpers/set-from-event";
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
   * Returns an object of key/value pair that the user enters
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
    if (this.args.removeDuplicates) {
      return (
        Object.keys(this.options || {}).length !==
        Object.keys(this.args.selectOptions || {}).length
      );
    } else {
      return true;
    }
  }

  /**
   * Prevents users from selecting duplicate keys from the select list if there's the arg is set to true
   * @type {object}
   */
  get selectOptions() {
    const previouslySelectedKeys = Object.keys(this.options || {});
    if (this.args.removeDuplicates && previouslySelectedKeys.length) {
      const newObj = { ...this.args.selectOptions };
      for (const key of Object.keys(newObj)) {
        if (previouslySelectedKeys.includes(key)) {
          delete newObj[key];
        }
      }
      return newObj;
    } else {
      return this.args.selectOptions;
    }
  }
  // =actions

  /**
   * Handles when then user makes changes to the select list
   * @param oldkey {string}
   * @param oldVal {string}
   */
  @action
  selectChange(oldkey, oldVal, { target: { value: newKey } }) {
    const field = this.args.name;
    const newObj = { ...this.args.model[field], [newKey]: oldVal };
    delete newObj[oldkey];
    set(this.args.model, field, newObj);
  }

  /**
   * Handles input changes
   * @param key {string}
   */
  @action
  updateInput(key, { target: { value: newValue } }) {
    const field = this.args.name;
    this.args.model[field] = {
      ...this.args.model[field],
      [key]: newValue,
    };
  }

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
      this.args.model[field] = {
        ...this.args.model[field],
        [this.newOptionKey]: this.newOptionValue,
      };
    }

    this.newOptionKey = '';
    this.newOptionValue = '';
  }

  /**
   * If removeOptionByIndex method was passed, use that.
   * Otherwise, use the model to remove an option by key
   * @param index {number}
   */
  @action
  removeOptionByKey(selectedKey) {
    if (this.args.removeOptionByKey) {
      this.args.removeOptionByKey(selectedKey);
    } else {
      const field = this.args.name;
      const newObj = { ...this.args.model[field] };
      delete newObj[selectedKey];
      set(this.args.model, field, newObj);
    }
  }
<template>
{{#let (uniqueId) (uniqueId) as |keyHeaderID valueHeaderID|}}
  <Table class="list-wrapper-field" name={{@name}}>
    <:head as |H|>
      <H.Tr>
        <H.Th id={{keyHeaderID}}>{{t "form.key.label"}}</H.Th>
        <H.Th id={{valueHeaderID}}>{{t "form.value.label"}}</H.Th>
        <H.Th>
          {{t "titles.actions"}}

        </H.Th>
      </H.Tr>
    </:head>
    <:body as |B|>
      {{#each-in this.options as |select val|}}
        <B.Tr>
          <B.Td>
            <Base @value={{select}} disabled={{@disabled}} @width={{@width}} aria-labelledby={{keyHeaderID}} {{on "change" (fn this.selectChange select val)}} as |F|>
              <F.Options>
                {{#each-in @selectOptions as |key value|}}
                  <option value={{key}} selected={{eq select key}}>
                    {{value}}
                  </option>
                {{/each-in}}
              </F.Options>
            </Base>
          </B.Td>

          <B.Td>
            <Field @value={{val}} @type="text" @width={{@width}} disabled={{@disabled}} aria-labelledby={{valueHeaderID}} {{on "change" (fn this.updateInput select)}} />
          </B.Td>

          <B.Td>
            {{#if this.removeOptionByKey}}
              <Button data-test-remove-button={{select}} @text={{t "actions.remove"}} @color="critical" @icon="trash" @isIconOnly={{true}} disabled={{@disabled}} {{on "click" (fn this.removeOptionByKey select)}} />
            {{/if}}
          </B.Td>
        </B.Tr>
      {{/each-in}}

      {{#if this.showNewRow}}
        <B.Tr>
          <B.Td>
            <Base @value={{this.newOptionKey}} disabled={{@disabled}} aria-labelledby={{keyHeaderID}} @width={{@width}} {{on "change" (setFromEvent this "newOptionKey")}} as |F|>
              <F.Options>

                <option hidden selected value>
                  {{t "titles.choose-an-option"}}
                </option>
                {{#each-in this.selectOptions as |key value|}}
                  <option value={{key}} selected={{eq key this.newOptionKey}}>
                    {{value}}
                  </option>
                {{/each-in}}
              </F.Options>
            </Base>
          </B.Td>

          <B.Td>
            <Field @value={{this.newOptionValue}} @type="text" @width={{@width}} disabled={{@disabled}} aria-labelledby={{valueHeaderID}} {{on "input" (setFromEvent this "newOptionValue")}} />
          </B.Td>

          <B.Td>
            <Button data-test-select-text-add-btn @text={{t "actions.add"}} @color="secondary" type="button" disabled={{or @disabled (not this.newOptionKey)}} {{on "click" this.addOption}} />
          </B.Td>
        </B.Tr>
      {{/if}}
    </:body>
  </Table>
{{/let}}</template>}
