import Form from "rose/components/rose/form";
import Field from "@hashicorp/design-system-components/components/hds/form/text-input/field";
import { on } from "@ember/modifier";
import setFromEvent from "rose/helpers/set-from-event";
import t from "ember-intl/helpers/t";
import Field0 from "@hashicorp/design-system-components/components/hds/form/textarea/field";
import InfoField from "admin/components/info-field/index";
import ListWrapper from "admin/components/form/field/list-wrapper/index";
import Inline from "@hashicorp/design-system-components/components/hds/link/inline";
import docUrl from "core/helpers/doc-url";
import can from "admin/helpers/can";
<template>{{!--
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
--}}

<Form @edit={{@edit}} @onSubmit={{@submit}} @cancel={{@cancel}} @disabled={{@model.isSaving}} @showEditToggle={{if @model.isNew false true}} as |form|>

  <Field name="name" @value={{@model.name}} @isOptional={{true}} @isInvalid={{@model.errors.name}} disabled={{form.disabled}} {{on "input" (setFromEvent @model "name")}} as |F|>
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

  <Field0 name="description" @value={{@model.description}} @isOptional={{true}} @isInvalid={{@model.errors.description}} disabled={{form.disabled}} as |F|>
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

  <InfoField @value={{@model.type}} as |F|>
    <F.Label>{{t "form.type.label"}}</F.Label>
  </InfoField>

  <InfoField @value={{t "descriptions.provider"}} @icon="aws-color" as |F|>
    <F.Label>{{t "titles.provider"}}</F.Label>
    <F.HelperText>
      {{t "resources.host-catalog.types.aws"}}
    </F.HelperText>
  </InfoField>

  <ListWrapper @layout="horizontal" @isOptional={{true}} @disabled={{form.disabled}}>
    <:fieldset as |F|>
      <F.Legend>
        {{t "resources.host-set.form.preferred_endpoints.label"}}
      </F.Legend>
      <F.HelperText>
        {{t "resources.host-set.form.preferred_endpoints.help"}}
      </F.HelperText>

      {{#if @model.errors.preferred_endpoints}}
        <F.Error as |E|>
          {{#each @model.errors.preferred_endpoints as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </:fieldset>
    <:field as |F|>
      <F.TextInput @name="preferred_endpoints" @options={{@model.preferred_endpoints}} @model={{@model}} />
    </:field>
  </ListWrapper>

  <ListWrapper @layout="horizontal" @isOptional={{true}} @disabled={{form.disabled}}>
    <:fieldset as |F|>
      <F.Legend>
        {{t "resources.host-set.form.filter.label"}}
      </F.Legend>
      <F.HelperText>
        {{t "resources.host-set.form.filter.aws.help"}}
      </F.HelperText>

      {{#if @model.errors.filters}}
        <F.Error as |E|>
          {{#each @model.errors.filters as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </:fieldset>
    <:field as |F|>
      <F.TextInput @name="filters" @options={{@model.filters}} @model={{@model}} />
    </:field>
  </ListWrapper>

  <Field name="sync_interval_seconds" @value={{@model.sync_interval_seconds}} @isInvalid={{@model.errors.sync_interval_seconds}} @isOptional={{true}} disabled={{form.disabled}} {{on "input" (setFromEvent @model "sync_interval_seconds")}} as |F|>
    <F.Label>{{t "form.sync-interval.label"}}</F.Label>
    <F.HelperText>
      {{t "form.sync-interval.help"}}
      <Inline @href={{docUrl "host-set.sync-interval-seconds"}}>
        {{t "actions.learn-more"}}
      </Inline>
    </F.HelperText>
    {{#if @model.errors.sync_interval_seconds}}
      <F.Error as |E|>
        {{#each @model.errors.sync_interval_seconds as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field>

  {{#if (can "save model" @model)}}
    <form.actions @enableEditText={{t "actions.edit-form"}} @submitText={{t "actions.save"}} @cancelText={{t "actions.cancel"}} />
  {{/if}}
</Form></template>