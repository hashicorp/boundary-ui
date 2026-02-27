/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Form from 'rose/components/rose/form';
import Field from '@hashicorp/design-system-components/components/hds/form/text-input/field';
import t from 'ember-intl/helpers/t';
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

    <Field @value={{@model.type}} disabled={{true}} as |F|>
      <F.Label>{{t 'form.type.label'}}</F.Label>
    </Field>

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
      @value={{@model.description}}
      @isInvalid={{@model.errors.description}}
      @isOptional={{true}}
      disabled={{form.disabled}}
      as |F|
    >
      <F.Label>{{t 'form.description.label'}}</F.Label>
      <F.HelperText>{{t 'form.description.help'}}</F.HelperText>
      {{#if @model.errors.description}}
        <F.Error as |E|>
          {{#each @model.errors.description as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </Field0>

    <Field
      name='address'
      @value={{@model.address}}
      @isInvalid={{@model.errors.address}}
      @isRequired={{true}}
      disabled={{form.disabled}}
      {{on 'input' (setFromEvent @model 'address')}}
      as |F|
    >
      <F.Label>{{t 'form.address.label'}}</F.Label>
      <F.HelperText>{{t 'form.address.help'}}</F.HelperText>
      {{#if @model.errors.address}}
        <F.Error as |E|>
          {{#each @model.errors.address as |error|}}
            <E.Message
              data-test-error-message-address
            >{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </Field>

    {{#if (can 'save model' @model)}}
      <form.actions
        @enableEditText={{t 'actions.edit-form'}}
        @submitText={{t 'actions.save'}}
        @cancelText={{t 'actions.cancel'}}
      />
    {{/if}}
  </Form>
</template>
