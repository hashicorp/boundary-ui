import Component from '@glimmer/component';
import { TYPES_TARGET } from 'api/models/target';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

// NOTE: this is all a temporary solution till we have a resource type helper.
const types = [...TYPES_TARGET].reverse();
const icons = {
  ssh: 'terminal-screen',
  tcp: 'network',
};

export default class FormTargetComponent extends Component {
  // =properties
  @tracked
  useHostSources = this.initialUseHostSourcesValue;

  /**
   * maps resource type with icon
   * @type {object}
   */
  get typeMetas() {
    return types.map((type) => ({
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

  /**
   * determines when the worker filter deprecation message should be shown
   * @type {boolean}
   */
  get showDeprecationMessage() {
    return !this.args.model.isNew && this.args.model.worker_filter;
  }

  /**
   * Gets the initial value for whether the target is using host sources
   * @returns {boolean}
   */
  get initialUseHostSourcesValue() {
    return !this.args.model.address && !this.args.model.isNew;
  }

  // =actions

  @action
  submit() {
    this.args.submit({
      adapterOptions: { useHostSources: this.useHostSources },
    });
  }

  @action
  cancel() {
    this.args.cancel();
    // Reset the tracked variables for toggles after rollback
    this.useHostSources = this.initialUseHostSourcesValue;
  }

  @action
  toggleUseHostSources() {
    this.useHostSources = !this.useHostSources;
  }
}
