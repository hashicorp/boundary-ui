/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { options } from 'api/models/auth-method';
import { set } from '@ember/object';
import Form from "rose/components/rose/form";
import Field from "@hashicorp/design-system-components/components/hds/form/text-input/field";
import t from "ember-intl/helpers/t";
import { on } from "@ember/modifier";
import setFromEvent from "rose/helpers/set-from-event";
import Field0 from "@hashicorp/design-system-components/components/hds/form/textarea/field";
import Display from "@hashicorp/design-system-components/components/hds/text/display";
import HelperText from "@hashicorp/design-system-components/components/hds/form/helper-text/index";
import ListWrapper from "admin/components/form/field/list-wrapper/index";
import SecretInput from "admin/components/form/field/secret-input/index";
import { fn, concat } from "@ember/helper";
import Field1 from "@hashicorp/design-system-components/components/hds/form/toggle/field";
import Field2 from "@hashicorp/design-system-components/components/hds/form/select/field";
import eq from "ember-truth-helpers/helpers/eq";
import can from "admin/helpers/can";

export default class FormAuthMethodLdapComponent extends Component {
  // =attributes
  /**
   * @type {object}
   */
  toAttributes = options.ldap.account_attribute_maps.to;

  /**
   * @type {string}
   */
  newToAttribute = options.ldap.account_attribute_maps.to[0];

  dereferenceAliasesList = options.ldap.dereference_aliases;

  /**
   * @type {string}
   */
  @tracked newFromAttribute = '';

  /**
   * @type {string}
   */
  @tracked newCertificate = '';

  /**
   * @type {string}
   */
  @tracked urlsArrayString = this.parseUrlsArray();

  //actions

  /**
   * @param {object} event
   */
  @action
  toggleField(event) {
    const { name: field } = event.target;
    this.args.model[field] = !this.args.model[field];
  }

  @action
  addCertificate() {
    if (this.newCertificate) {
      this.args.addStringItem('certificates', this.newCertificate);
    }
    this.newCertificate = '';
  }

  @action
  addAttributeMap() {
    if (this.newFromAttribute) {
      this.args.addAccountMapItem(
        'account_attribute_maps',
        this.newFromAttribute,
        this.newToAttribute,
      );
    }
    this.newFromAttribute = '';
  }

  /**
   * @param {object} event
   */
  @action
  setUrls(event) {
    const { value } = event.target;
    this.urlsArrayString = value;
    const array = value.split(',').map((item) => ({ value: item }));
    this.args.model.set('urls', array);
  }

  /**
   * @returns {string}
   */
  parseUrlsArray() {
    return (this.args.model.urls || []).map((item) => item.value).toString();
  }

  /**
   * @param {string} currentAttr
   */
  @action
  rollbackSecretAttrs(currentAttr) {
    const changedAttrs = this.args.model.changedAttributes();
    if (currentAttr in changedAttrs) {
      const [oldVal] = changedAttrs[currentAttr];
      set(this.args.model, currentAttr, oldVal);
    }
  }
<template>
<Form @edit={{@edit}} @onSubmit={{@submit}} @cancel={{@cancel}} @disabled={{@model.isSaving}} @showEditToggle={{if @model.isNew false true}} as |form|>

  <Field @type="text" @value={{@model.type}} name="type" disabled={{true}} as |F|>
    <F.Label>{{t "form.type.label"}}</F.Label>
  </Field>

  <Field @isOptional={{true}} @value={{@model.name}} @type="text" name="name" disabled={{form.disabled}} {{on "input" (setFromEvent @model "name")}} as |F|>
    <F.Label>{{t "form.name.label"}}</F.Label>
    <F.HelperText>{{t "form.name.help"}}</F.HelperText>
  </Field>

  <Field0 @isOptional={{true}} @value={{@model.description}} name="description" disabled={{form.disabled}} as |F|>
    <F.Label>{{t "form.description.label"}}</F.Label>
    <F.HelperText>{{t "form.description.help"}}</F.HelperText>
  </Field0>

  <div class="ldap-section">
    <Display @tag="h2" @size="400" @weight="bold" class="remove-margin">
      {{t "resources.account.title"}}
      {{t "resources.auth-method.section.connection.title"}}
    </Display>
    <HelperText @controlId="for-connection">{{t "resources.auth-method.section.connection.help"}}</HelperText>
  </div>

  <Field @isRequired={{true}} @value={{this.urlsArrayString}} @isInvalid={{@model.errors.urls}} @type="url" name="urls" disabled={{form.disabled}} {{on "input" this.setUrls}} as |F|>
    <F.Label>{{t "resources.auth-method.form.urls.label"}}</F.Label>
    <F.HelperText>{{t "resources.auth-method.form.urls.help"}}</F.HelperText>
    {{#if @model.errors.urls}}
      <F.Error as |E|>
        {{#each @model.errors.urls as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field>

  <ListWrapper @layout="horizontal" @isOptional={{true}} @disabled={{form.disabled}}>
    <:fieldset as |F|>
      <F.Legend>
        {{t "resources.auth-method.form.certificates.label"}}
      </F.Legend>
      <F.HelperText>
        {{t "resources.auth-method.form.certificates.help"}}
      </F.HelperText>

      {{#if @model.errors.certificates}}
        <F.Error as |E|>
          {{#each @model.errors.certificates as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </:fieldset>

    <:field as |F|>
      <F.Textarea @name="certificates" @options={{@model.certificates}} @model={{@model}} />
    </:field>

  </ListWrapper>

  {{#if @model.isNew}}
    <Field @isOptional={{true}} @value={{@model.client_certificate}} @isInvalid={{@model.errors.client_certificate}} @type="password" name="client_certificate" disabled={{form.disabled}} @hasVisibilityToggle={{false}} {{on "input" (setFromEvent @model "client_certificate")}} as |F|>
      <F.Label>
        {{t "resources.auth-method.form.client_certificate.label"}}
      </F.Label>
      <F.HelperText>
        {{t "resources.auth-method.form.client_certificate.help"}}
      </F.HelperText>
      {{#if @model.errors.client_certificate}}
        <F.Error as |E|>
          {{#each @model.errors.client_certificate as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </Field>

    <Field @isOptional={{true}} @value={{@model.client_certificate_key}} @isInvalid={{@model.errors.client_certificate_key}} @type="password" name="client_certificate_key" disabled={{form.disabled}} @hasVisibilityToggle={{false}} {{on "input" (setFromEvent @model "client_certificate_key")}} as |F|>
      <F.Label>
        {{t "resources.auth-method.form.client_certificate_key.label"}}
      </F.Label>
      <F.HelperText>
        {{t "resources.auth-method.form.client_certificate_key.help"}}
      </F.HelperText>
      {{#if @model.errors.client_certificate_key}}
        <F.Error as |E|>
          {{#each @model.errors.client_certificate_key as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </Field>
  {{else}}
    <SecretInput @isOptional={{true}} @value={{@model.client_certificate_key}} @isInvalid={{@model.errors.client_certificate_key}} @name="client_certificate_key" @isDisabled={{form.disabled}} @showEditButton={{true}} @cancel={{fn this.rollbackSecretAttrs "client_certificate_key"}} {{on "input" (setFromEvent @model "client_certificate_key")}} as |F|>
      <F.Label>{{t "resources.auth-method.form.client_certificate_key.label"}}</F.Label>
      <F.HelperText>{{t "resources.auth-method.form.client_certificate_key.help"}}</F.HelperText>
      {{#if @model.errors.client_certificate_key}}
        <F.Error as |E|>
          {{#each @model.errors.client_certificate_key as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </SecretInput>
  {{/if}}

  <Field1 name="start_tls" checked={{@model.start_tls}} disabled={{form.disabled}} {{on "change" this.toggleField}} as |F|>
    <F.Label>{{t "resources.auth-method.form.start_tls.label"}}</F.Label>
    <F.HelperText>{{t "resources.auth-method.form.start_tls.help"}}</F.HelperText>
  </Field1>

  <Field1 name="insecure_tls" checked={{@model.insecure_tls}} disabled={{form.disabled}} {{on "change" this.toggleField}} as |F|>
    <F.Label>{{t "resources.auth-method.form.insecure_tls.label"}}</F.Label>
    <F.HelperText>{{t "resources.auth-method.form.insecure_tls.help"}}</F.HelperText>
  </Field1>

  <div class="ldap-section">
    <Display @tag="h2" @size="400" @weight="bold" class="remove-margin">
      {{t "resources.account.title"}}
      {{t "resources.auth-method.section.authenticated-search.title"}}
    </Display>
    <HelperText @controlId="for-authenticated-search">{{t "resources.auth-method.section.authenticated-search.help"}}</HelperText>
  </div>

  <Field @isOptional={{true}} @value={{@model.bind_dn}} @type="text" name="bind_dn" disabled={{form.disabled}} {{on "input" (setFromEvent @model "bind_dn")}} as |F|>
    <F.Label>{{t "resources.auth-method.form.bind_dn.label"}}</F.Label>
    <F.HelperText>{{t "resources.auth-method.form.bind_dn.help"}}</F.HelperText>
  </Field>

  {{#if @model.isNew}}
    <Field @isOptional={{true}} @value={{@model.bind_password}} @type="password" name="bind_password" disabled={{form.disabled}} @hasVisibilityToggle={{false}} {{on "input" (setFromEvent @model "bind_password")}} as |F|>
      <F.Label>{{t "resources.auth-method.form.bind_password.label"}}</F.Label>
      <F.HelperText>
        {{t "resources.auth-method.form.bind_password.help"}}
      </F.HelperText>
    </Field>
  {{else}}
    <SecretInput @isOptional={{true}} @value={{@model.bind_password}} @isInvalid={{@model.errors.bind_password}} @name="bind_password" @isDisabled={{form.disabled}} @showEditButton={{true}} @cancel={{fn this.rollbackSecretAttrs "bind_password"}} {{on "input" (setFromEvent @model "bind_password")}} as |F|>
      <F.Label>{{t "resources.auth-method.form.bind_password.label"}}</F.Label>
      <F.HelperText>{{t "resources.auth-method.form.bind_password.help"}}</F.HelperText>
      {{#if @model.errors.bind_password}}
        <F.Error as |E|>
          {{#each @model.errors.bind_password as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </SecretInput>
  {{/if}}

  <Field @isOptional={{true}} @value={{@model.upn_domain}} @type="text" name="upn_domain" disabled={{form.disabled}} {{on "input" (setFromEvent @model "upn_domain")}} as |F|>
    <F.Label>{{t "resources.auth-method.form.upn_domain.label"}}</F.Label>
    <F.HelperText>{{t "resources.auth-method.form.upn_domain.help"}}</F.HelperText>
  </Field>

  <div class="ldap-section">
    <Display @tag="h2" @size="400" @weight="bold" class="remove-margin">
      {{t "resources.account.title"}}
      {{t "resources.auth-method.section.anonymous-search.title"}}
    </Display>
    <HelperText @controlId="for-anonymous-search">{{t "resources.auth-method.section.anonymous-search.help"}}</HelperText>
  </div>

  <Field1 name="discover_dn" checked={{@model.discover_dn}} disabled={{form.disabled}} {{on "change" this.toggleField}} as |F|>
    <F.Label>{{t "resources.auth-method.form.discover_dn.label"}}</F.Label>
    <F.HelperText>{{t "resources.auth-method.form.discover_dn.help"}}</F.HelperText>
  </Field1>

  <Field1 name="anon_group_search" checked={{@model.anon_group_search}} disabled={{form.disabled}} {{on "change" this.toggleField}} as |F|>
    <F.Label>{{t "resources.auth-method.form.anon_group_search.label"}}</F.Label>
    <F.HelperText>{{t "resources.auth-method.form.anon_group_search.help"}}</F.HelperText>
  </Field1>

  <div class="ldap-section">
    <Display @tag="h2" @size="400" @weight="bold" class="remove-margin">
      {{t "resources.account.title"}}
      {{t "resources.auth-method.section.user-entries.title"}}
    </Display>
    <HelperText @controlId="for-user-entries">{{t "resources.auth-method.section.user-entries.help"}}</HelperText>
  </div>

  <Field @isOptional={{true}} @value={{@model.user_dn}} @type="text" name="user_dn" disabled={{form.disabled}} {{on "input" (setFromEvent @model "user_dn")}} as |F|>
    <F.Label>{{t "resources.auth-method.form.user_dn.label"}}</F.Label>
    <F.HelperText>{{t "resources.auth-method.form.user_dn.help"}}</F.HelperText>
  </Field>

  <Field @isOptional={{true}} @value={{@model.user_attr}} @type="text" name="user_attr" disabled={{form.disabled}} {{on "input" (setFromEvent @model "user_attr")}} as |F|>
    <F.Label>{{t "resources.auth-method.form.user_attr.label"}}</F.Label>
    <F.HelperText>{{t "resources.auth-method.form.user_attr.help"}}</F.HelperText>
  </Field>

  <Field @isOptional={{true}} @value={{@model.user_filter}} @type="text" name="user_filter" disabled={{form.disabled}} {{on "input" (setFromEvent @model "user_filter")}} as |F|>
    <F.Label>{{t "resources.auth-method.form.user_filter.label"}}</F.Label>
    <F.HelperText>{{t "resources.auth-method.form.user_filter.help"}}</F.HelperText>
  </Field>

  <ListWrapper @layout="horizontal" @isOptional={{true}} @disabled={{form.disabled}}>
    <:fieldset as |F|>
      <F.Legend>
        {{t "resources.auth-method.form.account_attribute_maps.label"}}
      </F.Legend>
      <F.HelperText>
        {{t "resources.auth-method.form.account_attribute_maps.help"}}
      </F.HelperText>

      {{#if @model.errors.account_attribute_maps}}
        <F.Error as |E|>
          {{#each @model.errors.account_attribute_maps as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </:fieldset>
    <:field as |F|>
      <F.KeyValue @name="account_attribute_maps" @options={{@model.account_attribute_maps}} @model={{@model}} @keyLabel={{t "resources.auth-method.titles.from-attr"}} @valueLabel={{t "resources.auth-method.titles.to-attr"}} @width="100%">
        <:key as |K|>
          <K.text />
        </:key>
        <:value as |V|>
          <V.select @selectOptions={{this.toAttributes}} />
        </:value>
      </F.KeyValue>
    </:field>
  </ListWrapper>

  <div class="ldap-section">
    <Display @tag="h2" @size="400" @weight="bold" class="remove-margin">
      {{t "resources.account.title"}}
      {{t "resources.auth-method.section.group-entries.title"}}
    </Display>
    <HelperText @controlId="for-group-entries">{{t "resources.auth-method.section.group-entries.help"}}</HelperText>
  </div>

  <Field @isOptional={{true}} @value={{@model.group_dn}} @isInvalid={{@model.errors.group_dn}} @type="text" name="group_dn" disabled={{form.disabled}} {{on "input" (setFromEvent @model "group_dn")}} as |F|>
    <F.Label>{{t "resources.auth-method.form.group_dn.label"}}</F.Label>
    <F.HelperText>{{t "resources.auth-method.form.group_dn.help"}}</F.HelperText>
    {{#if @model.errors.group_dn}}
      <F.Error as |E|>
        {{#each @model.errors.group_dn as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field>

  <Field @isOptional={{true}} @value={{@model.group_attr}} @type="text" name="group_attr" disabled={{form.disabled}} {{on "input" (setFromEvent @model "group_attr")}} as |F|>
    <F.Label>{{t "resources.auth-method.form.group_attr.label"}}</F.Label>
    <F.HelperText>{{t "resources.auth-method.form.group_attr.help"}}</F.HelperText>
  </Field>

  <Field @isOptional={{true}} @value={{@model.group_filter}} @type="text" name="group_filter" disabled={{form.disabled}} {{on "input" (setFromEvent @model "group_filter")}} as |F|>
    <F.Label>{{t "resources.auth-method.form.group_filter.label"}}</F.Label>
    <F.HelperText>{{t "resources.auth-method.form.group_filter.help"}}</F.HelperText>
  </Field>

  <Field1 name="enable_groups" checked={{@model.enable_groups}} disabled={{form.disabled}} {{on "change" this.toggleField}} as |F|>
    <F.Label>{{t "resources.auth-method.form.enable_groups.label"}}</F.Label>
    <F.HelperText>{{t "resources.auth-method.form.enable_groups.help"}}</F.HelperText>
  </Field1>

  <Field1 name="use_token_groups" checked={{@model.use_token_groups}} disabled={{form.disabled}} {{on "change" this.toggleField}} as |F|>
    <F.Label>{{t "resources.auth-method.form.use_token_groups.label"}}</F.Label>
    <F.HelperText>{{t "resources.auth-method.form.use_token_groups.help"}}</F.HelperText>
  </Field1>

  <Field @isOptional={{true}} @value={{@model.maximum_page_size}} @type="text" name="maximum_page_size" disabled={{form.disabled}} {{on "input" (setFromEvent @model "maximum_page_size")}} as |F|>
    <F.Label>{{t "resources.auth-method.form.maximum_page_size.label"}}</F.Label>
    <F.HelperText>{{t "resources.auth-method.form.maximum_page_size.help"}}</F.HelperText>
  </Field>

  <Field2 @isOptional={{true}} @width="100%" disabled={{form.disabled}} name="dereference_aliases" {{on "change" (setFromEvent @model "dereference_aliases")}} as |F|>
    <F.Label>{{t "resources.auth-method.form.dereference_aliases.label"}}</F.Label>
    <F.HelperText>{{t "resources.auth-method.form.dereference_aliases.help"}}</F.HelperText>
    <F.Options>
      <option disabled hidden selected value>
        {{t "titles.choose-an-option"}}
      </option>
      {{#each-in this.dereferenceAliasesList as |key value|}}
        <option value={{key}} selected={{eq key @model.dereference_aliases}}>
          {{t (concat "resources.auth-method.titles." value)}}
        </option>
      {{/each-in}}
    </F.Options>
  </Field2>

  {{#if (can "save model" @model)}}
    <form.actions @enableEditText={{t "actions.edit-form"}} @submitText={{t "actions.save"}} @cancelText={{t "actions.cancel"}} />
  {{/if}}
</Form></template>}
