/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import Form from "rose/components/rose/form";
import Field from "@hashicorp/design-system-components/components/hds/form/toggle/field";
import { on } from "@ember/modifier";
import t from "ember-intl/helpers/t";
import Field0 from "@hashicorp/design-system-components/components/hds/form/select/field";
import eq from "ember-truth-helpers/helpers/eq";
import Standalone from "@hashicorp/design-system-components/components/hds/link/standalone";

export default class FormEnableSessionRecordingIndexComponent extends Component {
  //actions
  /**
   * toggle to enable session recording for the target
   */
  @action
  toggleSessionRecording() {
    this.args.model.enable_session_recording =
      !this.args.model.enable_session_recording;
  }

  @action
  selectStorageBucket({ target: { value: selectedStorageBucketID } }) {
    this.args.model.storage_bucket_id = selectedStorageBucketID;
  }
<template>{{!--
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
--}}

<Form @onSubmit={{@submit}} @cancel={{@cancel}} as |form|>
  <div class="enable-session-recording-toggle">
    <Field name="target-enable-session-recording" checked={{@model.enable_session_recording}} {{on "change" this.toggleSessionRecording}} as |F|>
      <F.Label>{{t "resources.target.enable-session-recording.form.filter.label"}}</F.Label>
    </Field>
    {{#if @model.enable_session_recording}}
      <Field0 @isRequired={{true}} @isInvalid={{@model.errors.storage_bucket_id}} @value={{@model.storage_bucket_id}} @type="text" @width="100%" name="storage_bucket_id" {{on "change" this.selectStorageBucket}} as |F|>
        <F.Label>{{t "resources.target.enable-session-recording.form.select.label"}}</F.Label>
        <F.HelperText>
          {{t "resources.target.enable-session-recording.form.select.description"}}
        </F.HelperText>
        <F.Options>
          <option disabled hidden selected value>{{t "titles.choose-an-option"}}</option>
          {{#each @storageBucketList as |bucket|}}
            <option value={{bucket.id}} selected={{eq @model.storage_bucket_id bucket.id}}>
              {{bucket.displayName}}
            </option>
          {{/each}}
        </F.Options>
        {{#if @model.errors.storage_bucket_id}}
          <F.Error as |E|>
            {{#each @model.errors.storage_bucket_id as |error|}}
              <E.Message>{{error.message}}</E.Message>
            {{/each}}
          </F.Error>
        {{/if}}
      </Field0>
    {{/if}}

    <Standalone @color="primary" @icon="plus" @text={{t "resources.storage-bucket.messages.none.link"}} @route="scopes.scope.targets.target.enable-session-recording.create-storage-bucket" />
    <form.actions @enableEditText={{t "actions.edit-form"}} @submitText={{t "actions.save"}} @cancelText={{t "actions.cancel"}} />

  </div>
</Form></template>}
