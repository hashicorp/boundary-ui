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

  // =properties

  /**
   * Returns directory creation text for `<Rose::CodeEditor>`.
   * @type {string}
   */
  get createConfigText() {
    return `mkdir ${this.configFilePath || '<path>'}/ ;\\
touch ${this.configFilePath || '<path>'}/pki-worker.hcl`;
  }

  /**
   * Returns config creation text for `<Rose::CodeEditor>`. The user will see
   * different ouptuts based on if the are using `hcp` or `oss` binaries.
   * @type {string}
   */
  get workerConfigText() {
    return `${
      this.features.isEnabled('byow-pki-hcp-cluster-id')
        ? `hcp_boundary_cluster_id = "${this.clusterId || '<config_id>'}"`
        : `listener "tcp" {
  address = "0.0.0.0:9202"
  purpose = "proxy"
}`
    }

worker {
  public_addr = "${this.ipAddress || '<public_ip_address>'}"
  auth_storage_path = "${this.configFilePath || '<path>'}/worker1"
  tags {
    type = [${
      this.workerTags
        ? this.workerTags
            .split(',')
            .filter((tag) => tag.trim())
            .map((tag) => `"${tag?.trim()}"`)
            .join(', ')
        : '"<tag1>", "<tag2>"'
    }],
  },
  ${
    this.features.isEnabled('byow-pki-upstream')
      ? `initial_upstreams = [${
          this.initialUpstreams
            ? this.initialUpstreams
                .split(',')
                .filter((tag) => tag.trim())
                .map((tag) => `"${tag?.trim()}"`)
                .join(', ')
            : '\n\t"<upstream1>",\n\t"<upstream2>",\n\t"<upstream3>"\n'
        }  ]`
      : ''
  }
}`;
  }
  /**
   * Returns boundar installation command, and worker worker server config
   * for for `<Rose::CodeEditor>`.
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
