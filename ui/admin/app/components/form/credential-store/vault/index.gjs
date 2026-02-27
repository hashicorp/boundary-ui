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
import { fn, concat, uniqueId } from "@ember/helper";
import InfoField from "admin/components/info-field/index";
import and from "ember-truth-helpers/helpers/and";
import Fieldset from "@hashicorp/design-system-components/components/hds/form/fieldset/index";
import Inline from "@hashicorp/design-system-components/components/hds/link/inline";
import docUrl from "core/helpers/doc-url";
import WorkerFilterGenerator from "admin/components/worker-filter-generator/index";
import or from "ember-truth-helpers/helpers/or";
import Field1 from "@hashicorp/design-system-components/components/hds/form/checkbox/field";
import can from "admin/helpers/can";
const icons = ['keychain', 'vault'];

export default class FormVaultCredentialStoreIndexComponent extends Component {
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
<template>
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
      <InfoField @value={{t (concat "resources.credential-store.types." @model.type)}} @icon="vault" readonly={{true}} as |F|>
        <F.Label>{{t "form.type.label"}}</F.Label>
        <F.HelperText>
          {{t (concat "resources.credential-store.help." @model.type)}}
        </F.HelperText>
      </InfoField>
    {{/if}}
  {{/if}}

  <Field name="address" @value={{@model.address}} @isInvalid={{@model.errors.address}} @isRequired={{true}} disabled={{form.disabled}} {{on "input" (setFromEvent @model "address")}} as |F|>
    <F.Label>{{t "resources.credential-store.form.address.label"}}</F.Label>
    <F.HelperText>
      {{t "resources.credential-store.form.address.help"}}
    </F.HelperText>
    {{#if @model.errors.address}}
      <F.Error as |E|>
        {{#each @model.errors.address as |error|}}
          <E.Message data-test-error-message-vault-address>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field>

  {{!-- worker_filter --}}
  {{#if (and (featureFlag "worker-filter") @model.isNew)}}
    {{#let (uniqueId) (uniqueId) as |labelId helpId|}}
      <Fieldset @isOptional={{true}} aria-labelledby={{labelId}} aria-describedby={{helpId}} class="worker-filter-generator-form-layout" as |F|>
        <F.Legend id={{labelId}}>{{t "form.worker_filter.label"}}</F.Legend>
        <F.HelperText id={{helpId}}>
          {{t "resources.credential-store.worker-filter.description"}}
          <Inline @href={{docUrl "worker-filters"}}>
            {{t "actions.learn-more"}}
          </Inline>
        </F.HelperText>
        <F.Control>
          <WorkerFilterGenerator @model={{@model}} @name="worker_filter" @hideToolbar={{true}} />
        </F.Control>
      </Fieldset>
    {{/let}}
  {{/if}}

  {{#if (or @model.isNew form.isEditable)}}
    <Field name="token" @value={{@model.token}} @isInvalid={{@model.errors.token}} @isRequired={{true}} disabled={{form.disabled}} {{on "input" (setFromEvent @model "token")}} as |F|>
      <F.Label>{{t "resources.credential-store.form.token.label"}}</F.Label>
      <F.HelperText>
        {{t "resources.credential-store.form.token.help"}}
      </F.HelperText>
      {{#if @model.errors.token}}
        <F.Error as |E|>
          {{#each @model.errors.token as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </Field>
  {{/if}}

  {{#unless @model.isNew}}
    <Field @value={{@model.token_hmac}} disabled={{true}} as |F|>
      <F.Label>
        {{t "resources.credential-store.form.token_hmac.label"}}
      </F.Label>
    </Field>
  {{/unless}}
  <Field name="namespace" @value={{@model.namespace}} @isOptional={{true}} @isInvalid={{@model.errors.namespace}} disabled={{form.disabled}} {{on "input" (setFromEvent @model "namespace")}} as |F|>
    <F.Label>{{t "resources.credential-store.form.namespace.label"}}</F.Label>
    <F.HelperText>
      {{t "resources.credential-store.form.namespace.help"}}
    </F.HelperText>
    {{#if @model.errors.namespace}}
      <F.Error as |E|>
        {{#each @model.errors.namespace as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field>

  <Field name="tls_server_name" @value={{@model.tls_server_name}} @isOptional={{true}} @isInvalid={{@model.errors.tls_server_name}} disabled={{form.disabled}} {{on "input" (setFromEvent @model "tls_server_name")}} as |F|>
    <F.Label>
      {{t "resources.credential-store.form.tls_server_name.label"}}
    </F.Label>
    <F.HelperText>
      {{t "resources.credential-store.form.tls_server_name.help"}}
    </F.HelperText>
    {{#if @model.errors.tls_server_name}}
      <F.Error as |E|>
        {{#each @model.errors.tls_server_name as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field>

  <Field1 name="tls_skip_verify" checked={{@model.tls_skip_verify}} disabled={{form.disabled}} {{on "change" (fn (mut @model.tls_skip_verify) (if @model.tls_skip_verify false true))}} as |F|>
    <F.Label>{{t "resources.credential-store.form.tls_skip_verify.label"}}</F.Label>
    <F.HelperText>{{t "resources.credential-store.form.tls_skip_verify.help"}}</F.HelperText>
    {{#if @model.errors.tls_skip_verify}}
      <F.Error as |E|>
        {{#each @model.errors.tls_skip_verify as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field1>

  <Field0 name="client_certificate" @value={{@model.client_certificate}} @isInvalid={{@model.errors.client_certificate}} @isOptional={{true}} disabled={{form.disabled}} as |F|>
    <F.Label>{{t "resources.credential-store.form.client_certificate.label"}}</F.Label>
    <F.HelperText>{{t "resources.credential-store.form.client_certificate.help"}}</F.HelperText>
    {{#if @model.errors.client_certificate}}
      <F.Error as |E|>
        {{#each @model.errors.client_certificate as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field0>

  <Field0 name="client_certificate_key" @value={{@model.client_certificate_key}} @isOptional={{true}} @isInvalid={{@model.errors.client_certificate_key}} disabled={{form.disabled}} as |F|>
    <F.Label>{{t "resources.credential-store.form.client_certificate_key.label"}}</F.Label>
    <F.HelperText>{{t "resources.credential-store.form.client_certificate_key.help"}}</F.HelperText>
    {{#if @model.errors.client_certificate_key}}
      <F.Error as |E|>
        {{#each @model.errors.client_certificate_key as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field0>

  {{#unless @model.isNew}}
    <Field @value={{@model.client_certificate_key_hmac}} disabled={{true}} as |F|>
      <F.Label>
        {{t "resources.credential-store.form.client_certificate_key_hmac.label"}}
      </F.Label>
    </Field>
  {{/unless}}

  <Field0 name="ca_cert" @value={{@model.ca_cert}} @isOptional={{true}} @isInvalid={{@model.errors.ca_cert}} disabled={{form.disabled}} as |F|>
    <F.Label>{{t "resources.credential-store.form.ca_cert.label"}}</F.Label>
    <F.HelperText>{{t "resources.credential-store.form.ca_cert.help"}}</F.HelperText>
    {{#if @model.errors.ca_cert}}
      <F.Error as |E|>
        {{#each @model.errors.ca_cert as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field0>

  {{#if (can "save model" @model)}}
    <form.actions @enableEditText={{t "actions.edit-form"}} @submitText={{t "actions.save"}} @cancelText={{t "actions.cancel"}} />
  {{/if}}
</Form></template>}
