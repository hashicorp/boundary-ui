/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { options } from 'api/models/credential-library';
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
import ListWrapper from "admin/components/form/field/list-wrapper/index";
import can from "admin/helpers/can";

export default class FormCredentialLibraryVaultSshCertComponent extends Component {
  // =properties

  /**
   * @type {object}
   */
  keyTypes = options.key_type;

  /**
   * Boolean to determine if the key bits field should be displayed on the form
   * @returns {boolean}
   */
  get showKeyBits() {
    const keyType = this.args.model.key_type;
    return keyType === 'rsa' || keyType === 'ecdsa';
  }
<template>
<Form @edit={{@edit}} @onSubmit={{@submit}} @cancel={{@cancel}} @disabled={{@model.isSaving}} @showEditToggle={{if @model.isNew false true}} as |form|>

  <Field name="name" @value={{@model.name}} @isInvalid={{@model.errors.name}} @isOptional={{true}} disabled={{form.disabled}} {{on "input" (setFromEvent @model "name")}} as |F|>
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

  <Field @isRequired={{true}} @value={{@model.username}} @isInvalid={{@model.errors.username}} @type="text" name="username" disabled={{form.disabled}} {{on "input" (setFromEvent @model "username")}} as |F|>
    <F.Label>{{t "resources.credential-library.form.username.label"}}</F.Label>
    <F.HelperText>{{t "resources.credential-library.form.username.help"}}</F.HelperText>
    {{#if @model.errors.username}}
      <F.Error as |E|>
        {{#each @model.errors.username as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field>

  <Field1 @isOptional={{true}} @width="100%" name="key_type" disabled={{form.disabled}} {{on "input" (setFromEvent @model "key_type")}} as |F|>
    <F.Label>{{t "resources.credential-library.form.key_type.label"}}</F.Label>
    <F.HelperText>{{t "resources.credential-library.form.key_type.help"}}</F.HelperText>
    <F.Options>
      <option disabled hidden selected value>{{t "titles.choose-an-option"}}</option>
      {{#each this.keyTypes as |keyType|}}
        <option value={{keyType}} selected={{eq keyType @model.key_type}}>{{keyType}}</option>
      {{/each}}
    </F.Options>
    {{#if @model.errors.key_type}}
      <F.Error as |E|>
        {{#each @model.errors.key_type as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field1>

  {{#if this.showKeyBits}}
    <Field @isOptional={{true}} @value={{@model.key_bits}} @isInvalid={{@model.errors.key_bits}} @type="text" name="key_bits" disabled={{form.disabled}} {{on "input" (setFromEvent @model "key_bits")}} as |F|>
      <F.Label>{{t "resources.credential-library.form.key_bits.label"}}</F.Label>
      <F.HelperText>{{t "resources.credential-library.form.key_bits.help"}}</F.HelperText>
      {{#if @model.errors.key_bits}}
        <F.Error as |E|>
          {{#each @model.errors.key_bits as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </Field>
  {{/if}}

  <Field @isOptional={{true}} @value={{@model.ttl}} @isInvalid={{@model.errors.ttl}} @type="text" name="ttl" disabled={{form.disabled}} {{on "input" (setFromEvent @model "ttl")}} as |F|>
    <F.Label>{{t "resources.credential-library.form.ttl.label"}}</F.Label>
    <F.HelperText>{{t "resources.credential-library.form.ttl.help"}}</F.HelperText>
    {{#if @model.errors.ttl}}
      <F.Error as |E|>
        {{#each @model.errors.ttl as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field>

  <Field @isOptional={{true}} @value={{@model.key_id}} @isInvalid={{@model.errors.key_id}} @type="text" name="key_id" disabled={{form.disabled}} {{on "input" (setFromEvent @model "key_id")}} as |F|>
    <F.Label>{{t "resources.credential-library.form.key_id.label"}}</F.Label>
    <F.HelperText>{{t "resources.credential-library.form.key_id.help"}}</F.HelperText>
    {{#if @model.errors.key_id}}
      <F.Error as |E|>
        {{#each @model.errors.key_id as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field>

  <ListWrapper @layout="horizontal" @isOptional={{true}} @disabled={{form.disabled}}>
    <:fieldset as |F|>
      <F.Legend>
        {{t "resources.credential-library.form.critical_options.label"}}
      </F.Legend>
      <F.HelperText>
        {{t "resources.credential-library.form.critical_options.help"}}
      </F.HelperText>

      {{#if @model.errors.critical_options}}
        <F.Error as |E|>
          {{#each @model.errors.critical_options as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </:fieldset>

    <:field as |F|>
      <F.KeyValue @name="critical_options" @options={{@model.critical_options}} @model={{@model}} @disabled={{form.disabled}}>
        <:key as |K|>
          <K.text />
        </:key>
        <:value as |K|>
          <K.text />
        </:value>
      </F.KeyValue>
    </:field>

  </ListWrapper>

  <ListWrapper @layout="horizontal" @isOptional={{true}} @disabled={{form.disabled}}>
    <:fieldset as |F|>
      <F.Legend>
        {{t "resources.credential-library.form.extensions.label"}}
      </F.Legend>
      <F.HelperText>
        {{t "resources.credential-library.form.extensions.help"}}
      </F.HelperText>

      {{#if @model.errors.extensions}}
        <F.Error as |E|>
          {{#each @model.errors.extensions as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </:fieldset>
    <:field as |F|>
      <F.KeyValue @name="extensions" @options={{@model.extensions}} @model={{@model}}>
        <:key as |K|>
          <K.text />
        </:key>
        <:value as |V|>
          <V.text />
        </:value>
      </F.KeyValue>
    </:field>

  </ListWrapper>

  {{#if (can "save model" @model)}}
    <form.actions @enableEditText={{t "actions.edit-form"}} @submitText={{t "actions.save"}} @cancelText={{t "actions.cancel"}} />
  {{/if}}

</Form></template>}
