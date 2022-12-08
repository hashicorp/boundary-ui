import Component from '@glimmer/component';
import { types } from 'api/models/target';

//Note: this is a temporary solution till we have resource type helper in place
const icons = ['network', 'terminal'];

export default class FormTargetComponent extends Component {
  // =properties
  /**
   * maps resource type with icon
   * @type {object}
   */
  get mapResourceTypewithIcon() {
    return types.reduce((obj, type, i) => ({ ...obj, [type]: icons[i] }), {});
  }

  /**
   * returns icons based on the model type
   * unlike other resources, this is needed as we use generic details component for both tcp and ssh
   * @type {string}
   */
  get icon() {
    if (this.args.model.type === 'tcp') {
      return icons[0];
    } else {
      return icons[1];
    }
  }
}
