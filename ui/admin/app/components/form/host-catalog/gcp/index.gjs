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
import Group from '@hashicorp/design-system-components/components/hds/form/radio-card/group';
import eq from 'ember-truth-helpers/helpers/eq';
import { fn, concat } from '@ember/helper';
import InfoField from 'admin/components/info-field/index';
import Inline from '@hashicorp/design-system-components/components/hds/link/inline';
import docUrl from 'core/helpers/doc-url';
import featureFlag from 'ember-feature-flags/helpers/feature-flag';
import Field1 from '@hashicorp/design-system-components/components/hds/form/checkbox/field';
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
            <E.Message>{{error.message}}</E.Message>
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

    {{#if @model.isNew}}
      <Group @name={{t 'form.type.label'}} as |G|>
        <G.Legend>{{t 'form.type.label'}}</G.Legend>
        {{#each @hostCatalogTypes as |hostCatalogType|}}
          <G.RadioCard
            @value={{hostCatalogType}}
            @maxWidth='20rem'
            @checked={{eq hostCatalogType @model.type}}
            {{on 'input' (fn @changeType hostCatalogType)}}
            as |R|
          >
            <R.Label>{{t
                (concat 'resources.host-catalog.types.' hostCatalogType)
              }}</R.Label>
            <R.Description>{{t
                (concat 'resources.host-catalog.help.' hostCatalogType)
              }}</R.Description>
          </G.RadioCard>
        {{/each}}
      </Group>
      <Group @name={{t 'form.plugin_type.label'}} @alignment='center' as |G|>
        <G.Legend>{{t 'titles.provider'}}</G.Legend>
        <G.Legend>{{t 'titles.choose-a-provider'}}</G.Legend>
        <G.HelperText>{{concat
            (t 'descriptions.choose-a-provider')
          }}</G.HelperText>

        {{#each-in @mapResourceTypeWithIcon as |pluginType icon|}}
          <G.RadioCard
            @value={{pluginType}}
            @maxWidth='20rem'
            @checked={{eq pluginType @model.compositeType}}
            {{on 'input' (fn @changeType pluginType)}}
            as |R|
          >
            <R.Label>{{t
                (concat 'resources.host-catalog.types.' pluginType)
              }}</R.Label>
            <R.Icon @name={{icon}} />
          </G.RadioCard>
        {{/each-in}}
      </Group>
    {{else}}
      <InfoField
        @value={{t 'resources.host-catalog.types.gcp'}}
        @icon='gcp-color'
        disabled={{true}}
        as |F|
      >
        <F.Label>{{t 'titles.provider'}}</F.Label>
        <F.HelperText>{{t 'descriptions.provider'}}
        </F.HelperText>
      </InfoField>
    {{/if}}

    <Field
      name='project_id'
      @value={{@model.project_id}}
      @isInvalid={{@model.errors.project_id}}
      @isRequired={{true}}
      disabled={{form.disabled}}
      {{on 'input' (setFromEvent @model 'project_id')}}
      as |F|
    >
      <F.Label>{{t 'resources.host-catalog.form.project_id.label'}}</F.Label>
      <F.HelperText>{{t 'resources.host-catalog.form.project_id.help'}}
        <Inline @href={{docUrl 'host-catalog.gcp'}}>
          {{t 'actions.learn-more'}}
        </Inline>
      </F.HelperText>
      {{#if @model.errors.project_id}}
        <F.Error as |E|>
          {{#each @model.errors.project_id as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </Field>

    <Field
      name='zone'
      @value={{@model.zone}}
      @isInvalid={{@model.errors.zone}}
      @isRequired={{true}}
      disabled={{form.disabled}}
      {{on 'input' (setFromEvent @model 'zone')}}
      as |F|
    >
      <F.Label>{{t 'resources.host-catalog.form.zone.label'}}</F.Label>
      <F.HelperText>{{t 'resources.host-catalog.form.zone.help'}}
        <Inline @href={{docUrl 'host-catalog.gcp'}}>
          {{t 'actions.learn-more'}}
        </Inline>
      </F.HelperText>
      {{#if @model.errors.zone}}
        <F.Error as |E|>
          {{#each @model.errors.zone as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </Field>

    <Field
      name='client_email'
      @value={{@model.client_email}}
      @isInvalid={{@model.errors.client_email}}
      @isOptional={{true}}
      disabled={{form.disabled}}
      {{on 'input' (setFromEvent @model 'client_email')}}
      as |F|
    >
      <F.Label>{{t 'resources.host-catalog.form.client_email.label'}}</F.Label>
      <F.HelperText>
        {{t 'resources.host-catalog.form.client_email.help'}}
        <Inline @href={{docUrl 'host-catalog.gcp'}}>
          {{t 'actions.learn-more'}}
        </Inline>
      </F.HelperText>
      {{#if @model.errors.client_email}}
        <F.Error as |E|>
          {{#each @model.errors.client_email as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </Field>

    <Field
      name='target_service_account_id'
      @value={{@model.target_service_account_id}}
      @isInvalid={{@model.errors.target_service_account_id}}
      @isOptional={{true}}
      disabled={{form.disabled}}
      {{on 'input' (setFromEvent @model 'target_service_account_id')}}
      as |F|
    >
      <F.Label>{{t
          'resources.host-catalog.form.target_service_account_id.label'
        }}</F.Label>
      <F.HelperText>{{t
          'resources.host-catalog.form.target_service_account_id.help'
        }}
        <Inline @href={{docUrl 'host-catalog.gcp'}}>
          {{t 'actions.learn-more'}}
        </Inline>
      </F.HelperText>
      {{#if @model.errors.target_service_account_id}}
        <F.Error as |E|>
          {{#each @model.errors.target_service_account_id as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </Field>

    <Field
      name='private_key_id'
      @type='password'
      @value={{@model.private_key_id}}
      @isInvalid={{@model.errors.private_key_id}}
      @isOptional={{true}}
      disabled={{form.disabled}}
      {{on 'input' (setFromEvent @model 'private_key_id')}}
      as |F|
    >
      <F.Label>{{t
          'resources.host-catalog.form.private_key_id.label'
        }}</F.Label>
      <F.HelperText>{{t 'resources.host-catalog.form.private_key_id.help'}}
        <Inline @href={{docUrl 'host-catalog.gcp'}}>
          {{t 'actions.learn-more'}}
        </Inline>
      </F.HelperText>
      {{#if @model.errors.private_key_id}}
        <F.Error as |E|>
          {{#each @model.errors.private_key_id as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </Field>

    <Field0
      name='private_key'
      @value={{@model.private_key}}
      @isInvalid={{@model.errors.private_key}}
      @isOptional={{true}}
      disabled={{form.disabled}}
      as |F|
    >
      <F.Label>{{t 'resources.host-catalog.form.private_key.label'}}</F.Label>
      <F.HelperText>{{t 'resources.host-catalog.form.private_key.help'}}
        <Inline @href={{docUrl 'host-catalog.gcp'}}>
          {{t 'actions.learn-more'}}
        </Inline>
      </F.HelperText>
      {{#if @model.errors.private_key}}
        <F.Error as |E|>
          {{#each @model.errors.private_key as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </Field0>

    {{#if (featureFlag 'worker-filter')}}
      <Field0
        name='worker_filter'
        @value={{@model.worker_filter}}
        @isOptional={{true}}
        @isInvalid={{@model.errors.worker_filter}}
        disabled={{form.disabled}}
        as |F|
      >
        <F.Label>{{t 'form.worker_filter.label'}}</F.Label>
        <F.HelperText>
          {{t 'resources.host-catalog.form.worker_filter.help'}}
          <Inline @href={{docUrl 'worker.create-tags'}}>
            {{t 'actions.learn-more'}}
          </Inline>
        </F.HelperText>
        {{#if @model.errors.worker_filter}}
          <F.Error as |E|>
            {{#each @model.errors.worker_filter as |error|}}
              <E.Message>
                {{error.message}}
              </E.Message>
            {{/each}}
          </F.Error>
        {{/if}}
      </Field0>
    {{/if}}

    <Field1
      name='disable_credential_rotation'
      checked={{@model.disable_credential_rotation}}
      disabled={{form.disabled}}
      {{on 'change' (fn @toggleDisableCredentialRotation @model)}}
      as |F|
    >
      <F.Label>{{t 'form.disable_credential_rotation.label'}}</F.Label>
    </Field1>

    {{#if (can 'save model' @model)}}
      <form.actions
        @enableEditText={{t 'actions.edit-form'}}
        @submitText={{t 'actions.save'}}
        @cancelText={{t 'actions.cancel'}}
      />
    {{/if}}

  </Form>
</template>
