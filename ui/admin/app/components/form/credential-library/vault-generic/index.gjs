/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { options } from 'api/models/credential-library';
import { action } from '@ember/object';
import Form from "rose/components/rose/form";
import Field from "@hashicorp/design-system-components/components/hds/form/text-input/field";
import { on } from "@ember/modifier";
import setFromEvent from "rose/helpers/set-from-event";
import t from "ember-intl/helpers/t";
import Field0 from "@hashicorp/design-system-components/components/hds/form/textarea/field";
import Radio from "admin/components/form/credential-library/radio/index";
import InfoField from "admin/components/info-field/index";
import { concat } from "@ember/helper";
import Field1 from "@hashicorp/design-system-components/components/hds/form/select/field";
import eq from "ember-truth-helpers/helpers/eq";
import MappingOverrides from "admin/components/form/credential-library/mapping-overrides/index";
import Group from "@hashicorp/design-system-components/components/hds/form/radio/group";
import can from "admin/helpers/can";
export default class FormCredentialLibraryVaultGenericComponent extends Component {
  // =properties
  /**
   * @type {object}
   */
  httpMethodOptions = options.http_method;

  credentialTypes = options.credential_types;

  /**
   * Only allow HTTP request body field if http_method is set to POST.
   * @type {boolean}
   */
  get isHttpRequestBodyAllowed() {
    return this.args.model.http_method?.match(/post/i);
  }

  /**
   * Clear the previously selected key value pair when toggling between credential types on a new form
   */
  @action
  selectCredentialType({ target: { value } }) {
    this.args.model.credential_mapping_overrides = {};
    this.args.model.credential_type = value;
  }
<template>
<Form @onSubmit={{@submit}} @cancel={{@cancel}} @disabled={{@model.isSaving}} @showEditToggle={{if @model.isNew false true}} as |form|>
  <Field name="name" @value={{@model.name}} @isInvalid={{@model.errors.name}} disabled={{form.disabled}} {{on "input" (setFromEvent @model "name")}} as |F|>
    <F.Label>{{t "form.name.label"}}</F.Label>
    <F.HelperText>{{t "form.name.help"}}</F.HelperText>
    {{#if @model.errors.name}}
      <F.Error as |E|>
        {{#each @model.errors.name as |error|}}
          <E.Message>
            {{error.message}}
          </E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field>

  <Field0 name="description" @value={{@model.description}} @isInvalid={{@model.errors.description}} disabled={{form.disabled}} as |F|>
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

  {{#if @model.isNew}}
    <Radio @model={{@model}} @changeType={{@changeType}} />
  {{else}}
    <InfoField @value={{t (concat "resources.credential-library.types." @model.type)}} as |F|>
      <F.Label>{{t "form.type.label"}}</F.Label>
      <F.HelperText>
        {{t (concat "resources.credential-library.help." @model.type)}}
      </F.HelperText>
    </InfoField>
  {{/if}}

  <Field @isRequired={{true}} @value={{@model.path}} @isInvalid={{@model.errors.path}} @type="text" name="vault_path" disabled={{form.disabled}} {{on "input" (setFromEvent @model "path")}} as |F|>
    <F.Label>{{t "resources.credential-library.form.vault_path.label"}}</F.Label>
    <F.HelperText>{{t "resources.credential-library.form.vault_path.help"}}</F.HelperText>
    {{#if @model.errors.path}}
      <F.Error as |E|>
        {{#each @model.errors.path as |error|}}
          <E.Message data-test-error-message-vault-path>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field>

  {{#if @model.isNew}}
    <Field1 @width="100%" name="credential_type" disabled={{form.disabled}} {{on "input" this.selectCredentialType}} as |F|>
      <F.Label>
        {{t "resources.credential-library.form.credential_type.label"}}
      </F.Label>
      <F.HelperText>
        {{t "resources.credential-library.form.credential_type.help"}}
      </F.HelperText>
      <F.Options>
        <option value />

        {{#each this.credentialTypes as |type|}}
          <option value={{type}} selected={{eq type @model.credential_type}}>
            {{t (concat "resources.credential-library.titles." type)}}
          </option>
        {{/each}}
      </F.Options>
      {{#if @model.errors.credential_type}}
        <F.Error as |E|>
          {{#each @model.errors.credential_type as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </Field1>
  {{else if @model.credential_type}}
    <InfoField @value={{t (concat "resources.credential-library.titles." @model.credential_type)}} as |F|>
      <F.Label>{{t "resources.credential-library.form.credential_type.label"}}</F.Label>
      <F.HelperText>
        {{t "resources.credential-library.form.credential_type.description"}}
      </F.HelperText>
    </InfoField>
  {{/if}}

  {{#if @model.credential_type}}
    <MappingOverrides @model={{@model}} @disabled={{form.disabled}} />
  {{/if}}

  <Group disabled={{form.disabled}} {{on "input" (setFromEvent @model "http_method")}} @isRequired={{true}} @layout="horizontal" @name="http_method" as |G|>
    <G.Legend>
      {{t "resources.credential-library.form.http_method.label"}}
    </G.Legend>
    <G.HelperText>
      {{t "resources.credential-library.form.http_method.help"}}
    </G.HelperText>
    {{#each this.httpMethodOptions as |httpMethod|}}
      <G.RadioField checked={{eq @model.http_method httpMethod}} @value={{httpMethod}} as |F|>
        <F.Label>{{httpMethod}}</F.Label>
      </G.RadioField>
    {{/each}}
  </Group>

  {{#if this.isHttpRequestBodyAllowed}}
    <Field0 @isRequired={{true}} @value={{@model.http_request_body}} @isInvalid={{@model.errors.http_request_body}} name="http_request_body" disabled={{form.disabled}} as |F|>
      <F.Label>{{t "resources.credential-library.form.http_request_body.label"}}</F.Label>
      <F.HelperText>{{t "resources.credential-library.form.http_request_body.help"}}</F.HelperText>
      {{#if @model.errors.http_request_body}}
        <F.Error as |E|>
          {{#each @model.errors.http_request_body as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </Field0>
  {{/if}}

  {{#if (can "save model" @model)}}
    <form.actions @enableEditText={{t "actions.edit-form"}} @submitText={{t "actions.save"}} @cancelText={{t "actions.cancel"}} />
  {{/if}}

</Form></template>}
