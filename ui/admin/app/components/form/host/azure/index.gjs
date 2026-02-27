/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Form from 'rose/components/rose/form';
import Field from '@hashicorp/design-system-components/components/hds/form/text-input/field';
import t from 'ember-intl/helpers/t';
import Field0 from '@hashicorp/design-system-components/components/hds/form/textarea/field';
import InfoField from 'admin/components/info-field/index';
import Fieldset from '@hashicorp/design-system-components/components/hds/form/fieldset/index';
import Base from '@hashicorp/design-system-components/components/hds/form/text-input/base';
import can from 'admin/helpers/can';
<template>
  <Form
    @onSubmit={{@submit}}
    @cancel={{@cancel}}
    @disabled={{@model.isSaving}}
    @showEditToggle={{if @model.isNew false true}}
    as |form|
  >

    <Field @value={{@model.type}} name='type' disabled={{true}} as |F|>
      <F.Label>{{t 'form.type.label'}}</F.Label>
    </Field>

    {{#if @model.external_name}}
      <Field
        @value={{@model.external_name}}
        @isInvalid={{@model.errors.external_name}}
        name='external_name'
        disabled={{true}}
        as |F|
      >
        <F.Label>{{t 'form.external_name.label'}}</F.Label>
        <F.HelperText>{{t 'form.external_name.help'}}</F.HelperText>
      </Field>
    {{/if}}

    <Field
      @value={{@model.external_id}}
      @isInvalid={{@model.errors.external_id}}
      name='external_id'
      disabled={{true}}
      as |F|
    >
      <F.Label>{{t 'form.external_id.label'}}</F.Label>
      <F.HelperText>{{t 'form.external_id.help'}}</F.HelperText>
    </Field>

    <Field0
      @value={{@model.description}}
      @isInvalid={{@model.errors.description}}
      name='description'
      disabled={{true}}
      as |F|
    >
      <F.Label>{{t 'form.description.label'}}</F.Label>
      <F.HelperText>{{t 'form.description.help'}}</F.HelperText>
    </Field0>

    <InfoField
      @value={{t 'descriptions.provider'}}
      @icon='azure-color'
      disabled={{form.disabled}}
      as |F|
    >
      <F.Label>{{t 'titles.provider'}}</F.Label>
      <F.HelperText>
        {{t 'resources.host-catalog.types.azure'}}
      </F.HelperText>
    </InfoField>

    <Fieldset class='container-inputs__margin-bottom' as |F|>
      <F.Legend>{{t 'form.ip_addresses.label'}}</F.Legend>
      <F.HelperText>{{t 'form.ip_addresses.help'}} </F.HelperText>
      {{#each @model.ip_addresses as |ip_address|}}
        <F.Control>
          <Base @value={{ip_address}} disabled={{true}} @width='unset' />
        </F.Control>
      {{/each}}
    </Fieldset>

    {{#if (can 'save model' @model)}}
      <form.actions
        @enableEditText={{t 'actions.edit-form'}}
        @submitText={{t 'actions.save'}}
        @cancelText={{t 'actions.cancel'}}
      />
    {{/if}}
  </Form>
</template>
