import Component from '@glimmer/component';
import { options } from 'api/models/credential-store';

export default class FormStaticCredentialStoreIndexComponent extends Component {
  // =properties
  /**
   * @type {object}
   */
  types = options;
  icon = options[this.args.model.type].icon;
}
