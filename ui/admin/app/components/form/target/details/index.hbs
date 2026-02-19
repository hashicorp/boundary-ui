{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

{{#if this.showInjectedApplicationCredentialAlert}}
  <Hds::Alert
    data-test-injected-application-credential-alert
    class='injected-app-credential-alert'
    @type='inline'
    @color='critical'
    as |A|
  >
    <A.Title>{{t
        'resources.target.injected-application-credential-source.messages.alert.title'
      }}</A.Title>
    <A.Description>{{t
        'resources.target.injected-application-credential-source.messages.alert.description'
      }}</A.Description>
    <A.Button
      @color='secondary'
      @text={{t
        'resources.target.injected-application-credential-source.messages.alert.action'
      }}
      @route='scopes.scope.targets.target.add-injected-application-credential-sources'
      @model={{@model}}
    />
  </Hds::Alert>
{{/if}}

<Rose::Form
  class={{unless @model.isNew 'full-width'}}
  @onSubmit={{@submit}}
  @cancel={{@cancel}}
  @disabled={{@model.isSaving}}
  @showEditToggle={{if @model.isNew false true}}
  as |form|
>
  <Hds::Form::TextInput::Field
    @isRequired={{true}}
    @isOptional={{false}}
    @value={{@model.name}}
    @isInvalid={{@model.errors.name}}
    @type='text'
    name='name'
    disabled={{form.disabled}}
    {{on 'input' (set-from-event @model 'name')}}
    as |F|
  >
    <F.Label>{{t 'form.name.label'}}</F.Label>
    <F.HelperText>{{t 'form.name.help'}}</F.HelperText>
    {{#if @model.errors.name}}
      <F.Error as |E|>
        {{#each @model.errors.name as |error|}}
          <E.Message data-test-error-message-name>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Hds::Form::TextInput::Field>

  <Hds::Form::Textarea::Field
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
  </Hds::Form::Textarea::Field>

  {{#if this.showTargetTypeRadioGroup}}
    <Hds::Form::RadioCard::Group
      @name={{t 'form.type.label'}}
      @alignment='center'
      as |G|
    >
      <G.Legend>{{t 'resources.target.form.type.label'}}</G.Legend>
      <G.HelperText>{{t 'resources.target.form.type.help'}}</G.HelperText>
      {{#each this.typeMetas as |type|}}
        <G.RadioCard
          @value={{type.type}}
          @maxWidth='20rem'
          @checked={{eq type.type @model.type}}
          {{on 'input' (fn @changeType type.type)}}
          as |R|
        >
          <R.Label>{{t (concat 'resources.target.types.' type.type)}}</R.Label>
          <R.Description>{{t
              (concat 'resources.target.help.' type.type)
            }}</R.Description>
          <R.Icon @name={{type.icon}} />
        </G.RadioCard>
      {{/each}}
    </Hds::Form::RadioCard::Group>
  {{else}}
    <InfoField
      @value={{t (concat 'resources.target.types.' @model.type)}}
      @icon={{this.icon}}
      as |F|
    >
      <F.Label>{{t 'form.type.label'}}</F.Label>
      <F.HelperText>
        {{t (concat 'resources.target.help.' @model.type)}}
      </F.HelperText>
    </InfoField>
  {{/if}}

  {{#if (feature-flag 'target-network-address')}}
    <Hds::Form::TextInput::Field
      @isOptional={{true}}
      @value={{@model.address}}
      @isInvalid={{@model.errors.address}}
      @type='text'
      name='address'
      disabled={{form.disabled}}
      {{on 'input' (set-from-event @model 'address')}}
      as |F|
    >
      <F.Label>{{t 'resources.target.form.target-address.label'}}</F.Label>
      <F.HelperText>{{t
          'resources.target.form.target-address.help'
        }}</F.HelperText>
      {{#if @model.errors.address}}
        <F.Error as |E|>
          {{#each @model.errors.address as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </Hds::Form::TextInput::Field>
  {{/if}}

  <Hds::Form::TextInput::Field
    @isRequired={{@model.isTCP}}
    @isOptional={{not @model.isTCP}}
    @value={{@model.default_port}}
    @isInvalid={{@model.errors.default_port}}
    @type='text'
    name='default_port'
    disabled={{form.disabled}}
    placeholder={{@defaultPort}}
    {{on 'input' (set-from-event @model 'default_port')}}
    as |F|
  >
    <F.Label data-test-default-port-label>{{t
        'resources.target.form.default_port.label'
      }}</F.Label>
    <F.HelperText>{{t 'resources.target.form.default_port.help'}}</F.HelperText>
    {{#if @model.errors.default_port}}
      <F.Error as |E|>
        {{#each @model.errors.default_port as |error|}}
          <E.Message
            data-test-error-message-default-port
          >{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Hds::Form::TextInput::Field>

  <Hds::Form::TextInput::Field
    @isOptional={{true}}
    @value={{@model.default_client_port}}
    @isInvalid={{@model.errors.default_client_port}}
    @type='text'
    name='default_client_port'
    disabled={{form.disabled}}
    {{on 'input' (set-from-event @model 'default_client_port')}}
    as |F|
  >
    <F.Label>{{t 'resources.target.form.default_client_port.label'}}</F.Label>
    <F.HelperText data-test-default-client-port-helper-text>
      {{t 'resources.target.form.default_client_port.help'}}
      {{#if (eq @model.type 'rdp')}}
        <br />
        {{t 'resources.target.form.default_client_port.rdp-windows-notice'}}
      {{/if}}
    </F.HelperText>
    {{#if @model.errors.default_client_port}}
      <F.Error as |E|>
        {{#each @model.errors.default_client_port as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Hds::Form::TextInput::Field>

  <Hds::Form::TextInput::Field
    @isOptional={{true}}
    @value={{@model.session_max_seconds}}
    @isInvalid={{@model.errors.session_max_seconds}}
    @type='text'
    name='session_max_seconds'
    disabled={{form.disabled}}
    {{on 'input' (set-from-event @model 'session_max_seconds')}}
    as |F|
  >
    <F.Label>{{t 'form.session_max_seconds.label'}}</F.Label>
    <F.HelperText>{{t 'form.session_max_seconds.help'}}</F.HelperText>
    {{#if @model.errors.session_max_seconds}}
      <F.Error as |E|>
        {{#each @model.errors.session_max_seconds as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Hds::Form::TextInput::Field>

  <Hds::Form::TextInput::Field
    @isOptional={{true}}
    @value={{@model.session_connection_limit}}
    @isInvalid={{@model.errors.session_connection_limit}}
    @type='text'
    name='session_connection_limit'
    disabled={{form.disabled}}
    {{on 'input' (set-from-event @model 'session_connection_limit')}}
    as |F|
  >
    <F.Label>{{t 'form.session_connection_limit.label'}}</F.Label>
    <F.HelperText data-test-max-connections-helper-text>
      {{t 'form.session_connection_limit.help'}}
      {{#if (eq @model.type 'rdp')}}
        <br />
        {{t 'form.session_connection_limit.rdp-windows-notice'}}
      {{/if}}
    </F.HelperText>
    {{#if @model.errors.session_connection_limit}}
      <F.Error as |E|>
        {{#each @model.errors.session_connection_limit as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Hds::Form::TextInput::Field>

  {{#if
    (and @model.isNew (can 'create model' @globalScope collection='aliases'))
  }}
    <Form::Field::ListWrapper
      @layout='horizontal'
      @isOptional={{true}}
      @disabled={{form.disabled}}
    >
      <:fieldset as |F|>
        <F.Legend>
          {{t 'resources.alias.form.alias.label'}}
        </F.Legend>
        <F.HelperText>
          {{t 'resources.alias.form.alias.help'}}
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
        <F.TextInput
          @name='with_aliases'
          @options={{@model.with_aliases}}
          @model={{@model}}
        />
      </:field>

    </Form::Field::ListWrapper>
  {{/if}}
  {{#if (can 'save model' @model)}}
    <form.actions
      @enableEditText={{t 'actions.edit-form'}}
      @submitText={{t 'actions.save'}}
      @cancelText={{t 'actions.cancel'}}
    />
  {{/if}}

</Rose::Form>