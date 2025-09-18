/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { TrackedArray } from 'tracked-built-ins';
import Tag from '../tag';
import {
  GRANT_SCOPE_THIS,
  GRANT_SCOPE_CHILDREN,
  GRANT_SCOPE_DESCENDANTS,
} from 'api/models/role';

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
  @tracked selectedScopes = new TrackedArray([]);
  @tracked enableRecordingStoragePath = false;
  @tracked recording_storage_path = '';
  keywords = {
    keyThis: GRANT_SCOPE_THIS,
    keyChildren: GRANT_SCOPE_CHILDREN,
    keyDescendants: GRANT_SCOPE_DESCENDANTS,
  };

  @tracked grantScopeIds = [];
  @tracked permissions = [];
  @tracked newGrantString = '';
  @tracked grantStrings = [];

  get scopeTypeOptions() {
    return [
      { name: 'Global', id: 'global' },
      { name: 'Organization', id: 'org' },
      { name: 'Project', id: 'project' },
    ];
  }

  get parentScopeOptions() {
    const scopes = this.args.model.scopes || [];
    const seen = new Set();
    const options = [];

    scopes.forEach((s) => {
      const scopeObj = s.scope;
      if (scopeObj && scopeObj.id && !seen.has(scopeObj.id)) {
        options.push({ id: scopeObj.id, name: scopeObj.name });
        seen.add(scopeObj.id);
      }
    });

    return options;
  }

  get showAlert() {
    return (
      this.args.model.worker.isGlobal &&
      (this.grantScopeIds.includes(GRANT_SCOPE_CHILDREN) ||
        this.grantScopeIds.includes(GRANT_SCOPE_DESCENDANTS))
    );
  }

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

  @action
  scopeSelectionChange({ selectableRowsStates }) {
    selectableRowsStates.forEach(({ isSelected, selectionKey }) => {
      if (isSelected && !this.selectedScopes.includes(selectionKey)) {
        this.selectedScopes.push(selectionKey);
      } else if (!isSelected && this.selectedScopes.includes(selectionKey)) {
        const idx = this.selectedScopes.indexOf(selectionKey);
        if (idx !== -1) this.selectedScopes.splice(idx, 1);
      }
    });
    console.log(this.selectedScopes);
  }

  @action
  toggleField(event) {
    const { checked, value } = event.target;
    if (checked) {
      if (!this.selectedScopes.includes(value)) {
        this.selectedScopes.push(value);
      }
    } else {
      const idx = this.selectedScopes.indexOf(value);
      if (idx !== -1) this.selectedScopes.splice(idx, 1);
    }
    console.log(this.selectedScopes);
  }

  @action
  addTags() {
    // Example label, you can set this dynamically as needed
    const label = 'sample label';

    // Get scope names or ids from selectedScopes
    const scopes = this.selectedScopes.map((value) => {
      // If value is a scope model, use its name or id
      if (typeof value === 'object' && value !== null) {
        return value.name || value.id;
      }
      // If value is an id, try to find the scope model in model.scopes
      const scopeModel = this.args.model.scopes?.find(
        (scope) => scope.id === value,
      );
      return scopeModel ? scopeModel.name || scopeModel.id : value;
    });

    // Build the object
    const result = {
      label,
      grants: this.grantStrings,
      scopes,
    };

    // Save or use the result as needed
    this.permissions = [...this.permissions, result];
    console.log(this.permissions);
    this.args.toggleBSide();
    this.args.handleSearchInput({ target: { value: '' } });
    this.selectedScopes = new TrackedArray([]);
    this.grantStrings = [];
  }
  @action
  addGrantString() {
    if (this.newGrantString?.trim()) {
      this.grantStrings = [...this.grantStrings, this.newGrantString.trim()];
      this.newGrantString = '';
    }
    console.log(this.grantStrings);
  }

  @action
  removeGrant(grantString) {
    this.grantStrings = this.grantStrings.filter((g) => g !== grantString);
    console.log(this.grantStrings);
  }
}
