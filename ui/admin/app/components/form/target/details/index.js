import Component from '@glimmer/component';
import { types } from 'api/models/target';

//Note: this is a temporary solution till we have resource type helper in place
const icons = {
  ssh: 'terminal-screen',
  tcp: 'network',
};

export default class FormTargetComponent extends Component {
  // =properties
  /**
   * maps resource type with icon
   * @type {object}
   */
  get typeMetas() {
    const reversedTypes = [...types].reverse();
    return reversedTypes.map((type) => ({
      type,
      icon: icons[type],
    }));
  }

  /**
   * returns icons based on the model type
   * unlike other resources, this is needed as we use generic details component for both tcp and ssh
   * @type {string}
   */
  get icon() {
    return icons[this.args.model.type];
  }
}
