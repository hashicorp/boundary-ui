/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Form from 'rose/components/rose/form';
import Field from '@hashicorp/design-system-components/components/hds/form/text-input/field';
import { on } from '@ember/modifier';
import setFromEvent from 'rose/helpers/set-from-event';
import t from 'ember-intl/helpers/t';
import Field0 from '@hashicorp/design-system-components/components/hds/form/textarea/field';
import and from 'ember-truth-helpers/helpers/and';
import can from 'admin/helpers/can';
import not from 'ember-truth-helpers/helpers/not';
<template>
  <Form
    @onSubmit={{@submit}}
    @cancel={{@cancel}}
    @disabled={{@model.isSaving}}
    @showEditToggle={{if @model.isNew false true}}
    as |form|
  >

    <Field
      @isOptional={{true}}
      @value={{@model.name}}
      @isInvalid={{@model.errors.name}}
      @type='text'
      name='name'
      disabled={{form.disabled}}
      {{on 'input' (setFromEvent @model 'name')}}
      as |F|
    >
      <F.Label>{{t 'form.name.label'}}</F.Label>
      <F.HelperText>{{t 'form.name.help'}}</F.HelperText>
      {{#if @model.errors.name}}
        <F.Error as |E|>
          {{#each @model.errors.name as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </Field>

    <Field0
      @isOptional={{true}}
      @value={{@model.description}}
      @isInvalid={{@model.errors.description}}
      name='description'
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

    {{#if (and (can 'save model' @model) (not @model.isGlobal))}}
      <form.actions
        @enableEditText={{t 'actions.edit-form'}}
        @submitText={{t 'actions.save'}}
        @cancelText={{t 'actions.cancel'}}
      />
    {{/if}}

  </Form>
</template>
