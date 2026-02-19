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
  <Hds::Form::TextInput::Field
    name='name'
    @value={{@model.name}}
    @isInvalid={{@model.errors.name}}
    @isOptional={{true}}
    disabled={{form.disabled}}
    {{on 'input' (set-from-event @model 'name')}}
    as |F|
  >
    <F.Label>
      {{t 'form.name.label'}}
    </F.Label>
    <F.HelperText>
      {{t 'form.name.help'}}
    </F.HelperText>
    {{#if @model.errors.name}}
      <F.Error as |E|>
        {{#each @model.errors.name as |error|}}
          <E.Message>
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
    @isOptional={{true}}
    disabled={{form.disabled}}
    as |F|
  >
    <F.Label>
      {{t 'form.description.label'}}
    </F.Label>
    <F.HelperText>
      {{t 'form.description.help'}}
    </F.HelperText>
    {{#if @model.errors.description}}
      <F.Error as |E|>
        {{#each @model.errors.description as |error|}}
          <E.Message>
            {{error.message}}
          </E.Message>
        {{/each}}
      </F.Error>
    {{/if}}
  </Hds::Form::Textarea::Field>

  {{#if @model.isNew}}
    <Hds::Form::RadioCard::Group @name={{t 'form.type.label'}} as |G|>
      <G.Legend>
        {{t 'form.type.label'}}
      </G.Legend>
      {{#each @hostCatalogTypes as |hostCatalogType|}}
        <G.RadioCard
          @value={{hostCatalogType}}
          @maxWidth='20rem'
          @checked={{eq hostCatalogType @model.type}}
          {{on 'input' (fn @changeType hostCatalogType)}}
          as |R|
        >
          <R.Label>
            {{t (concat 'resources.host-catalog.types.' hostCatalogType)}}
          </R.Label>
          <R.Description>
            {{t (concat 'resources.host-catalog.help.' hostCatalogType)}}
          </R.Description>
        </G.RadioCard>
      {{/each}}
    </Hds::Form::RadioCard::Group>
    <Hds::Form::RadioCard::Group
      @name={{t 'form.plugin_type.label'}}
      @alignment='center'
      as |G|
    >
      <G.Legend>
        {{t 'titles.provider'}}
      </G.Legend>
      <G.Legend>
        {{t 'titles.choose-a-provider'}}
      </G.Legend>
      <G.HelperText>
        {{t 'descriptions.choose-a-provider'}}
      </G.HelperText>

      {{#each-in @mapResourceTypeWithIcon as |pluginType icon|}}
        <G.RadioCard
          @value={{pluginType}}
          @maxWidth='20rem'
          @checked={{eq pluginType @model.compositeType}}
          {{on 'input' (fn @changeType pluginType)}}
          as |R|
        >
          <R.Label>
            {{t (concat 'resources.host-catalog.types.' pluginType)}}
          </R.Label>
          <R.Icon @name={{icon}} />
        </G.RadioCard>
      {{/each-in}}
    </Hds::Form::RadioCard::Group>
  {{else}}
    <InfoField
      @value={{t 'resources.host-catalog.types.aws'}}
      @icon='aws-color'
      readonly={{true}}
      as |F|
    >
      <F.Label>
        {{t 'titles.provider'}}
      </F.Label>
      <F.HelperText>
        {{t 'descriptions.provider'}}
      </F.HelperText>
    </InfoField>
  {{/if}}

  <Hds::Form::TextInput::Field
    name='region'
    @value={{@model.region}}
    @isRequired={{true}}
    disabled={{form.disabled}}
    {{on 'input' (set-from-event @model 'region')}}
    as |F|
  >
    <F.Label>
      {{t 'resources.host-catalog.form.aws_region.label'}}
    </F.Label>
    <F.HelperText>
      {{t 'resources.host-catalog.form.aws_region.help'}}
      <Hds::Link::Inline @href={{doc-url 'host-catalog.aws.region'}}>
        {{t 'actions.learn-more'}}
      </Hds::Link::Inline>
    </F.HelperText>
  </Hds::Form::TextInput::Field>

  <Hds::Form::Radio::Group
    class='credential-selection'
    @layout='vertical'
    @name='credential_type'
    as |G|
  >
    <G.Legend>
      {{t 'resources.host-catalog.types.credential.label'}}
    </G.Legend>
    <G.HelperText>
      {{t 'resources.host-catalog.types.credential.help'}}
    </G.HelperText>

    {{#each this.credentials as |credentialType|}}
      <G.RadioField
        name={{credentialType}}
        @value={{credentialType}}
        checked={{eq credentialType @model.credentialType}}
        disabled={{form.disabled}}
        {{on 'input' (fn @changeCredentialType credentialType)}}
        as |F|
      >
        <F.Label>
          {{t
            (concat
              'resources.host-catalog.types.credential.' credentialType '.label'
            )
          }}
        </F.Label>
        <F.HelperText>
          {{t
            (concat
              'resources.host-catalog.types.credential.' credentialType '.help'
            )
          }}
        </F.HelperText>
      </G.RadioField>
    {{/each}}
  </Hds::Form::Radio::Group>

  {{#if this.showDynamicCredentials}}
    {{! role_arn }}
    <Hds::Form::TextInput::Field
      name='role_arn'
      @isOptional={{true}}
      @value={{@model.role_arn}}
      @isInvalid={{@model.errors.role_arn}}
      disabled={{form.disabled}}
      {{on 'input' (set-from-event @model 'role_arn')}}
      as |F|
    >
      <F.Label>
        {{t 'resources.storage-bucket.form.role_arn.label'}}
      </F.Label>
      <F.HelperText>
        {{t 'resources.host-catalog.help.role_arn'}}
      </F.HelperText>
      {{#if @model.errors.role_arn}}
        <F.Error as |E|>
          {{#each @model.errors.role_arn as |error|}}
            <E.Message>
              {{error.message}}
            </E.Message>
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
            <E.Message>
              {{error.message}}
            </E.Message>
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
            <E.Message>
              {{error.message}}
            </E.Message>
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
              <E.Message>
                {{error.message}}
              </E.Message>
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

  {{else}}
    <Hds::Form::TextInput::Field
      name='access_key_id'
      @value={{@model.access_key_id}}
      @isOptional={{true}}
      disabled={{form.disabled}}
      {{on 'input' (set-from-event @model 'access_key_id')}}
      as |F|
    >
      <F.Label>
        {{t 'form.access_key_id.label'}}
      </F.Label>
      <F.HelperText>
        {{t 'form.access_key_id.help'}}
        <Hds::Link::Inline @href={{doc-url 'host-catalog.aws'}}>
          {{t 'actions.learn-more'}}
        </Hds::Link::Inline>
      </F.HelperText>
    </Hds::Form::TextInput::Field>

    <Hds::Form::TextInput::Field
      name='secret_access_key'
      @value={{@model.secret_access_key}}
      @isOptional={{true}}
      disabled={{form.disabled}}
      {{on 'input' (set-from-event @model 'secret_access_key')}}
      as |F|
    >
      <F.Label>
        {{t 'form.secret_access_key.label'}}
      </F.Label>
      <F.HelperText>
        {{t 'form.secret_access_key.help'}}
        <Hds::Link::Inline @href={{doc-url 'host-catalog.aws'}}>
          {{t 'actions.learn-more'}}
        </Hds::Link::Inline>
      </F.HelperText>
    </Hds::Form::TextInput::Field>
  {{/if}}

  {{#if (feature-flag 'worker-filter')}}
    <Hds::Form::Textarea::Field
      name='worker_filter'
      @value={{@model.worker_filter}}
      @isRequired={{this.isWorkerFilterRequired}}
      @isOptional={{not this.isWorkerFilterRequired}}
      @isInvalid={{@model.errors.worker_filter}}
      disabled={{form.disabled}}
      as |F|
    >
      <F.Label data-test-aws-worker-filter-label>{{t
          'form.worker_filter.label'
        }}</F.Label>
      <F.HelperText>
        {{t 'resources.host-catalog.form.worker_filter.help'}}
        <Hds::Link::Inline @href={{doc-url 'worker.create-tags'}}>
          {{t 'actions.learn-more'}}
        </Hds::Link::Inline>
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
    </Hds::Form::Textarea::Field>
  {{/if}}

  {{#if this.showDynamicCredentials}}
    <Hds::Form::Checkbox::Field
      name='disable_credential_rotation'
      checked={{true}}
      disabled={{true}}
      as |F|
    >
      <F.Label>
        {{t 'form.disable_credential_rotation.label'}}
      </F.Label>
      <F.HelperText>
        {{t 'resources.host-catalog.help.disable_credential_rotation'}}
      </F.HelperText>
    </Hds::Form::Checkbox::Field>
  {{else}}
    <Hds::Form::Checkbox::Field
      name='disable_credential_rotation'
      checked={{@model.disable_credential_rotation}}
      disabled={{form.disabled}}
      {{on 'change' (fn @toggleDisableCredentialRotation @model)}}
      as |F|
    >
      <F.Label>
        {{t 'form.disable_credential_rotation.label'}}
      </F.Label>
    </Hds::Form::Checkbox::Field>
  {{/if}}
  &nbsp;

  {{#if (can 'save model' @model)}}
    <form.actions
      @enableEditText={{t 'actions.edit-form'}}
      @submitText={{t 'actions.save'}}
      @cancelText={{t 'actions.cancel'}}
    />
  {{/if}}
</Rose::Form>