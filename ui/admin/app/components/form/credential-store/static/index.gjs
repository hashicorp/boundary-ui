/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { TYPES_CREDENTIAL_STORE } from 'api/models/credential-store';

//Note: this is a temporary solution till we have resource type helper in place
import Form from "rose/components/rose/form";
import Field from "@hashicorp/design-system-components/components/hds/form/text-input/field";
import { on } from "@ember/modifier";
import setFromEvent from "rose/helpers/set-from-event";
import t from "ember-intl/helpers/t";
import Field0 from "@hashicorp/design-system-components/components/hds/form/textarea/field";
import featureFlag from "ember-feature-flags/helpers/feature-flag";
import Group from "@hashicorp/design-system-components/components/hds/form/radio-card/group";
import eq from "ember-truth-helpers/helpers/eq";
import { fn, concat } from "@ember/helper";
import InfoField from "admin/components/info-field/index";
import can from "admin/helpers/can";
const icons = ['keychain', 'vault'];

export default class FormStaticCredentialStoreIndexComponent extends Component {
  // =properties
  /**
   * maps resource type with icon
   * @type {object}
   */
  get mapResourceTypeWithIcon() {
    return TYPES_CREDENTIAL_STORE.reduce(
      (obj, type, i) => ({ ...obj, [type]: icons[i] }),
      {},
    );
  }
<template>{{!--
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
--}}

<Form @onSubmit={{@submit}} @cancel={{@cancel}} @disabled={{@model.isSaving}} @showEditToggle={{if @model.isNew false true}} as |form|>
  <Field name="name" @value={{@model.name}} @isInvalid={{@model.errors.name}} @isOptional={{true}} disabled={{form.disabled}} {{on "input" (setFromEvent @model "name")}} as |F|>
    <F.Label>{{t "form.name.label"}}</F.Label>
    <F.HelperText>{{t "form.name.help"}}</F.HelperText>
    {{#if @model.errors.name}}
      <F.Error as |E|>
        {{#each @model.errors.name as |error|}}
          <E.Message data-test-error-message-name>
            {{error.message}}
          </E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field>

  <Field0 name="description" @value={{@model.description}} @isInvalid={{@model.errors.description}} @isOptional={{true}} disabled={{form.disabled}} as |F|>
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

  {{#if (featureFlag "static-credentials")}}
    {{#if @model.isNew}}

      <Group @name={{t "form.type.label"}} @alignment="center" as |G|>
        <G.Legend>{{t "form.type.label"}}</G.Legend>
        {{#each-in this.mapResourceTypeWithIcon as |credentialStoreType icon|}}
          <G.RadioCard @value={{credentialStoreType}} @checked={{eq credentialStoreType @model.type}} @maxWidth="20rem" {{on "input" (fn @changeType credentialStoreType)}} as |R|>
            <R.Label>{{t (concat "resources.credential-store.types." credentialStoreType)}}</R.Label>
            <R.Description>{{t (concat "resources.credential-store.help." credentialStoreType)}}</R.Description>
            <R.Icon @name={{icon}} />
          </G.RadioCard>
        {{/each-in}}
      </Group>
    {{else}}
      <InfoField @value={{t (concat "resources.credential-store.types." @model.type)}} @icon="keychain" as |F|>
        <F.Label>{{t "form.type.label"}}</F.Label>
        <F.HelperText>
          {{t (concat "resources.credential-store.help." @model.type)}}
        </F.HelperText>
      </InfoField>
    {{/if}}
  {{/if}}
  {{#if (can "save model" @model)}}
    <form.actions @enableEditText={{t "actions.edit-form"}} @submitText={{t "actions.save"}} @cancelText={{t "actions.cancel"}} />
  {{/if}}
</Form></template>}
