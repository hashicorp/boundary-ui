/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Form from "rose/components/rose/form";
import Field from "@hashicorp/design-system-components/components/hds/form/text-input/field";
import { on } from "@ember/modifier";
import setFromEvent from "rose/helpers/set-from-event";
import t from "ember-intl/helpers/t";
import Fieldset from "@hashicorp/design-system-components/components/hds/form/fieldset/index";
import Image from "core/components/image";

export default class FormOnboardingComponent extends Component {
  // =properties

  @tracked targetAddress;
  @tracked targetAddressInvalid = false;
  @tracked targetPort;
  @tracked targetPortInvalid = false;

  /**
   * Returns true if any of the resources that are being created are still saving.
   * @type {boolean}
   */
  get isSaving() {
    const { org, project, target, role } = this.args.model;
    return org.isSaving || project.isSaving || target.isSaving || role.isSaving;
  }

  // =actions

  /**
   * Passes in target address and port to submit function for further proccessing.
   */
  @action
  submit() {
    // Check targetAddress and targetPort are valid before submit
    this.targetAddressInvalid = !this.targetAddress;
    this.targetPortInvalid = !this.targetPort;
    if (!this.targetAddressInvalid && !this.targetPortInvalid) {
      // Call submit fn passed to the form
      this.args.submit(this.targetAddress, this.targetPort);
    }
  }
<template>{{!--
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
--}}

<Form class="full-width" @cancel={{@cancel}} @onSubmit={{this.submit}} @disabled={{this.isSaving}} as |form|>
  <div class="create-resources-form">
    <Field name="targetAddress" @type="text" @value={{this.targetAddress}} @isRequired={{true}} @isInvalid={{this.targetAddressInvalid}} {{on "input" (setFromEvent this "targetAddress")}} as |F|>
      <F.Label>{{t "onboarding.add-target.titles.target-address"}}</F.Label>
      <F.HelperText>
        {{t "onboarding.add-target.descriptions.target-address"}}
      </F.HelperText>

      {{#if this.targetAddressInvalid}}
        <F.Error as |E|>
          <E.Message>{{t "errors.required-field"}}</E.Message>
        </F.Error>
      {{/if}}
    </Field>

    <Field name="targetPort" @type="text" @value={{this.targetPort}} @isRequired={{true}} @isInvalid={{this.targetPortInvalid}} {{on "input" (setFromEvent this "targetPort")}} as |F|>
      <F.Label>{{t "onboarding.add-target.titles.target-port"}}</F.Label>
      <F.HelperText>
        {{t "onboarding.add-target.descriptions.target-port"}}
      </F.HelperText>
      {{#if this.targetPortInvalid}}
        <F.Error as |E|>
          <E.Message>{{t "errors.required-field"}}</E.Message>
        </F.Error>
      {{/if}}
    </Field>
  </div>

  <Fieldset as |F|>
    <F.Legend>{{t "onboarding.add-target.titles.target-setup-info"}}</F.Legend>
    <F.Control>{{t "onboarding.add-target.descriptions.target-setup-info"}}</F.Control>
    <F.Control><Image @name="ssh-target-creation" /></F.Control>
  </Fieldset>

  <form.actions @submitText={{t "actions.save"}} @cancelText={{t "actions.do-this-later"}} />
</Form></template>}
