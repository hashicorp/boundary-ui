import Form from "rose/components/rose/form";
import InfoField from "admin/components/info-field/index";
import t from "ember-intl/helpers/t";
import Field from "@hashicorp/design-system-components/components/hds/form/text-input/field";
import { on } from "@ember/modifier";
import setFromEvent from "rose/helpers/set-from-event";
import Field0 from "@hashicorp/design-system-components/components/hds/form/textarea/field";
import Fieldset from "@hashicorp/design-system-components/components/hds/form/fieldset/index";
import Display from "@hashicorp/design-system-components/components/hds/text/display";
import HelperText from "@hashicorp/design-system-components/components/hds/form/helper-text/index";
import Body from "@hashicorp/design-system-components/components/hds/text/body";
import can from "admin/helpers/can";
<template>{{!--
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
--}}

<Form @onSubmit={{@submit}} @cancel={{@cancel}} @disabled={{@model.isSaving}} @showEditToggle={{if @model.isNew false true}} as |form|>
  <InfoField @value={{@model.type}} disabled={{form.disabled}} as |F|>
    <F.Label>{{t "form.type.label"}}</F.Label>
  </InfoField>

  <Field @isOptional={{true}} name="name" @value={{@model.name}} @isInvalid={{@model.errors.name}} disabled={{form.disabled}} {{on "input" (setFromEvent @model "name")}} as |F|>
    <F.Label>{{t "form.name.label"}}</F.Label>
    <F.HelperText>{{t "form.name.help"}}</F.HelperText>
    {{#if @model.errors.name}}
      <F.Error as |E|>
        {{#each @model.errors.name as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field>

  <Field0 @isOptional={{true}} @value={{@model.description}} @isInvalid={{@model.errors.description}} name="description" disabled={{form.disabled}} as |F|>
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
    <Field @isRequired={{true}} name="login_name" @value={{@model.login_name}} @isInvalid={{@model.errors.login_name}} disabled={{form.disabled}} {{on "input" (setFromEvent @model "login_name")}} as |F|>
      <F.Label>{{t "form.login_name.label"}}</F.Label>
      <F.HelperText>{{t "form.login_name.help"}}</F.HelperText>
      {{#if @model.errors.login_name}}
        <F.Error as |E|>
          {{#each @model.errors.login_name as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </Field>
  {{/if}}

  {{#unless @model.isNew}}
    <Fieldset class="ldap-read-only-fields" as |F|>

      <F.Control>
        <div class="ldap-section">
          <Display @tag="h2" @size="400" @weight="bold" class="remove-margin">
            {{t "resources.account.title"}}
            {{t "form.other_fields.label"}}
          </Display>
          <HelperText @controlId="helper-text-for-section">{{t "form.other_fields.help"}}</HelperText>
        </div>

        {{#if @model.login_name}}
          <InfoField @value={{@model.login_name}} as |F|>
            <F.Label>{{t "form.login_name.label"}}</F.Label>
          </InfoField>
        {{/if}}
        {{#if @model.email}}
          <InfoField @value={{@model.email}} as |F|>
            <F.Label>{{t "resources.account.form.email.label"}}</F.Label>
          </InfoField>
        {{/if}}
        {{#if @model.full_name}}
          <InfoField @value={{@model.full_name}} as |F|>
            <F.Label>{{t "resources.account.form.full_name.label"}}</F.Label>
          </InfoField>
        {{/if}}
        {{#if @model.dn}}
          <InfoField @value={{@model.dn}} as |F|>
            <F.Label>{{t "resources.account.form.dn.label"}}</F.Label>
          </InfoField>
        {{/if}}

        {{#if @model.member_of_groups}}
          <Body @tag="p" @size="300" @weight="semibold" class="p">{{t "resources.account.form.member_of_groups.label"}}</Body>
          {{#each @model.member_of_groups as |group|}}
            <Field @value={{group.value}} disabled={{true}} />
          {{/each}}
        {{/if}}

      </F.Control>
    </Fieldset>
  {{/unless}}
  {{#if (can "save model" @model)}}
    <form.actions @enableEditText={{t "actions.edit-form"}} @submitText={{t "actions.save"}} @cancelText={{t "actions.cancel"}} />
  {{/if}}

</Form></template>