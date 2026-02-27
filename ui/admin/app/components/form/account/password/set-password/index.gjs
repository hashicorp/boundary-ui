/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import Form from "rose/components/rose/form";
import { fn } from "@ember/helper";
import Field from "@hashicorp/design-system-components/components/hds/form/text-input/field";
import { on } from "@ember/modifier";
import setFromEvent from "rose/helpers/set-from-event";
import t from "ember-intl/helpers/t";

export default class FormAccountPasswordSetPasswordIndexComponent extends Component {
  // =properties

  /**
   * New password property
   * @type {string}
   */
  @tracked password;

  /**
   * @type {boolean}
   */
  get cannotSave() {
    return !this.password;
  }

  // =methods

  /**
   * Unsets the password field.
   */
  resetPassword() {
    this.password = null;
  }

  // =actions

  /**
   * Submit with password value when it is allowed.
   * Callback with no arguments otherwise.
   * @param {function} fn
   * @param {string} password
   */
  @action
  submit(fn, password) {
    this.resetPassword();
    fn(password);
  }
<template>
<Form @onSubmit={{fn this.submit @submit this.password}} as |form|>

  <Field @isRequired={{true}} @value={{this.password}} @type="password" name="password" autocomplete="new-password" disabled={{form.disabled}} {{on "input" (setFromEvent this "password")}} as |F|>
    <F.Label>{{t "form.set_password.label"}}</F.Label>
    <F.HelperText>{{t "form.set_password.help"}}</F.HelperText>
  </Field>

  <form.actions @submitDisabled={{this.cannotSave}} @showCancel={{false}} @submitText={{t "actions.save"}} @cancelText={{t "actions.cancel"}} />

</Form></template>}
