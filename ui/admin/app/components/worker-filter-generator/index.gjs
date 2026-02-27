/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Field from "@hashicorp/design-system-components/components/hds/form/field/index";
import CodeEditor from "rose/components/rose/code-editor";
import { get, fn, hash, array, uniqueId, concat } from "@ember/helper";
import or from "ember-truth-helpers/helpers/or";
import Separator from "@hashicorp/design-system-components/components/hds/separator/index";
import Field0 from "@hashicorp/design-system-components/components/hds/form/toggle/field";
import { on } from "@ember/modifier";
import t from "ember-intl/helpers/t";
import Group from "@hashicorp/design-system-components/components/hds/form/radio/group";
import Inline from "@hashicorp/design-system-components/components/hds/link/inline";
import docUrl from "core/helpers/doc-url";
import eq from "ember-truth-helpers/helpers/eq";
import Fieldset from "@hashicorp/design-system-components/components/hds/form/fieldset/index";
import Field1 from "@hashicorp/design-system-components/components/hds/form/text-input/field";
import setFromEvent from "rose/helpers/set-from-event";
import Field2 from "@hashicorp/design-system-components/components/hds/form/select/field";
import Body from "@hashicorp/design-system-components/components/hds/text/body";
import Base from "@hashicorp/design-system-components/components/hds/form/text-input/base";
import Button from "@hashicorp/design-system-components/components/hds/copy/button/index";

export default class WorkerFilterGeneratorIndexComponent extends Component {
  // =attributes

  generatorTagType = 'tag';
  generatorNameType = 'name';
  operatorOptions = ['==', 'matches', 'contains'];
  @tracked showFilterGenerator = this.defaultShowFilterGenerator;
  @tracked selectedGeneratorType = this.generatorTagType;
  @tracked key = '';
  @tracked value = '';
  @tracked operator = '';

  /**
   * @type {string}
   */
  get defaultShowFilterGenerator() {
    return this.args.showFilterGenerator;
  }

  /**
   * @return {string}
   */
  get generatedResult() {
    let valueResult = this.value ? `"${this.value}"` : '';
    if (this.selectedGeneratorType === 'tag') {
      let keyResult = this.key ? `"/tags/${this.key}"` : '';
      return keyResult || valueResult ? `${valueResult} in ${keyResult}` : '';
    } else {
      return valueResult || this.operator
        ? `"/name" ${this.operator} ${valueResult}`
        : '';
    }
  }

  // =actions

  /**
   * Sets the model filter to the passed in value.
   * @param {Model} model
   * @param {string} filter
   * @param {string} value
   */
  @action
  setWorkerFilter(model, filter, value) {
    model[filter] = value;
  }

  /**
   * Toggles showFilterGenerator attribute to true or false.
   */
  @action
  toggleFilterGenerator() {
    this.showFilterGenerator = !this.showFilterGenerator;
  }

  /**
   * Clears out key, value, and operator.
   * Sets selectedGeneratorType to a value.
   * @param {object} event
   */
  @action
  setGeneratorType(event) {
    this.key = '';
    this.value = '';
    this.operator = '';
    this.selectedGeneratorType = event.target.value;
  }
<template>
<Field as |F|>
  <F.Control>
    <CodeEditor as |c|>
      {{#unless @hideToolbar}}
        <c.toolbar @copyText={{get @model @name}} />
      {{/unless}}
      <c.fieldEditor @onInput={{fn this.setWorkerFilter @model @name}} @value={{or (get @model @name) ""}} @options={{hash mode="text/x-sh" gutters=(array "CodeMirror-lint-markers") lint="true"}} />
    </CodeEditor>
  </F.Control>
  {{#if (get @model.errors @name)}}
    <F.Error data-test-worker-filter-error as |E|>
      {{#each (get @model.errors @name) as |error|}}
        <E.Message>{{error.message}}</E.Message>
      {{/each}}
    </F.Error>
  {{/if}}
</Field>

<Separator />

<Field0 checked={{this.showFilterGenerator}} name="show_filter_generator" {{on "change" this.toggleFilterGenerator}} as |F|>
  <F.Label>{{t "worker-filter-generator.toggle.title"}}</F.Label>
  <F.HelperText>{{t "worker-filter-generator.toggle.description"}}</F.HelperText>
</Field0>

<Separator />

{{#if this.showFilterGenerator}}
  <Group class="filter-generator-selection" @name="filter_generator" {{on "change" this.setGeneratorType}} as |G|>
    <G.Legend>{{t "worker-filter-generator.title"}}</G.Legend>
    <G.HelperText>
      {{t "worker-filter-generator.description"}}
      <br />
      <Inline @href={{docUrl "worker-filters-format"}} @color="secondary">
        {{t "worker-filter-generator.link"}}
      </Inline>
    </G.HelperText>
    <G.RadioField @value={{this.generatorTagType}} checked={{eq this.selectedGeneratorType this.generatorTagType}} as |F|>
      <F.Label>{{t "worker-filter-generator.tag.label"}}</F.Label>
      <F.HelperText>{{t "worker-filter-generator.tag.helper"}}</F.HelperText>
    </G.RadioField>
    <G.RadioField @value={{this.generatorNameType}} checked={{eq this.selectedGeneratorType this.generatorNameType}} as |F|>
      <F.Label>{{t "worker-filter-generator.name.label"}}</F.Label>
      <F.HelperText>{{t "worker-filter-generator.name.helper"}}</F.HelperText>
    </G.RadioField>
  </Group>

  {{#let (uniqueId) (uniqueId) as |labelId helpId|}}
    <Fieldset aria-labelledby={{labelId}} aria-describedby={{helpId}} class="input-values" as |F|>
      <F.Legend id={{labelId}}>{{t "worker-filter-generator.input-values.title"}}</F.Legend>
      <F.HelperText id={{helpId}}>{{t "worker-filter-generator.input-values.description"}}</F.HelperText>
      <F.Control>
        {{#if (eq this.selectedGeneratorType this.generatorTagType)}}
          <Field1 @value={{this.key}} name="tag_key" @width="320px" {{on "input" (setFromEvent this "key")}} as |F|>
            <F.Label>{{t "form.key.label"}}</F.Label>
          </Field1>
        {{else}}
          <Field2 name="name_operator" @value={{this.operator}} @width="320px" {{on "change" (setFromEvent this "operator")}} as |F|>
            <F.Label>{{t "form.operator.label"}}</F.Label>
            <F.Options>
              <option value>
                {{t "titles.choose-an-option"}}
              </option>
              {{#each this.operatorOptions as |operator|}}
                <option value={{operator}} selected={{eq operator this.operator}}>
                  {{#if (eq operator "==")}}
                    {{operator}}
                  {{else}}
                    {{t (concat "worker-filter-generator.operator." operator)}}
                  {{/if}}
                </option>
              {{/each}}
            </F.Options>
          </Field2>
        {{/if}}
      </F.Control>
      <F.Control>
        <Field1 @value={{this.value}} name="tag_value" @width="320px" {{on "input" (setFromEvent this "value")}} as |F|>
          <F.Label>{{t "form.value.label"}}</F.Label>
        </Field1>
      </F.Control>
    </Fieldset>
  {{/let}}

  {{#let (uniqueId) (uniqueId) as |labelId helpId|}}
    <Fieldset aria-labelledby={{labelId}} aria-describedby={{helpId}} class="formatted-results" @layout="vertical" as |F|>
      <F.Legend id={{labelId}}>{{t "worker-filter-generator.formatted-result.title"}}</F.Legend>
      <F.HelperText id={{helpId}}>{{t "worker-filter-generator.formatted-result.description"}}</F.HelperText>
      <F.Control>
        <Body @tag="p" @weight="semibold">{{t "worker-filter-generator.formatted-result.label"}}</Body>
        <div class="generated-results-container">
          <Base readonly name="generated_value" @value={{this.generatedResult}} @width="320px" />
          {{#if this.generatedResult}}
            <Button @text="Copy" @textToCopy={{this.generatedResult}} />
          {{/if}}
        </div>
      </F.Control>
    </Fieldset>
  {{/let}}
{{/if}}</template>}
