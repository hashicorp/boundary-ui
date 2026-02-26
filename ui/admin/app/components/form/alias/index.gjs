/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import Form from "rose/components/rose/form";
import Field from "@hashicorp/design-system-components/components/hds/form/text-input/field";
import { on } from "@ember/modifier";
import setFromEvent from "rose/helpers/set-from-event";
import t from "ember-intl/helpers/t";
import Field0 from "@hashicorp/design-system-components/components/hds/form/textarea/field";
import Fieldset from "@hashicorp/design-system-components/components/hds/form/fieldset/index";
import Group from "@hashicorp/design-system-components/components/hds/form/radio-card/group";
import Inline from "@hashicorp/design-system-components/components/hds/link/inline";
import docUrl from "core/helpers/doc-url";
import InfoField from "admin/components/info-field/index";
import can from "admin/helpers/can";

export default class FormAliasComponent extends Component {
  //actions
  /**
   * Handles input changes
   */
  @action
  handleHostIdChange({ target: { value } }) {
    this.args.model.authorize_session_arguments = {
      host_id: value,
    };
  }
<template>
<Form @onSubmit={{@submit}} @cancel={{@cancel}} @disabled={{@model.isSaving}} @showEditToggle={{if @model.isNew false true}} as |form|>
  <Field name="name" @isOptional={{true}} @value={{@model.name}} @isInvalid={{@model.errors.name}} disabled={{form.disabled}} {{on "input" (setFromEvent @model "name")}} as |F|>
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
  <Field0 name="description" @isOptional={{true}} @value={{@model.description}} @isInvalid={{@model.errors.description}} disabled={{form.disabled}} as |F|>
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

  <Fieldset as |F|>
    <F.Legend>
      {{t "resources.alias.form.options.label"}}
    </F.Legend>
    <F.HelperText>
      {{t "resources.alias.description"}}
    </F.HelperText>
    <F.Control>
      <Group @name={{t "form.type.label"}} @alignment="center" as |G|>
        <G.Legend>{{t "resources.target.form.type.label"}}</G.Legend>
        <G.RadioCard @maxWidth="15rem" @checked="true" @disabled="true" as |R|>
          <R.Label>{{t "resources.alias.form.type.label"}}</R.Label>
          <R.Description>{{t "resources.alias.form.type.help"}}</R.Description>
          <R.Icon @name="target" />
        </G.RadioCard>
      </Group>
    </F.Control>
  </Fieldset>

  <Field name="value" @isRequired={{true}} @value={{@model.value}} @isInvalid={{@model.errors.value}} disabled={{form.disabled}} {{on "input" (setFromEvent @model "value")}} as |F|>
    <F.Label>{{t "resources.alias.form.value.label"}}</F.Label>
    <F.HelperText>
      {{t "resources.alias.form.value.help"}}
      <Inline @href={{docUrl "alias.single-word-aliases"}}>
        {{t "actions.learn-more"}}
      </Inline>
    </F.HelperText>
    {{#if @model.errors.value}}
      <F.Error as |E|>
        {{#each @model.errors.value as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field>

  <Field name="destination_id" @isOptional={{true}} @value={{@model.destination_id}} @isInvalid={{@model.errors.destination_id}} readonly={{@hideTargetId}} disabled={{form.disabled}} {{on "input" (setFromEvent @model "destination_id")}} as |F|>
    <F.Label>{{t "resources.alias.form.destination_id.label"}}</F.Label>
    <F.HelperText>{{t "resources.alias.form.destination_id.help"}}</F.HelperText>
    {{#if @model.errors.destination_id}}
      <F.Error as |E|>
        {{#each @model.errors.destination_id as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field>

  <Field name="authorize_session_arguments" @isOptional={{true}} @value={{@model.authorize_session_arguments.host_id}} @isInvalid={{@model.errors.authorize_session_arguments.host_id}} disabled={{form.disabled}} {{on "input" this.handleHostIdChange}} as |F|>
    <F.Label>{{t "resources.alias.form.authorize_session_arguments.label"}}</F.Label>
    <F.HelperText>{{t "resources.alias.form.authorize_session_arguments.help"}}</F.HelperText>
    {{#if @model.errors.authorize_session_arguments.host_id}}
      <F.Error as |E|>
        {{#each @model.errors.authorize_session_arguments.host_id as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field>

  <InfoField @value={{@model.scopeModel.displayName}} @icon="globe" disabled={{form.disabled}} as |F|>
    <F.Label>{{t "resources.scope.title"}}</F.Label>
  </InfoField>

  {{#if (can "save model" @model)}}
    <form.actions @enableEditText={{t "actions.edit-form"}} @submitText={{t "actions.save"}} @cancelText={{t "actions.cancel"}} />
  {{/if}}
</Form></template>}
