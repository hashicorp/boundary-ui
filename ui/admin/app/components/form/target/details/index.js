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
  @tracked egressToggle = this.args.model.egress_worker_filter?.length;
  @tracked updateOldWorkerFilter = false;
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
   * determines when the update worker filter button should be shown
   * @type {boolean}
   */
  get showUpdateWorkFilterButton() {
    return (
      !this.args.model.isNew &&
      this.args.model.worker_filter &&
      !this.updateOldWorkerFilter
    );
  }
  // =actions
  @action
  toggleEgressWorkerFilter() {
    this.egressToggle = !this.egressToggle;
  }
  // =actions
  @action
  updateFilter() {
    this.updateOldWorkerFilter = true;
  }
}
