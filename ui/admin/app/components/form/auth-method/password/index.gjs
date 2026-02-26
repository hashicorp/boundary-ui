/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Form from 'rose/components/rose/form';
import InfoField from 'admin/components/info-field/index';
import t from 'ember-intl/helpers/t';
import Field from '@hashicorp/design-system-components/components/hds/form/text-input/field';
import { on } from '@ember/modifier';
import setFromEvent from 'rose/helpers/set-from-event';
import Field0 from '@hashicorp/design-system-components/components/hds/form/textarea/field';
import can from 'admin/helpers/can';
<template>
  <Form
    @onSubmit={{@submit}}
    @cancel={{@cancel}}
    @disabled={{@model.isSaving}}
    @showEditToggle={{if @model.isNew false true}}
    as |form|
  >
    <InfoField @value={{@model.type}} disabled={{form.disabled}} as |F|>
      <F.Label>{{t 'form.type.label'}}</F.Label>
    </InfoField>

    <Field
      name='name'
      @value={{@model.name}}
      @isInvalid={{@model.errors.name}}
      @isOptional={{true}}
      disabled={{form.disabled}}
      {{on 'input' (setFromEvent @model 'name')}}
      as |F|
    >
      <F.Label>{{t 'form.name.label'}}</F.Label>
      <F.HelperText>{{t 'form.name.help'}}</F.HelperText>
      {{#if @model.errors.name}}
        <F.Error as |E|>
          {{#each @model.errors.name as |error|}}
            <E.Message
              data-test-error-message-name
            >{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </Field>

    <Field0
      name='description'
      @isOptional={{true}}
      @value={{@model.description}}
      @isInvalid={{@model.errors.description}}
      disabled={{form.disabled}}
      as |F|
    >
      <F.Label>{{t 'form.description.label'}}</F.Label>
      <F.HelperText>{{t 'form.description.help'}}</F.HelperText>
    </Field0>

    {{#if (can 'save model' @model)}}
      <form.actions
        @enableEditText={{t 'actions.edit-form'}}
        @submitText={{t 'actions.save'}}
        @cancelText={{t 'actions.cancel'}}
      />
    {{/if}}
  </Form>
</template>
