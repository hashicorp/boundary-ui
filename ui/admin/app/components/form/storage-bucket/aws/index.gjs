{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

<Rose::Form
  @onSubmit={{@submit}}
  @cancel={{@cancel}}
  @disabled={{@model.isSaving}}
  @showEditToggle={{if @model.isNew false true}}
  as |form|
>
  {{! name }}
  <Hds::Form::TextInput::Field
    name='name'
    @isOptional={{true}}
    @value={{@model.name}}
    @isInvalid={{@model.errors.name}}
    @type='text'
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

  {{! description }}
  <Hds::Form::Textarea::Field
    name='description'
    @isOptional={{true}}
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

  {{! scope }}
  {{#if @model.isNew}}
    <Hds::Form::Select::Field
      name='scope'
      @isRequired={{true}}
      @isInvalid={{@model.errors.scope_id}}
      @width='100%'
      disabled={{form.disabled}}
      {{on 'change' @updateScope}}
      as |F|
    >
      <F.Label>{{t 'resources.storage-bucket.form.scope.label'}}</F.Label>
      <F.HelperText>
        {{#if @model.scope}}
          {{#if @model.scope.isGlobal}}
            {{t 'resources.storage-bucket.form.scope.help_global'}}
          {{else if @model.scope.isOrg}}
            {{t 'resources.storage-bucket.form.scope.help_org'}}
          {{/if}}
        {{else}}
          {{t 'resources.storage-bucket.form.scope.help'}}
        {{/if}}
      </F.HelperText>
      <F.Options>
        <option disabled selected={{not @model.scope}} value=''>
          {{t 'titles.choose-an-option'}}
        </option>
        {{#each @scopes as |scope|}}
          <option
            value={{scope.model.id}}
            selected={{eq scope.model.id @model.scope.scope_id}}
          >
            {{scope.model.displayName}}
          </option>
        {{/each}}
      </F.Options>
      {{#if @model.errors.scope_id}}
        <F.Error as |E|>
          {{#each @model.errors.scope_id as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </Hds::Form::Select::Field>
  {{else}}
    <InfoField
      @value={{@model.scopeModel.displayName}}
      @icon={{if @model.scopeModel.isGlobal 'globe' 'org'}}
      disabled={{form.disabled}}
      as |F|
    >
      <F.Label>{{t 'resources.storage-bucket.form.scope.label'}}</F.Label>
      <F.HelperText>
        {{#if @model.scopeModel.isGlobal}}
          {{t 'resources.storage-bucket.form.scope.help_global'}}
        {{else}}
          {{t 'resources.storage-bucket.form.scope.help_org'}}
        {{/if}}
      </F.HelperText>
    </InfoField>
  {{/if}}

  {{! Provider / plugin.name }}
  <Hds::Form::RadioCard::Group
    @name={{t 'form.plugin_type.label'}}
    @alignment='center'
    as |G|
  >
    <G.Legend>{{t 'titles.provider'}}</G.Legend>
    <G.HelperText>{{t 'descriptions.choose-a-provider'}}</G.HelperText>

    {{#each @pluginTypes as |pluginType|}}
      <G.RadioCard
        @value={{pluginType}}
        @checked={{eq pluginType @model.compositeType}}
        @disabled={{not @model.isNew}}
        {{on 'input' (fn @changePluginType pluginType)}}
        as |R|
      >
        <R.Label>{{t
            (concat 'resources.storage-bucket.plugin-types.' pluginType)
          }}</R.Label>
        {{#if (eq pluginType 'aws')}}
          <R.Icon @name='aws-color' />
        {{else}}
          <R.Icon @name='cloud-upload' />
        {{/if}}
      </G.RadioCard>
    {{/each}}
  </Hds::Form::RadioCard::Group>

  {{! bucket_name }}
  <Hds::Form::TextInput::Field
    name='bucket_name'
    @isRequired={{true}}
    @value={{@model.bucket_name}}
    @isInvalid={{@model.errors.bucket_name}}
    disabled={{form.disabled}}
    readOnly={{not @model.isNew}}
    {{on 'input' (set-from-event @model 'bucket_name')}}
    as |F|
  >
    <F.Label>{{t 'resources.storage-bucket.form.bucket_name.label'}}</F.Label>
    <F.HelperText>{{t
        'resources.storage-bucket.form.bucket_name.help'
      }}</F.HelperText>
    {{#if @model.errors.bucket_name}}
      <F.Error data-test-bucket-name-error as |E|>
        {{#each @model.errors.bucket_name as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Hds::Form::TextInput::Field>

  {{! bucket_prefix }}
  <Hds::Form::TextInput::Field
    name='bucket_prefix'
    @isOptional={{true}}
    @value={{@model.bucket_prefix}}
    @isInvalid={{@model.errors.bucket_prefix}}
    disabled={{form.disabled}}
    readOnly={{not @model.isNew}}
    {{on 'input' (set-from-event @model 'bucket_prefix')}}
    as |F|
  >
    <F.Label>{{t 'resources.storage-bucket.form.bucket_prefix.label'}}</F.Label>
    <F.HelperText>{{t
        'resources.storage-bucket.form.bucket_prefix.help'
      }}</F.HelperText>
    {{#if @model.errors.bucket_prefix}}
      <F.Error as |E|>
        {{#each @model.errors.bucket_prefix as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Hds::Form::TextInput::Field>

  {{! region }}
  <Hds::Form::TextInput::Field
    name='region'
    @isRequired={{true}}
    @value={{@model.region}}
    @isInvalid={{@model.errors.region}}
    disabled={{form.disabled}}
    readOnly={{not @model.isNew}}
    {{on 'input' (set-from-event @model 'region')}}
    as |F|
  >
    <F.Label>{{t 'resources.storage-bucket.form.region.label'}}</F.Label>
    <F.HelperText>{{t
        'resources.storage-bucket.form.region.help'
      }}</F.HelperText>
    {{#if @model.errors.region}}
      <F.Error as |E|>
        {{#each @model.errors.region as |error|}}
          <E.Message>{{error.message}}</E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Hds::Form::TextInput::Field>

  {{! credential_type }}
  <Hds::Form::RadioCard::Group @name={{t 'form.type.label'}} as |G|>
    <G.Legend>{{t 'resources.storage-bucket.types.credential'}}</G.Legend>
    {{#each this.credentials as |credentialType|}}
      <G.RadioCard
        @value={{credentialType}}
        @checked={{eq credentialType @model.credentialType}}
        @disabled={{form.disabled}}
        {{on 'input' (fn @changeCredentialType credentialType)}}
        as |R|
      >
        <R.Label>{{t
            (concat 'resources.storage-bucket.types.' credentialType '.title')
          }}</R.Label>
        <R.Description>{{t
            (concat
              'resources.storage-bucket.types.' credentialType '.description'
            )
          }}</R.Description>
      </G.RadioCard>
    {{/each}}
  </Hds::Form::RadioCard::Group>

  {{! static credentials fields }}
  {{#unless this.showDynamicCredentials}}
    {{! Creation }}
    {{#if @model.isNew}}
      {{! access_key }}
      <Hds::Form::TextInput::Field
        name='access_key_id'
        @type='password'
        @isRequired={{true}}
        @value={{@model.access_key_id}}
        @isInvalid={{@model.errors.secrets}}
        @hasVisibilityToggle={{false}}
        {{on 'input' (set-from-event @model 'access_key_id')}}
        as |F|
      >
        <F.Label>{{t
            'resources.storage-bucket.form.access_key_id.label'
          }}</F.Label>
        <F.HelperText>{{t
            'resources.storage-bucket.form.access_key_id.help'
          }}</F.HelperText>
        {{#if @model.errors.secrets}}
          <F.Error as |E|>
            {{#each @model.errors.secrets as |error|}}
              <E.Message>{{error.message}}</E.Message>
            {{/each}}
          </F.Error>
        {{/if}}
      </Hds::Form::TextInput::Field>

      {{! secret_access_key }}
      <Hds::Form::TextInput::Field
        name='secret_access_key'
        @type='password'
        @isRequired={{true}}
        @value={{@model.secret_access_key}}
        @isInvalid={{@model.errors.secrets}}
        disabled={{form.disabled}}
        @hasVisibilityToggle={{false}}
        {{on 'input' (set-from-event @model 'secret_access_key')}}
        as |F|
      >
        <F.Label>{{t
            'resources.storage-bucket.form.secret_access_key.label'
          }}</F.Label>
        <F.HelperText>{{t
            'resources.storage-bucket.form.secret_access_key.help'
          }}</F.HelperText>
        {{#if @model.errors.secrets}}
          <F.Error as |E|>
            {{#each @model.errors.secrets as |error|}}
              <E.Message>{{error.message}}</E.Message>
            {{/each}}
          </F.Error>
        {{/if}}
      </Hds::Form::TextInput::Field>
      {{! Edit }}
    {{else}}
      {{! access_key }}
      <Form::Field::SecretInput
        @name='access_key_id'
        @isRequired={{true}}
        @value={{@model.access_key_id}}
        @isInvalid={{@model.errors.access_key_id}}
        @isDisabled={{form.disabled}}
        @showEditButton={{true}}
        @cancel={{fn @rollbackSecretAttrs 'access_key_id'}}
        data-test-access-key-id
        {{on 'input' (set-from-event @model 'access_key_id')}}
        as |F|
      >
        <F.Label>{{t
            'resources.storage-bucket.form.access_key_id.label'
          }}</F.Label>
        <F.HelperText>{{t
            'resources.storage-bucket.form.access_key_id.help'
          }}</F.HelperText>
      </Form::Field::SecretInput>

      {{! secret_access_key }}
      <Form::Field::SecretInput
        @name='secret_access_key'
        @isRequired={{true}}
        @value={{@model.secret_access_key}}
        @isInvalid={{@model.errors.secret_access_key}}
        @isDisabled={{form.disabled}}
        @showEditButton={{true}}
        @cancel={{fn @rollbackSecretAttrs 'secret_access_key'}}
        data-test-secret-access-key
        {{on 'input' (set-from-event @model 'secret_access_key')}}
        as |F|
      >
        <F.Label>{{t
            'resources.storage-bucket.form.secret_access_key.label'
          }}</F.Label>
        <F.HelperText>{{t
            'resources.storage-bucket.form.secret_access_key.help'
          }}</F.HelperText>
      </Form::Field::SecretInput>
    {{/if}}

  {{/unless}}

  {{! dynamic credentials }}
  {{#if this.showDynamicCredentials}}
    {{! role_arn }}
    <Hds::Form::TextInput::Field
      name='role_arn'
      @isRequired={{true}}
      @value={{@model.role_arn}}
      @isInvalid={{@model.errors.role_arn}}
      disabled={{form.disabled}}
      {{on 'input' (set-from-event @model 'role_arn')}}
      as |F|
    >
      <F.Label>{{t 'resources.storage-bucket.form.role_arn.label'}}</F.Label>
      <F.HelperText>
        {{t 'resources.storage-bucket.form.role_arn.help'}}
      </F.HelperText>
      {{#if @model.errors.role_arn}}
        <F.Error as |E|>
          {{#each @model.errors.role_arn as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </Hds::Form::TextInput::Field>

    {{! role_external_id }}
    <Hds::Form::TextInput::Field
      name='role_external_id'
      @isOptional={{true}}
      @value={{@model.role_external_id}}
      @isInvalid={{@model.errors.role_external_id}}
      disabled={{form.disabled}}
      {{on 'input' (set-from-event @model 'role_external_id')}}
      as |F|
    >
      <F.Label>
        {{t 'resources.storage-bucket.form.role_external_id.label'}}
      </F.Label>
      <F.HelperText>
        {{t 'resources.storage-bucket.form.role_external_id.help'}}
      </F.HelperText>
      {{#if @model.errors.role_external_id}}
        <F.Error as |E|>
          {{#each @model.errors.role_external_id as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </Hds::Form::TextInput::Field>

    {{! role_session_name }}
    <Hds::Form::TextInput::Field
      name='role_session_name'
      @isOptional={{true}}
      @value={{@model.role_session_name}}
      @isInvalid={{@model.errors.role_session_name}}
      disabled={{form.disabled}}
      {{on 'input' (set-from-event @model 'role_session_name')}}
      as |F|
    >
      <F.Label>
        {{t 'resources.storage-bucket.form.role_session_name.label'}}
      </F.Label>
      <F.HelperText>
        {{t 'resources.storage-bucket.form.role_session_name.help'}}
      </F.HelperText>
      {{#if @model.errors.role_session_name}}
        <F.Error as |E|>
          {{#each @model.errors.role_session_name as |error|}}
            <E.Message>{{error.message}}</E.Message>
          {{/each}}
        </F.Error>
      {{/if}}
    </Hds::Form::TextInput::Field>

    {{! role_tags }}
    <Form::Field::ListWrapper
      @layout='horizontal'
      @isOptional={{true}}
      @disabled={{form.disabled}}
    >
      <:fieldset as |F|>
        <F.Legend>
          {{t 'resources.storage-bucket.form.role_tags.label'}}
        </F.Legend>
        <F.HelperText>
          {{t 'resources.storage-bucket.form.role_tags.help'}}
        </F.HelperText>

        {{#if @model.errors.role_tags}}
          <F.Error as |E|>
            {{#each @model.errors.role_tags as |error|}}
              <E.Message>{{error.message}}</E.Message>
            {{/each}}
          </F.Error>
        {{/if}}
      </:fieldset>
      <:field as |F|>
        <F.KeyValue
          @name='role_tags'
          @options={{@model.role_tags}}
          @model={{@model}}
        >
          <:key as |K|>
            <K.text />
          </:key>
          <:value as |V|>
            <V.text />
          </:value>
        </F.KeyValue>
      </:field>
    </Form::Field::ListWrapper>
  {{/if}}

  {{! worker_filter }}
  {{#let (unique-id) (unique-id) as |labelId helpId|}}
    <Hds::Form::Fieldset
      aria-labelledby={{labelId}}
      aria-describedby={{helpId}}
      class='worker-filter-generator-form-layout'
      @isRequired={{true}}
      as |F|
    >
      <F.Legend id={{labelId}}>{{t 'form.worker_filter.label'}}</F.Legend>
      <F.HelperText id={{helpId}}>
        {{t 'resources.storage-bucket.form.worker_filter.help'}}
        <Hds::Link::Inline @href={{doc-url 'storage-bucket.worker-filter'}}>
          {{t 'actions.learn-more'}}
        </Hds::Link::Inline>
      </F.HelperText>
      <F.Control>
        {{#if (and form.disabled (not @model.isSaving))}}
          <Hds::CodeBlock
            @language='bash'
            @value={{@model.worker_filter}}
            @hasCopyButton={{true}}
            data-test-worker-filter
          />
        {{else}}
          <WorkerFilterGenerator
            @model={{@model}}
            @name='worker_filter'
            @hideToolbar={{true}}
          />
        {{/if}}
      </F.Control>
    </Hds::Form::Fieldset>
  {{/let}}

  {{! JUST for static credentials }}
  {{#unless this.showDynamicCredentials}}
    {{! disable_credential_rotation }}
    <Hds::Form::Checkbox::Field
      name='disable_credential_rotation'
      disabled={{form.disabled}}
      checked={{@model.disable_credential_rotation}}
      {{on 'change' @toggleDisableCredentialRotation}}
      as |F|
    >
      <F.Label>{{t
          'resources.storage-bucket.form.disable_credential_rotation.label'
        }}</F.Label>
      <F.HelperText>
        {{t 'resources.storage-bucket.form.disable_credential_rotation.help'}}
        <Hds::Link::Inline
          @href={{doc-url 'storage-bucket.disable-credential-rotation'}}
        >
          {{t 'actions.learn-more'}}
        </Hds::Link::Inline>
      </F.HelperText>
    </Hds::Form::Checkbox::Field>
  {{/unless}}

  {{! Actions }}
  {{#if (can 'save model' @model)}}
    <form.actions
      @enableEditText={{t 'actions.edit-form'}}
      @submitText={{t 'actions.save'}}
      @cancelText={{t 'actions.cancel'}}
    />
  {{/if}}
</Rose::Form>