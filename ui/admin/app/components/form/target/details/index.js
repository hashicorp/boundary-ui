import Component from '@glimmer/component';
import { options } from 'api/models/target';

export default class FormTargetComponent extends Component {
  // =properties
  /**
   * @type {object}
   */
  targetOptions = options;

  get icon() {
    if (this.args.model.type === 'tcp') {
      return options.tcp.icon;
    } else {
      return options.ssh.icon;
    }
  }
}
