/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { TrackedArray } from 'tracked-built-ins';
import Tag from '../tag';

export default class FormWorkerCreateWorkerLedComponent extends Component {
  // =services
  @service features;
  @service('browser/window') window;

  // =attributes
  @tracked generatedWorkerAuthToken;
  @tracked clusterID = this.clusterIDFromURL;
  @tracked ipAddress;
  @tracked configFilePath;
  @tracked initialUpstreams;
  @tracked workerTags = new TrackedArray([]);
  @tracked enableRecordingStoragePath = false;
  @tracked recording_storage_path = '';

  get clusterIDFromURL() {
    const hostname = this.window?.location?.hostname;

    // Match against a guid with either the prod, int, or dev hcp domain
    const clusterIDMatcher =
      /^(?<clusterID>[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\.boundary\.(?:hashicorp\.cloud|hcp\.to|hcp\.dev)$/;

    // Return the cluster ID otherwise return null if it doesn't match
    return hostname?.match(clusterIDMatcher)?.groups?.clusterID;
  }

  // =properties
  /**
   * Returns directory creation text for `<Rose::CodeEditor>`.
   * @type {string}
   */
  get createConfigText() {
    return `mkdir ${this.configFilePath || '<path>'}/ ;
touch ${this.configFilePath || '<path>'}/pki-worker.hcl`;
  }

  get recordingStoragePathText() {
    const path = this.recording_storage_path || '<recording_storage_path>';
    return this.features.isEnabled('ssh-session-recording') &&
      this.enableRecordingStoragePath
      ? `\n  recording_storage_path = "${path}"`
      : '';
  }

  /**
   * Returns config creation text for `<Rose::CodeEditor>`. The user will see
   * different outputs based on if they are using `hcp` or `oss` binaries.
   * @type {string}
   */
  get workerConfigText() {
    const clusterText = `hcp_boundary_cluster_id = "${
      this.clusterID || '<config_id>'
    }"`;

    const tagsText = `tags {
    ${
      this.workerTags.length
        ? this.getTagConfigString()
        : 'key = ["<tag1>", "<tag2>"]'
    }
  }`;

    const upstreamText = `
  initial_upstreams = [${
    this.initialUpstreams
      ? this.convertCommaSeparatedValuesToArray(this.initialUpstreams)
      : '"<upstream1>", "</upstream2>", "<upstream3>"'
  }]`;

    const listenerText = `listener "tcp" {
  address = "0.0.0.0:9202"
  purpose = "proxy"
}`;

    const workerText = `
worker {
  public_addr = "${this.ipAddress || '<public_ip_address>'}"
  auth_storage_path = "${this.configFilePath || '<path>'}/worker1"
  ${
    this.features.isEnabled('byow-pki-hcp-cluster-id')
      ? `${tagsText}`
      : `${tagsText}${upstreamText}`
  }${this.recordingStoragePathText}
}`;

    if (this.features.isEnabled('byow-pki-hcp-cluster-id')) {
      return `${clusterText}

${listenerText}
        ${workerText}`;
    } else {
      return `${listenerText}
        ${workerText}`;
    }
  }

  /**
   * Returns boundary installation command and start worker server command
   * for `<Rose::CodeEditor>`.
   * @type {string}
   */
  get installBoundaryText() {
    const configPath = this.configFilePath || '<path>';
    const ossContent = `curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add - ;\\
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main" ;\\
sudo apt-get update && sudo apt-get install boundary ;\\
boundary server -config="${configPath}/pki-worker.hcl"`;

    const hcpContent = `sudo apt-get update && sudo apt-get install jq unzip ;\\
wget -q "$(curl -fsSL "https://api.releases.hashicorp.com/v1/releases/boundary/latest?license_class=enterprise" \
| jq -r '.builds[] | select(.arch == "amd64" and .os == "linux") | .url')" ;\\
unzip *.zip ;\\
./boundary server -config="${configPath}/pki-worker.hcl"`;

    return this.features.isEnabled('byow-pki-hcp-cluster-id')
      ? hcpContent
      : ossContent;
  }

  /**
   * Returns `shell` configuration object for `<Rose::CodeEditor>`.
   * @type {Object}
   */
  get shellCodeEditor() {
    return {
      mode: 'shell',
      readOnly: true,
      lineNumbers: false,
      cursorBlinkRate: -1,
      styleActiveLine: false,
    };
  }

  /**
   * Returns `hcl` configuration object for `<Rose::CodeEditor>`.
   * @type {Object}
   */
  get hclCodeEditor() {
    return {
      mode: 'hcl',
      readOnly: true,
      cursorBlinkRate: -1,
      styleActiveLine: false,
    };
  }

  //=methods

  convertCommaSeparatedValuesToArray(input) {
    return input
      .split(',')
      .filter((value) => value.trim())
      .map((value) => `"${value?.trim()}"`)
      .join(', ');
  }

  getTagConfigString() {
    return this.workerTags
      .map(
        (tag) =>
          `${tag.key} = [${this.convertCommaSeparatedValuesToArray(
            tag.value,
          )}]`,
      )
      .join('\n    ');
  }

  @action
  addWorkerTag(e) {
    this.workerTags.push(new Tag(e.key, e.value));
  }

  @action
  removeWorkerTagByIndex(index) {
    this.workerTags.splice(index, 1);
  }

  @action
  toggleEnableRecordingStoragePath() {
    this.enableRecordingStoragePath = !this.enableRecordingStoragePath;
  }
}

{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

<Rose::Form
  @onSubmit={{fn @submit this.generatedWorkerAuthToken}}
  @disabled={{@model.isSaving}}
  @showEditToggle={{false}}
  as |form|
>
  <Hds::Text::Display @tag='h3' @size='300' @weight='bold'>
    {{t 'resources.worker.form.steps.1.title'}}
  </Hds::Text::Display>
  <div class='worker-create-section'>
    {{#if (feature-flag 'byow-pki-hcp-cluster-id')}}
      <Hds::Form::TextInput::Field
        name='cluster_id'
        @value={{this.clusterID}}
        @isOptional={{true}}
        placeholder='69b6ddb3-ffec-42ab-a994-f43a6519470a'
        {{on 'input' (set-from-event this 'clusterID')}}
        as |F|
      >
        <F.Label>{{t 'resources.worker.form.cluster_id.label'}}</F.Label>
        <F.HelperText>
          {{t 'resources.worker.form.cluster_id.help'}}
          <Hds::Link::Inline @href={{doc-url 'worker.manage-workers'}}>
            {{t 'actions.learn-more'}}
          </Hds::Link::Inline>
        </F.HelperText>
      </Hds::Form::TextInput::Field>
    {{/if}}

    <Hds::Form::TextInput::Field
      name='ip_address'
      @value={{this.ipAddress}}
      @isOptional={{true}}
      placeholder='worker1.example.com'
      {{on 'input' (set-from-event this 'ipAddress')}}
      as |F|
    >
      <F.Label>{{t 'resources.worker.form.ip_address.label'}}</F.Label>
      <F.HelperText>
        {{t 'resources.worker.form.ip_address.help'}}
        <Hds::Link::Inline @href={{doc-url 'worker'}}>
          {{t 'actions.learn-more'}}
        </Hds::Link::Inline>
      </F.HelperText>
    </Hds::Form::TextInput::Field>

    <Hds::Form::TextInput::Field
      name='config_file_path'
      @value={{this.configFilePath}}
      @isOptional={{true}}
      placeholder='/home/ubuntu/boundary'
      {{on 'input' (set-from-event this 'configFilePath')}}
      as |F|
    >
      <F.Label>{{t 'resources.worker.form.config_file_path.label'}}</F.Label>
      <F.HelperText>
        {{t 'resources.worker.form.config_file_path.help'}}
      </F.HelperText>
    </Hds::Form::TextInput::Field>

    {{#if (not (feature-flag 'byow-pki-hcp-cluster-id'))}}
      <Hds::Form::TextInput::Field
        name='initial_upstreams'
        @value={{this.initialUpstreams}}
        @isOptional={{true}}
        placeholder='10.0.0.1, 10.0.0.2, 10.0.0.3'
        {{on 'input' (set-from-event this 'initialUpstreams')}}
        as |F|
      >
        <F.Label>{{t 'resources.worker.form.initial_upstreams.label'}}</F.Label>
        <F.HelperText>
          {{t 'resources.worker.form.initial_upstreams.help'}}
        </F.HelperText>
      </Hds::Form::TextInput::Field>
    {{/if}}
    <Form::Field::ListWrapper
      @layout='horizontal'
      @disabled={{form.disabled}}
      @isOptional={{true}}
    >
      <:fieldset as |F|>
        <F.Legend>{{t 'resources.worker.form.worker_tags.label'}}</F.Legend>
        <F.HelperText>
          {{t 'resources.worker.form.worker_tags.help'}}
        </F.HelperText>
      </:fieldset>

      <:field as |F|>
        <F.KeyValue
          @name='worker_tags'
          @options={{this.workerTags}}
          @disabled={{form.disabled}}
          @addOption={{this.addWorkerTag}}
          @removeOptionByIndex={{this.removeWorkerTagByIndex}}
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

    {{#if (feature-flag 'ssh-session-recording')}}
      <Hds::Form::Fieldset @isOptional={{true}} as |F|>
        <F.Legend>{{t
            'resources.worker.form.local_session_recording_storage.label'
          }}</F.Legend>
        <F.HelperText>
          {{t 'resources.worker.form.local_session_recording_storage.help'}}
          <Hds::Link::Inline @href={{doc-url 'session-recording'}}>{{t
              'actions.learn-more'
            }}</Hds::Link::Inline>
        </F.HelperText>
        <F.Control>
          <Hds::Form::Toggle::Field
            name='enableRecordingStoragePath'
            checked={{this.enableRecordingStoragePath}}
            {{on 'change' this.toggleEnableRecordingStoragePath}}
            as |F|
          >
            <F.Label>{{t
                'resources.worker.form.enable_recording_storage_path.label'
              }}</F.Label>
          </Hds::Form::Toggle::Field>
        </F.Control>
        {{#if this.enableRecordingStoragePath}}
          <F.Control>
            <Hds::Form::TextInput::Field
              name='recording_storage_path'
              @value={{this.recording_storage_path}}
              placeholder='/tmp/worker1'
              {{on 'input' (set-from-event this 'recording_storage_path')}}
              as |F|
            >
              <F.Label>{{t
                  'resources.worker.form.recording_storage_path.label'
                }}</F.Label>
              <F.HelperText>
                {{t 'resources.worker.form.recording_storage_path.help'}}
              </F.HelperText>
            </Hds::Form::TextInput::Field>
          </F.Control>
        {{/if}}
      </Hds::Form::Fieldset>
    {{/if}}

    <Hds::Text::Body @tag='p' @size='300' class='p'>
      {{t 'resources.worker.form.steps.1.create_directory'}}
    </Hds::Text::Body>

    <Hds::CodeBlock
      @language='bash'
      @value={{this.createConfigText}}
      @hasCopyButton={{true}}
      @hasLineNumbers={{false}}
      data-test-worker-directory
    />

    <Hds::Text::Body @tag='p' @size='300' class='p'>
      {{t 'resources.worker.form.steps.1.create_config'}}
    </Hds::Text::Body>

    <Hds::CodeBlock
      @language='hcl'
      @value={{this.workerConfigText}}
      @hasCopyButton={{true}}
      @hasLineNumbers={{false}}
      data-test-worker-config
    />

    <Hds::Text::Body @tag='p' @size='300' class='p'>
      {{t 'resources.worker.form.steps.1.save_config' htmlSafe=true}}
    </Hds::Text::Body>
  </div>

  <Hds::Text::Display @tag='h3' @size='300' @weight='bold'>
    {{t 'resources.worker.form.steps.2.title'}}
  </Hds::Text::Display>
  <div class='worker-create-section'>

    <Hds::Text::Body @tag='p' @size='300' class='p'>
      {{t 'resources.worker.form.steps.2.run_command'}}
    </Hds::Text::Body>

    <Hds::CodeBlock
      @language='bash'
      @value={{this.installBoundaryText}}
      @hasCopyButton={{true}}
      @hasLineNumbers={{false}}
    />

    <Hds::Text::Body @tag='p' @size='300' class='p'>
      {{t 'resources.worker.form.steps.2.copy_registration_request'}}
      <Hds::Text::Code @size='300' @color='primary'>
        {{t
          'resources.worker.form.steps.3.worker_auth_registration_request.label'
        }}</Hds::Text::Code>.
    </Hds::Text::Body>
  </div>

  <Hds::Text::Display @tag='h3' @size='300' @weight='bold'>
    {{t 'resources.worker.form.steps.3.title'}}
  </Hds::Text::Display>
  <div class='worker-create-section'>
    <div class='worker-auth-token'>
      <Hds::Form::TextInput::Field
        name='worker_auth_registration_request'
        @value={{this.generatedWorkerAuthToken}}
        @isRequired={{true}}
        @isInvalid={{@model.errors.worker_generated_auth_token}}
        disabled={{form.disabled}}
        {{on 'input' (set-from-event this 'generatedWorkerAuthToken')}}
        as |F|
      >
        <F.Label>{{t
            'resources.worker.form.steps.3.worker_auth_registration_request.label'
          }}</F.Label>
        <F.HelperText>
          {{t
            'resources.worker.form.steps.3.worker_auth_registration_request.help'
          }}
        </F.HelperText>
        {{#if @model.errors.worker_generated_auth_token}}
          <F.Error as |E|>
            {{#each @model.errors.worker_generated_auth_token as |error|}}
              <E.Message>{{error.message}}</E.Message>
            {{/each}}
          </F.Error>
        {{/if}}
      </Hds::Form::TextInput::Field>
      {{#if (can 'save worker' @model)}}
        <Hds::Button
          @text={{t 'resources.worker.actions.register'}}
          type='submit'
          disabled={{@model.cannotSave}}
          class='nowrap'
        />
      {{/if}}
    </div>

    {{#unless @model.isNew}}
      <div class='worker-success'>
        <div>
          <Hds::Icon @name='cpu' @color='success' @isInline={{true}} />
          <Hds::Text::Body @tag='p' @size='300' class='p'>
            {{this.generatedWorkerAuthToken}}
          </Hds::Text::Body>
        </div>
        <div>
          <Hds::Icon
            @name='check-circle-fill'
            @color='success'
            @isInline={{true}}
          />
          <Hds::Text::Body @tag='p' @size='300' class='p' @color='success'>
            {{t 'resources.worker.form.steps.3.registered'}}
          </Hds::Text::Body>
        </div>
      </div>
    {{/unless}}
  </div>
  <Hds::Button
    @color='secondary'
    @text={{if @model.isNew (t 'actions.cancel') (t 'actions.done')}}
    {{on 'click' @cancel}}
  />
</Rose::Form>