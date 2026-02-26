/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import Form from "rose/components/rose/form";
import { fn } from "@ember/helper";
import InfoField from "admin/components/info-field/index";
import t from "ember-intl/helpers/t";
import Field from "@hashicorp/design-system-components/components/hds/form/text-input/field";
import { on } from "@ember/modifier";
import setFromEvent from "rose/helpers/set-from-event";
import Field0 from "@hashicorp/design-system-components/components/hds/form/textarea/field";
import can from "admin/helpers/can";

export default class FormAccountPasswordIndexComponent extends Component {
  // =properties

  /**
   * Account password property
   * @type {string}
   */
  @tracked password;

  // =methods

  /**
   * Unsets the password field.
   */
  resetPassword() {
    this.password = null;
  }

  // =actions

  /**
   * Submit with password value when it is allowed.
   * Callback with no arguments otherwise.
   * @param {function} fn
   */
  @action
  submit(fn) {
    const password = this.password;
    this.resetPassword();
    return this.args.model.isNew ? fn(password) : fn();
  }
<template>
<Form @onSubmit={{fn this.submit @submit}} @cancel={{@cancel}} @disabled={{@model.isSaving}} @showEditToggle={{if @model.isNew false true}} as |form|>
  <InfoField @value={{@model.type}} readonly={{true}} as |F|>
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

  <Field name="login_name" @value={{@model.login_name}} @isInvalid={{@model.errors.login_name}} @isRequired={{true}} disabled={{form.disabled}} {{on "input" (setFromEvent @model "login_name")}} as |F|>
    <F.Label>{{t "form.login_name.label"}}</F.Label>
    {{#if @model.errors.login_name}}
      <F.Error as |E|>
        {{#each @model.errors.login_name as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field>

  {{#if @model.isNew}}
    <Field name="password" @type="password" @value={{this.password}} @isInvalid={{@model.errors.password}} disabled={{form.disabled}} autocomplete="new-password" {{on "input" (setFromEvent this "password")}} as |F|>
      <F.Label>{{t "form.password.label"}}</F.Label>
      {{#if @model.errors.password}}
        <F.Error as |E|>
          {{#each @model.errors.password as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </Field>
  {{/if}}

  {{#if (can "save model" @model)}}
    <form.actions @enableEditText={{t "actions.edit-form"}} @submitText={{t "actions.save"}} @cancelText={{t "actions.cancel"}} />
  {{/if}}

</Form></template>}
