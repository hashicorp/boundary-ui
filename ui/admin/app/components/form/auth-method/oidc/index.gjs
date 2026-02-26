/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { options } from 'api/models/auth-method';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Form from "rose/components/rose/form";
import InfoField from "admin/components/info-field/index";
import t from "ember-intl/helpers/t";
import Field from "@hashicorp/design-system-components/components/hds/form/text-input/field";
import { on } from "@ember/modifier";
import setFromEvent from "rose/helpers/set-from-event";
import Field0 from "@hashicorp/design-system-components/components/hds/form/textarea/field";
import Field1 from "@hashicorp/design-system-components/components/hds/form/checkbox/field";
import { fn, concat } from "@ember/helper";
import ListWrapper from "admin/components/form/field/list-wrapper/index";
import Fieldset from "@hashicorp/design-system-components/components/hds/form/fieldset/index";
import Field2 from "@hashicorp/design-system-components/components/hds/form/toggle/field";
import Group from "@hashicorp/design-system-components/components/hds/form/checkbox/group";
import includes from "@nullvoxpopuli/ember-composable-helpers/helpers/includes";
import can from "admin/helpers/can";

export default class FormAuthMethodOidcComponent extends Component {
  // =attributes
  /**
   * @type {object}
   */
  signingAlgorithms = options.oidc.signing_algorithms;

  /**
   * @type {object}
   */
  toClaims = options.oidc.account_claim_maps.to;

  /**
   * @type {string}
   */
  newToClaim = options.oidc.account_claim_maps.to[0];

  /**
   * @type {string}
   */
  newSigningAlgorithm = options.oidc.signing_algorithms[0];

  /**
   * @type {string}
   */
  prompts = options.oidc.prompts;

  @tracked selectedPrompts = this.parsePromptsArray();
  @tracked skipPromptsList = this.isToggleChecked();

  /**
   * @returns {string}
   */
  parsePromptsArray() {
    return this.args.model.prompts?.map((item) => item.value) ?? [];
  }

  /**
   * @returns {boolean}
   */
  isToggleChecked() {
    return this.args.model.prompts?.find((i) => i.value === 'none');
  }

  //actions

  /**
   * @param {string} value
   */
  @action
  toggleField(value) {
    this.skipPromptsList = !this.skipPromptsList;
    //If toggle is on, then add `none` to model, else remove it
    if (this.skipPromptsList) {
      this.args.model.prompts = [{ value }];
    } else {
      this.args.model.prompts = [];
    }
  }

  /**
   * @param {string} option
   * @param {object} event
   */
  @action
  updatePrompt(value, event) {
    const currentSelection = { value };
    const previousSelection = this.args.model.prompts || [];
    // Add the selected option to the model, only when the checkbox is in checked state
    if (event.target.checked) {
      this.args.model.prompts = [...previousSelection, currentSelection];
    } else {
      // When the checkbox is unchecked, remove the option form the exisiting list
      const removeSelection = previousSelection.filter(
        (prompt) => prompt.value !== value,
      );

      this.args.model.prompts = [...removeSelection];
    }
  }
<template>
<Form @edit={{@edit}} @onSubmit={{@submit}} @cancel={{@cancel}} @disabled={{@model.isSaving}} @showEditToggle={{if @model.isNew false true}} as |form|>

  <InfoField @value={{@model.type}} disabled={{form.disabled}} as |F|>
    <F.Label>{{t "form.type.label"}}</F.Label>
  </InfoField>

  <Field name="name" @value={{@model.name}} @isInvalid={{@model.errors.name}} @isOptional={{true}} disabled={{form.disabled}} {{on "input" (setFromEvent @model "name")}} as |F|>
    <F.Label>{{t "form.name.label"}}</F.Label>
    <F.HelperText>{{t "form.name.help"}}</F.HelperText>
    {{#if @model.errors.name}}
      <F.Error as |E|>
        {{#each @model.errors.name as |error|}}
          <E.Message data-test-error-message-name>{{error.message}}</E.Message>
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

  <Field @value={{@model.issuer}} @isInvalid={{@model.errors.issuer}} @isOptional={{true}} disabled={{form.disabled}} name="issuer" {{on "input" (setFromEvent @model "issuer")}} as |F|>
    <F.Label>{{t "form.issuer.label"}}</F.Label>
    <F.HelperText>{{t "form.issuer.help"}}</F.HelperText>
    {{#if @model.errors.issuer}}
      <F.Error as |E|>
        {{#each @model.errors.issuer as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field>

  <Field1 name="disable_discovered_config_validation" checked={{@model.disable_discovered_config_validation}} disabled={{form.disabled}} {{on "change" (fn (mut @model.disable_discovered_config_validation) (if @model.disable_discovered_config_validation false true))}} as |F|>
    <F.Label>{{t "form.disable_discovered_config_validation.label"}}</F.Label>
    <F.HelperText>
      {{t "form.disable_discovered_config_validation.help"}}
    </F.HelperText>
  </Field1>

  <Field name="client_id" @value={{@model.client_id}} @isRequired={{true}} @isInvalid={{@model.errors.client_id}} disabled={{form.disabled}} {{on "input" (setFromEvent @model "client_id")}} as |F|>
    <F.Label>{{t "form.client_id.label"}}</F.Label>
    <F.HelperText>{{t "form.client_id.help"}}</F.HelperText>
    {{#if @model.errors.client_id}}
      <F.Error as |E|>
        {{#each @model.errors.client_id as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field>

  <Field name="client_secret" @value={{@model.client_secret}} @isRequired={{true}} @isInvalid={{@model.errors.client_secret}} disabled={{form.disabled}} @hasVisibilityToggle={{false}} @type="password" {{on "input" (setFromEvent @model "client_secret")}} as |F|>
    <F.Label>{{t "form.client_secret.label"}}</F.Label>
    <F.HelperText>{{t "form.client_secret.help"}}</F.HelperText>
    {{#if @model.errors.client_secret}}
      <F.Error as |E|>
        {{#each @model.errors.client_secret as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field>

  {{#unless @model.isNew}}
    <Field @value={{@model.client_secret_hmac}} disabled={{true}} as |F|>
      <F.Label>{{t "form.client_secret_hmac.label"}}</F.Label>
    </Field>
  {{/unless}}

  {{!-- Signing Algorithms --}}
  <ListWrapper @layout="horizontal" @isOptional={{true}} @disabled={{form.disabled}}>
    <:fieldset as |F|>
      <F.Legend>
        {{t "form.signing_algorithms.label"}}
      </F.Legend>
      <F.HelperText>
        {{t "form.signing_algorithms.help"}}
      </F.HelperText>

      {{#if @model.errors.signing_algorithms}}
        <F.Error as |E|>
          {{#each @model.errors.signing_algorithms as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </:fieldset>

    <:field as |F|>
      <F.Select @name="signing_algorithms" @model={{@model}} @selectOptions={{this.signingAlgorithms}} @width="100%" />
    </:field>
  </ListWrapper>

  {{!-- Allowed Audiences --}}
  <ListWrapper @layout="horizontal" @isOptional={{true}} @disabled={{form.disabled}}>
    <:fieldset as |F|>
      <F.Legend>
        {{t "form.allowed_audiences.label"}}
      </F.Legend>
      <F.HelperText>
        {{t "form.allowed_audiences.help"}}
      </F.HelperText>

      {{#if @model.errors.allowed_audiences}}
        <F.Error as |E|>
          {{#each @model.errors.allowed_audiences as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </:fieldset>

    <:field as |F|>
      <F.TextInput @name="allowed_audiences" @options={{@model.allowed_audiences}} @model={{@model}} />
    </:field>

  </ListWrapper>

  {{!-- Claims Scopes --}}

  <ListWrapper @layout="horizontal" @isOptional={{true}} @disabled={{form.disabled}}>
    <:fieldset as |F|>
      <F.Legend>
        {{t "form.claims_scopes.label"}}
      </F.Legend>
      <F.HelperText>
        {{t "form.claims_scopes.help"}}
      </F.HelperText>

      {{#if @model.errors.claims_scopes}}
        <F.Error as |E|>
          {{#each @model.errors.claims_scopes as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </:fieldset>

    <:field as |F|>
      <F.TextInput @name="claims_scopes" @options={{@model.claims_scopes}} @model={{@model}} />
    </:field>

  </ListWrapper>

  {{!-- Account Claim Maps --}}
  <ListWrapper @layout="horizontal" @isOptional={{true}} @disabled={{form.disabled}}>
    <:fieldset as |F|>
      <F.Legend>
        {{t "form.account_claim_maps.label"}}
      </F.Legend>
      <F.HelperText>
        {{t "form.account_claim_maps.help"}}
      </F.HelperText>

      {{#if @model.errors.account_claim_maps}}
        <F.Error as |E|>
          {{#each @model.errors.account_claim_maps as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </:fieldset>
    <:field as |F|>
      <F.KeyValue @name="account_claim_maps" @options={{@model.account_claim_maps}} @model={{@model}} @keyLabel={{t "form.from_claim.label"}} @valueLabel={{t "form.to_claim.label"}} @width="100%">
        <:key as |K|>
          <K.text />
        </:key>
        <:value as |V|>
          <V.select @selectOptions={{this.toClaims}} />
        </:value>
      </F.KeyValue>
    </:field>
  </ListWrapper>

  {{!-- Certificates --}}
  <ListWrapper @layout="horizontal" @isOptional={{true}} @disabled={{form.disabled}}>
    <:fieldset as |F|>
      <F.Legend>
        {{t "form.idp_ca_certs.label"}}
      </F.Legend>
      <F.HelperText>
        {{t "form.idp_ca_certs.help"}}
      </F.HelperText>

      {{#if @model.errors.idp_ca_certs}}
        <F.Error as |E|>
          {{#each @model.errors.idp_ca_certs as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </:fieldset>

    <:field as |F|>
      <F.Textarea @name="idp_ca_certs" @options={{@model.idp_ca_certs}} @model={{@model}} />
    </:field>

  </ListWrapper>

  <Field name="max_age" @value={{@model.max_age}} @isOptional={{true}} @isInvalid={{@model.errors.max_age}} disabled={{form.disabled}} {{on "input" (setFromEvent @model "max_age")}} as |F|>
    <F.Label>{{t "form.max_age.label"}}</F.Label>
    <F.HelperText>{{t "form.max_age.help"}}</F.HelperText>
    {{#if @model.errors.max_age}}
      <F.Error as |E|>
        {{#each @model.errors.max_age as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field>

  <Field name="api_url_prefix" @value={{@model.api_url_prefix}} @isRequired={{true}} @isInvalid={{@model.errors.api_url_prefix}} disabled={{form.disabled}} {{on "input" (setFromEvent @model "api_url_prefix")}} as |F|>
    <F.Label>{{t "form.api_url_prefix.label"}}</F.Label>
    <F.HelperText>{{t "form.api_url_prefix.help"}}</F.HelperText>
    {{#if @model.errors.api_url_prefix}}
      <F.Error as |E|>
        {{#each @model.errors.api_url_prefix as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field>

  <Fieldset @isOptional={{true}} as |F|>
    <F.Legend>{{t "form.prompts.label"}}</F.Legend>
    <F.HelperText>{{t "form.prompts.help"}}</F.HelperText>
    <F.Control>
      <Field2 name="prompts" checked={{this.skipPromptsList}} disabled={{form.disabled}} {{on "change" (fn this.toggleField "none")}} as |F|>
        <F.Label>
          {{t "resources.auth-method.form.none.label"}}
        </F.Label>
        <F.HelperText>
          {{t "resources.auth-method.form.none.help"}}
        </F.HelperText>
      </Field2>
      {{#unless this.skipPromptsList}}
        <Group class="oidc-prompts" @name="prompts" disabled={{form.disabled}} as |G|>
          {{#each this.prompts as |prompt|}}
            <G.CheckboxField @id={{prompt}} checked={{includes prompt this.selectedPrompts}} {{on "change" (fn this.updatePrompt prompt)}} as |F|>
              <F.Label>
                {{t (concat "resources.auth-method.form." prompt ".label")}}
              </F.Label>
              <F.HelperText>
                {{t (concat "resources.auth-method.form." prompt ".help")}}
              </F.HelperText>
            </G.CheckboxField>
          {{/each}}
        </Group>
      {{/unless}}
    </F.Control>
    {{#if @model.errors.prompts}}
      <F.Error as |E|>
        {{#each @model.errors.prompts as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Fieldset>

  {{#unless @model.isNew}}
    <Field @value={{@model.callback_url}} disabled={{true}} as |F|>
      <F.Label>{{t "form.callback_url.label"}}</F.Label>
      <F.HelperText>{{t "form.callback_url.help"}}</F.HelperText>
    </Field>
  {{/unless}}

  {{#if (can "save model" @model)}}
    <form.actions @enableEditText={{t "actions.edit-form"}} @submitText={{t "actions.save"}} @cancelText={{t "actions.cancel"}} />
  {{/if}}
</Form></template>}
