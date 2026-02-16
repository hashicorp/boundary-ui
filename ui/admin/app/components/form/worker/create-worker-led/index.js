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
