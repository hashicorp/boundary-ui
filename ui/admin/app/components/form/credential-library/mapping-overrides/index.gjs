/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { options } from 'api/models/credential-library';
import Fieldset from "@hashicorp/design-system-components/components/hds/form/fieldset/index";
import t from "ember-intl/helpers/t";
import Field from "@hashicorp/design-system-components/components/hds/form/text-input/field";
import { get, concat } from "@ember/helper";
import { on } from "@ember/modifier";
import setFromEvent from "rose/helpers/set-from-event";

export default class FormCredentialLibraryMappingOverridesComponent extends Component {
  // =attributes

  get mappingOverrides() {
    return options.mapping_overrides[this.args.model.credential_type];
  }
<template>{{!--
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
--}}

<Fieldset as |F|>
  <F.Legend>{{t "resources.credential-library.form.credential_mapping_overrides.label"}}</F.Legend>
  <F.HelperText>{{t "resources.credential-library.form.credential_mapping_overrides.help"}}</F.HelperText>
  <F.Control>
    {{#each this.mappingOverrides as |option|}}
      <Field name={{option}} @value={{get @model.credential_mapping_overrides option}} disabled={{@disabled}} {{on "input" (setFromEvent @model.credential_mapping_overrides option)}} as |F|>
        <F.Label>{{t (concat "resources.credential-library.titles." option)}}</F.Label>
      </Field>
    {{/each}}
  </F.Control>
  {{#if @model.errors.credential_mapping_overrides}}
    <F.Error as |E|>
      {{#each @model.errors.credential_mapping_overrides as |error|}}
        <E.Message>{{error.message}}</E.Message>
      {{/each}}
    </F.Error>
  {{/if}}
</Fieldset></template>}
