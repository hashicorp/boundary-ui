import Component from '@glimmer/component';
import { types } from 'api/models/credential';

export default class FormSSHPrivateKeyCredentialComponent extends Component {
  // =attributes
  /**
   * @type {Array}
   */
  credentialTypes = types;
}
