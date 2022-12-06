import Component from '@glimmer/component';
import { types } from 'api/models/target';

export default class FormTargetComponent extends Component {
  // =properties
  targetTypes = types;

  get icon() {
    if (this.args.model.type === 'tcp') {
      return types.tcp[0];
    } else {
      return types.ssh[0];
    }
  }
}
