/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { TYPE_TARGET_TCP, TYPE_TARGET_RDP, TYPE_TARGET_SSH } from 'api/models/target';
import { service } from '@ember/service';
import Alert from "@hashicorp/design-system-components/components/hds/alert/index";
import t from "ember-intl/helpers/t";
import Form from "rose/components/rose/form";
import Field from "@hashicorp/design-system-components/components/hds/form/text-input/field";
import { on } from "@ember/modifier";
import setFromEvent from "rose/helpers/set-from-event";
import Field0 from "@hashicorp/design-system-components/components/hds/form/textarea/field";
import Group from "@hashicorp/design-system-components/components/hds/form/radio-card/group";
import eq from "ember-truth-helpers/helpers/eq";
import { fn, concat } from "@ember/helper";
import InfoField from "admin/components/info-field/index";
import featureFlag from "ember-feature-flags/helpers/feature-flag";
import not from "ember-truth-helpers/helpers/not";
import and from "ember-truth-helpers/helpers/and";
import can from "admin/helpers/can";
import ListWrapper from "admin/components/form/field/list-wrapper/index";

const icons = {
  ssh: 'terminal-screen',
  tcp: 'network',
  rdp: 'monitor',
};

export default class FormTargetComponent extends Component {
  // =services

  @service features;

  /**
   * maps resource type with icon
   * @type {object}
   */
  get typeMetas() {
    const types = [TYPE_TARGET_TCP];
    if (this.isSSHEnabled) types.push(TYPE_TARGET_SSH);
    if (this.isRDPEnabled) types.push(TYPE_TARGET_RDP);

    return types.map((type) => ({
      type,
      icon: icons[type],
    }));
  }

  /**
   * returns icons based on the model type
   * unlike other resources, this is needed as we use generic details component for both tcp and ssh
   * @type {string}
   */
  get icon() {
    return icons[this.args.model.type];
  }

  get isRDPEnabled() {
    return this.features.isEnabled('rdp-target');
  }

  get isSSHEnabled() {
    return this.features.isEnabled('ssh-target');
  }

  /**
   * Checks if the injected application credential alert should be shown for SSH and RDP targets.
   * @type {boolean}
   */
  get showInjectedApplicationCredentialAlert() {
    return (
      !this.args.model.isNew &&
      this.args.model.injected_application_credential_source_ids.length === 0 &&
      this.args.model.type !== TYPE_TARGET_TCP
    );
  }

  /**
   * Checks if the target type radio group should be displayed.
   * This is true if either the 'rdp-target' or 'ssh-target' feature is enabled.
   * @returns {boolean}
   * @type {boolean}
   */
  get showTargetTypeRadioGroup() {
    return (this.isRDPEnabled || this.isSSHEnabled) && this.args.model.isNew;
  }
<template>{{!--
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
--}}

{{#if this.showInjectedApplicationCredentialAlert}}
  <Alert data-test-injected-application-credential-alert class="injected-app-credential-alert" @type="inline" @color="critical" as |A|>
    <A.Title>{{t "resources.target.injected-application-credential-source.messages.alert.title"}}</A.Title>
    <A.Description>{{t "resources.target.injected-application-credential-source.messages.alert.description"}}</A.Description>
    <A.Button @color="secondary" @text={{t "resources.target.injected-application-credential-source.messages.alert.action"}} @route="scopes.scope.targets.target.add-injected-application-credential-sources" @model={{@model}} />
  </Alert>
{{/if}}

<Form class={{unless @model.isNew "full-width"}} @onSubmit={{@submit}} @cancel={{@cancel}} @disabled={{@model.isSaving}} @showEditToggle={{if @model.isNew false true}} as |form|>
  <Field @isRequired={{true}} @isOptional={{false}} @value={{@model.name}} @isInvalid={{@model.errors.name}} @type="text" name="name" disabled={{form.disabled}} {{on "input" (setFromEvent @model "name")}} as |F|>
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

  {{#if this.showTargetTypeRadioGroup}}
    <Group @name={{t "form.type.label"}} @alignment="center" as |G|>
      <G.Legend>{{t "resources.target.form.type.label"}}</G.Legend>
      <G.HelperText>{{t "resources.target.form.type.help"}}</G.HelperText>
      {{#each this.typeMetas as |type|}}
        <G.RadioCard @value={{type.type}} @maxWidth="20rem" @checked={{eq type.type @model.type}} {{on "input" (fn @changeType type.type)}} as |R|>
          <R.Label>{{t (concat "resources.target.types." type.type)}}</R.Label>
          <R.Description>{{t (concat "resources.target.help." type.type)}}</R.Description>
          <R.Icon @name={{type.icon}} />
        </G.RadioCard>
      {{/each}}
    </Group>
  {{else}}
    <InfoField @value={{t (concat "resources.target.types." @model.type)}} @icon={{this.icon}} as |F|>
      <F.Label>{{t "form.type.label"}}</F.Label>
      <F.HelperText>
        {{t (concat "resources.target.help." @model.type)}}
      </F.HelperText>
    </InfoField>
  {{/if}}

  {{#if (featureFlag "target-network-address")}}
    <Field @isOptional={{true}} @value={{@model.address}} @isInvalid={{@model.errors.address}} @type="text" name="address" disabled={{form.disabled}} {{on "input" (setFromEvent @model "address")}} as |F|>
      <F.Label>{{t "resources.target.form.target-address.label"}}</F.Label>
      <F.HelperText>{{t "resources.target.form.target-address.help"}}</F.HelperText>
      {{#if @model.errors.address}}
        <F.Error as |E|>
          {{#each @model.errors.address as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </Field>
  {{/if}}

  <Field @isRequired={{@model.isTCP}} @isOptional={{not @model.isTCP}} @value={{@model.default_port}} @isInvalid={{@model.errors.default_port}} @type="text" name="default_port" disabled={{form.disabled}} placeholder={{@defaultPort}} {{on "input" (setFromEvent @model "default_port")}} as |F|>
    <F.Label data-test-default-port-label>{{t "resources.target.form.default_port.label"}}</F.Label>
    <F.HelperText>{{t "resources.target.form.default_port.help"}}</F.HelperText>
    {{#if @model.errors.default_port}}
      <F.Error as |E|>
        {{#each @model.errors.default_port as |error|}}
          <E.Message data-test-error-message-default-port>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field>

  <Field @isOptional={{true}} @value={{@model.default_client_port}} @isInvalid={{@model.errors.default_client_port}} @type="text" name="default_client_port" disabled={{form.disabled}} {{on "input" (setFromEvent @model "default_client_port")}} as |F|>
    <F.Label>{{t "resources.target.form.default_client_port.label"}}</F.Label>
    <F.HelperText data-test-default-client-port-helper-text>
      {{t "resources.target.form.default_client_port.help"}}
      {{#if (eq @model.type "rdp")}}
        <br />
        {{t "resources.target.form.default_client_port.rdp-windows-notice"}}
      {{/if}}
    </F.HelperText>
    {{#if @model.errors.default_client_port}}
      <F.Error as |E|>
        {{#each @model.errors.default_client_port as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field>

  <Field @isOptional={{true}} @value={{@model.session_max_seconds}} @isInvalid={{@model.errors.session_max_seconds}} @type="text" name="session_max_seconds" disabled={{form.disabled}} {{on "input" (setFromEvent @model "session_max_seconds")}} as |F|>
    <F.Label>{{t "form.session_max_seconds.label"}}</F.Label>
    <F.HelperText>{{t "form.session_max_seconds.help"}}</F.HelperText>
    {{#if @model.errors.session_max_seconds}}
      <F.Error as |E|>
        {{#each @model.errors.session_max_seconds as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field>

  <Field @isOptional={{true}} @value={{@model.session_connection_limit}} @isInvalid={{@model.errors.session_connection_limit}} @type="text" name="session_connection_limit" disabled={{form.disabled}} {{on "input" (setFromEvent @model "session_connection_limit")}} as |F|>
    <F.Label>{{t "form.session_connection_limit.label"}}</F.Label>
    <F.HelperText data-test-max-connections-helper-text>
      {{t "form.session_connection_limit.help"}}
      {{#if (eq @model.type "rdp")}}
        <br />
        {{t "form.session_connection_limit.rdp-windows-notice"}}
      {{/if}}
    </F.HelperText>
    {{#if @model.errors.session_connection_limit}}
      <F.Error as |E|>
        {{#each @model.errors.session_connection_limit as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Field>

  {{#if (and @model.isNew (can "create model" @globalScope collection="aliases"))}}
    <ListWrapper @layout="horizontal" @isOptional={{true}} @disabled={{form.disabled}}>
      <:fieldset as |F|>
        <F.Legend>
          {{t "resources.alias.form.alias.label"}}
        </F.Legend>
        <F.HelperText>
          {{t "resources.alias.form.alias.help"}}
        </F.HelperText>

        {{#if @model.errors.with_aliases}}
          <F.Error as |E|>
            {{#each @model.errors.with_aliases as |error|}}
              <E.Message>{{error.message}}</E.Message>
            {{/each}}
          </F.Error>
        {{/if}}
      </:fieldset>

      <:field as |F|>
        <F.TextInput @name="with_aliases" @options={{@model.with_aliases}} @model={{@model}} />
      </:field>

    </ListWrapper>
  {{/if}}
  {{#if (can "save model" @model)}}
    <form.actions @enableEditText={{t "actions.edit-form"}} @submitText={{t "actions.save"}} @cancelText={{t "actions.cancel"}} />
  {{/if}}

</Form></template>}
