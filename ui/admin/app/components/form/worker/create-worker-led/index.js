import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class FormWorkerCreateWorkerLedComponent extends Component {
  // =services
  @service features;

  // =attributes
  @tracked generatedWorkerAuthToken;
  @tracked clusterId;
  @tracked ipAddress;
  @tracked configFilePath;
  @tracked workerTags;
  @tracked initialUpstreams;

  // =methods

  convertCommaSeparatedValuesToArray(input) {
    return input
      .split(',')
      .filter((value) => value.trim())
      .map((value) => `"${value?.trim()}"`)
      .join(', ');
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

  /**
   * Returns config creation text for `<Rose::CodeEditor>`. The user will see
   * different outputs based on if they are using `hcp` or `oss` binaries.
   * @type {string}
   */
  get workerConfigText() {
    const clusterText = `hcp_boundary_cluster_id = "${
      this.clusterId || '<config_id>'
    }"`;

    const tagsText = `tags {
    type = [${
      this.workerTags ? this.convertCommaSeparatedValuesToArray(this.workerTags) : '"<tag1>", "<tag2>"'
    }]
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
    this.features.isEnabled('byow-pki-upstream')
      ? `${tagsText}${upstreamText}`
      : `${tagsText}`
  }
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
    return `curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add - ;\\
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main" ;\\
sudo apt-get update && sudo apt-get install boundary ;\\
boundary server -config="${this.configFilePath || '<path>'}/pki-worker.hcl"`;
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
}
