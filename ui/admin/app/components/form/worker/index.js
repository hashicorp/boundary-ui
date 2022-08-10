import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class FormWorkerIndexComponent extends Component {
  // =attributes

  @tracked generatedWorkerAuthToken;

  get createConfigText() {
    return `mkdir /home/ubuntu/boundary/ ;\\
touch /home/ubuntu/boundary/pki-worker.hcl`;
  }

  get workerConfigText() {
    return `hcp_boundary_cluster_id = "<config_id>"

listener "tcp" {
  address = "127.0.0.1:9202"
  purpose = "proxy"
}

worker {
  auth_storage_path = "<path>/worker1"
  tags {
    type = ["dev-worker", "ubuntu"]
  }
}`;
  }

  get installBoundaryText() {
    return `curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add - ;\\
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main" ;\\
sudo apt-get update && sudo apt-get install boundary ;\\
boundary server -config="/home/apps/boundary/pki-worker.hcl"`;
  }

  get shellCodeEditor() {
    return {
      mode: 'shell',
      readOnly: true,
    };
  }

  get hclCodeEditor() {
    return {
      mode: 'hcl',
      readOnly: true,
    };
  }
  hclCodeTest = {
    test: 'tst',
  };
}
