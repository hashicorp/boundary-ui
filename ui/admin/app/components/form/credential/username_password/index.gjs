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
import Select from 'admin/components/form/credential/select/index';
import InfoField from 'admin/components/info-field/index';
import { concat } from '@ember/helper';
import or from 'ember-truth-helpers/helpers/or';
import can from 'admin/helpers/can';
<template>
  <Form
    @onSubmit={{@submit}}
    @cancel={{@cancel}}
    @disabled={{@model.isSaving}}
    @showEditToggle={{if @model.isNew false true}}
    as |form|
  >

    <Field
      name='name'
      @value={{@model.name}}
      @isInvalid={{@model.errors.name}}
      disabled={{form.disabled}}
      {{on 'input' (setFromEvent @model 'name')}}
      as |F|
    >
      <F.Label>{{t 'form.name.label'}}</F.Label>
      <F.HelperText>{{t 'form.name.help'}}</F.HelperText>
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

    <Field0
      name='description'
      @value={{@model.description}}
      @isInvalid={{@model.errors.description}}
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

    {{#if @model.isNew}}
      <Select @model={{@model}} @types={{@types}} @changeType={{@changeType}} />
    {{else}}
      <InfoField
        @value={{t (concat 'resources.credential.types.' @model.type)}}
        readonly={{true}}
        as |F|
      >
        <F.Label>{{t 'form.type.label'}}</F.Label>
        <F.HelperText>{{t (concat 'resources.credential.help.' @model.type)}}
        </F.HelperText>
      </InfoField>
    {{/if}}

    <Field
      name='username'
      @value={{@model.username}}
      @isInvalid={{@model.errors.username}}
      @isRequired={{true}}
      disabled={{form.disabled}}
      {{on 'input' (setFromEvent @model 'username')}}
      as |F|
    >
      <F.Label>{{t 'resources.credential.form.username.label'}}</F.Label>
      <F.HelperText>{{t
          'resources.credential.form.username.help'
        }}</F.HelperText>
      {{#if @model.errors.username}}
        <F.Error as |E|>
          {{#each @model.errors.username as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </Field>

    {{#if (or @model.isNew form.isEditable)}}
      <Field
        name='password'
        @type='password'
        @value={{@model.password}}
        @isInvalid={{@model.errors.password}}
        @isRequired={{true}}
        disabled={{form.disabled}}
        autocomplete='new-password'
        {{on 'input' (setFromEvent @model 'password')}}
        as |F|
      >
        <F.Label>{{t 'resources.credential.form.password.label'}}</F.Label>
        <F.HelperText>{{t
            'resources.credential.form.password.help'
          }}</F.HelperText>
        {{#if @model.errors.password}}
          <F.Error as |E|>
            {{#each @model.errors.password as |error|}}
              <E.Message data-test-error-message-password>
                {{error.message}}
              </E.Message>
            {{/each}}
          </F.Error>
        {{/if}}
      </Field>
    {{/if}}

    {{#if (can 'save model' @model)}}
      <form.actions
        @enableEditText={{t 'actions.edit-form'}}
        @submitText={{t 'actions.save'}}
        @cancelText={{t 'actions.cancel'}}
      />
    {{/if}}

  </Form>
</template>
