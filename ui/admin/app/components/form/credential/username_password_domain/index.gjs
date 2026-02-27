/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class FormCredentialUsernamePasswordDomainComponent extends Component {
  // =actions

  /**
   * Pass the username input value for further processing.
   */
  @action
  handleUsername(event) {
    const { value } = event.target;
    this.processUsername(value);
  }

  /**
   * Process the username input and call the submit action
   */
  @action
  handleSubmit() {
    this.processUsername(this.args.model.username);
    this.args.submit();
  }

  /**
   * Process the username input by splitting it into username and domain
   * and updating the model accordingly.
   * @param {string} value - The input value from the username field
   */
  processUsername(value) {
    const arr = value?.split(/[@\\]/) ?? [];

    // Check if the length of the arr is 2
    // This is to avoid cases where the username might be hello@world@again
    // We let the server handle the validation in that case
    // and only update the model if we have exactly one username and one domain after splitting
    if (arr.length === 2) {
      const isDomainFirst = value.includes('\\');
      const username = isDomainFirst ? arr[1] : arr[0];
      const domain = isDomainFirst ? arr[0] : arr[1];

      // Update the model with the values only if both username and domain are present
      if (username && domain) {
        this.args.model.username = username;
        this.args.model.domain = domain;
      }
    }
  }
}

{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

<Rose::Form
  @onSubmit={{this.handleSubmit}}
  @cancel={{@cancel}}
  @disabled={{@model.isSaving}}
  @showEditToggle={{if @model.isNew false true}}
  as |form|
>

  <Hds::Form::TextInput::Field
    name='name'
    @value={{@model.name}}
    @isInvalid={{@model.errors.name}}
    disabled={{form.disabled}}
    {{on 'input' (set-from-event @model 'name')}}
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
  </Hds::Form::TextInput::Field>

  <Hds::Form::Textarea::Field
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
  </Hds::Form::Textarea::Field>

  {{#if @model.isNew}}
    <Form::Credential::Select
      @model={{@model}}
      @types={{@types}}
      @changeType={{@changeType}}
    />
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

  <Hds::Form::TextInput::Field
    name='username'
    @isRequired={{true}}
    @value={{@model.username}}
    @isInvalid={{@model.errors.username}}
    disabled={{form.disabled}}
    {{on 'input' (set-from-event @model 'username')}}
    {{on 'blur' this.handleUsername}}
    as |F|
  >
    <F.Label>{{t 'resources.credential.form.username.label'}}</F.Label>
    <F.HelperText>{{t 'resources.credential.form.username.help'}}</F.HelperText>
    {{#if @model.errors.username}}
      <F.Error as |E|>
        {{#each @model.errors.username as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Hds::Form::TextInput::Field>

  {{#if (or @model.isNew form.isEditable)}}
    <Hds::Form::TextInput::Field
      name='password'
      @isRequired={{true}}
      @type='password'
      @value={{@model.password}}
      @isInvalid={{@model.errors.password}}
      disabled={{form.disabled}}
      autocomplete='new-password'
      {{on 'input' (set-from-event @model 'password')}}
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
    </Hds::Form::TextInput::Field>
  {{/if}}

  <Hds::Form::TextInput::Field
    name='domain'
    @isRequired={{true}}
    @value={{@model.domain}}
    @isInvalid={{@model.errors.domain}}
    disabled={{form.disabled}}
    {{on 'input' (set-from-event @model 'domain')}}
    as |F|
  >
    <F.Label>{{t 'resources.credential.form.domain.label'}}</F.Label>
    <F.HelperText>{{t 'resources.credential.form.domain.help'}}</F.HelperText>
    {{#if @model.errors.domain}}
      <F.Error as |E|>
        {{#each @model.errors.domain as |error|}}
          <E.Message
            data-test-error-message-domain
          >{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Hds::Form::TextInput::Field>

  {{#if (can 'save model' @model)}}
    <form.actions
      @enableEditText={{t 'actions.edit-form'}}
      @submitText={{t 'actions.save'}}
      @cancelText={{t 'actions.cancel'}}
    />
  {{/if}}

</Rose::Form>