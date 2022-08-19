import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class FormWorkerCreateWorkerLedComponent extends Component {
  // =attributes

  @tracked generatedWorkerAuthToken;
  @tracked clusterId;
  @tracked ipAddress;
  @tracked configFilePath;
  @tracked workerTags;

  get createConfigText() {
    return `mkdir ${this.configFilePath || '<path>'}/ ;\\
touch ${this.configFilePath || '<path>'}/pki-worker.hcl`;
  }

  get workerConfigText() {
    return `hcp_boundary_cluster_id = "${this.clusterId || '<config_id>'}"

listener "tcp" {
  address = "0.0.0.0:9202"
  purpose = "proxy"
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
    }]
  }
}`;
  }

  get installBoundaryText() {
    return `curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add - ;\\
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main" ;\\
sudo apt-get update && sudo apt-get install boundary ;\\
boundary server -config="${this.configFilePath || '<path>'}/pki-worker.hcl"`;
  }

  get shellCodeEditor() {
    return {
      mode: 'shell',
      readOnly: true,
      lineNumbers: false,
      cursorBlinkRate: -1,
      styleActiveLine: false,
    };
  }

  get hclCodeEditor() {
    return {
      mode: 'hcl',
      readOnly: true,
      cursorBlinkRate: -1,
      styleActiveLine: false,
    };
  }
}
