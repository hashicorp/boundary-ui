/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import Fieldset from "@hashicorp/design-system-components/components/hds/form/fieldset/index";
import t from "ember-intl/helpers/t";
import { concat } from "@ember/helper";
import Field from "@hashicorp/design-system-components/components/hds/form/select/field";
import or from "ember-truth-helpers/helpers/or";
import { on } from "@ember/modifier";
import eq from "ember-truth-helpers/helpers/eq";
import Field0 from "@hashicorp/design-system-components/components/hds/form/toggle/field";
import Field1 from "@hashicorp/design-system-components/components/hds/form/field/index";
import SegmentedGroup from "@hashicorp/design-system-components/components/hds/segmented-group/index";
import Badge from "@hashicorp/design-system-components/components/hds/badge/index";

export default class FormPolicySelectionComponent extends Component {
  //methods
  /**
   * This is used to show/hide the custom input field
   * @type {boolean}
   */
  get showCustomInput() {
    return this.args.selectedOption === 'custom';
  }

  /**
   * Disable toggle when the form is disabled and when the retain/delete after days are 0
   * @type {boolean}
   */
  get toggleDisabled() {
    return (
      this.args.disabled || !this.args.model[this.args.customInputName]?.days
    );
  }

  /**
   * Returns true if the toggle is on
   * @type {boolean}
   */
  get isOverridable() {
    return (
      this.args.model[this.args.customInputName]?.days &&
      this.args.model[this.args.customInputName]?.overridable
    );
  }

  get isDeleteDisable() {
    return (
      this.args.name === 'deletion_policy' &&
      this.args.model.retain_for?.days === -1
    );
  }
  //actions
  /**
   * Handles custom input changes
   */
  @action
  handleInputChange({ target: { value, name: field } }) {
    // Select options return type is string and we want the `days` in integer format
    if (value) {
      const val = Number(value);
      this.args.model[field] = {
        ...this.args.model[field],
        days: val,
      };
    }
  }

  /**
   * Toggle retain for & delete after overridables
   */
  @action
  handleOverridableToggle({ target: { name: field } }) {
    this.args.model[field] = {
      ...this.args.model[field],
      overridable: !this.args.model[field].overridable,
    };
  }

  /**
   * Show custom text field when custom option is selected
   */
  @action
  handlePolicyTypeSelection({ target: { value, name: policy } }) {
    //Select options return type is string and we want the `days` in integer format
    const selectedVal = Number(value);
    if (policy === 'retention_policy') {
      this.args.model.retain_for = {
        ...this.args.model.retain_for,
        days: selectedVal,
      };
      if (selectedVal < 0) {
        this.args.model.delete_after = {
          ...this.args.model.delete_after,
          days: 0,
        };
      }
    }

    if (policy === 'deletion_policy') {
      this.args.model.delete_after = {
        ...this.args.model.delete_after,
        days: selectedVal,
      };
    }
  }
<template>{{!--
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
--}}

<Fieldset @isRequired={{true}} class="policy" as |F|>

  <F.Legend>{{t (concat "resources.policy.form." @name ".label")}}</F.Legend>
  <F.HelperText>
    {{t (concat "resources.policy.form." @name ".help")}}
  </F.HelperText>

  <F.Control>
    <Field name={{@name}} disabled={{or @disabled this.isDeleteDisable}} aria-label={{t (concat "resources.policy.form." @name ".label")}} data-select={{@name}} @width="70%" {{on "change" this.handlePolicyTypeSelection}} as |F|>
      <F.Options>
        <option disabled hidden selected value>
          {{t "titles.choose-an-option"}}
        </option>
        {{#each-in @options as |key value|}}
          <option value={{value}} selected={{eq key @selectedOption}}>
            {{t (concat "resources.policy.form." @name "_options." key ".label")}}
          </option>
        {{/each-in}}
      </F.Options>

    </Field>
    {{#if @model.scope.isGlobal}}
      <Field0 name={{@customInputName}} checked={{this.isOverridable}} disabled={{this.toggleDisabled}} data-toggle={{@customInputName}} {{on "change" this.handleOverridableToggle}} as |F|>
        <F.Label>{{t "resources.policy.form.overridable.label"}}</F.Label>
      </Field0>
    {{/if}}
  </F.Control>
</Fieldset>
{{#if this.showCustomInput}}
  <Field1 class="policy-custom-input" @layout="vertical" as |F|>
    <F.Label>{{t (concat "resources.policy.titles." @customInputName)}}
    </F.Label>
    <F.Control>
      <SegmentedGroup as |S|>
        <S.TextInput name={{@customInputName}} @value={{@inputValue}} disabled={{@disabled}} aria-label={{t "resources.policy.title"}} data-input={{@customInputName}} {{on "input" this.handleInputChange}} />
        <S.Generic>
          <Badge class={{if @disabled "disabled"}} @text={{t "resources.policy.titles.days"}} @color="neutral" @type="outlined" />
        </S.Generic>
      </SegmentedGroup>

    </F.Control>

  </Field1>
{{/if}}</template>}
