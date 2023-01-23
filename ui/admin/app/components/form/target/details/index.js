import Component from '@glimmer/component';
import { TYPES_TARGET } from 'api/models/target';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

// NOTE: this is all a temporary solution till we have a resource type helper.
const types = [...TYPES_TARGET].reverse();
const filterTypes = ['egress_worker_filter', 'ingress_worker_filter'];
const icons = {
  ssh: 'terminal-screen',
  tcp: 'network',
};

export default class FormTargetComponent extends Component {
  // =properties
  @tracked egressWorkerFilterEnabled =
    this.args.model.egress_worker_filter?.length;
  @tracked ingressWorkerFilterEnabled =
    this.args.model.ingress_worker_filter?.length;

  // =services
  @service features;
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
  get showUpdateWorkerFilterButton() {
    return this.args.model.worker_filter?.length;
  }

  get targetFilterTypes() {
    if (!this.args.model.worker_filter?.length && !this.args.model.isNew) {
      return this.features.isEnabled('target-worker-filters-v2-ingress')
        ? filterTypes
        : filterTypes.filter((type) => type !== 'ingress_worker_filter');
    }
  }

  //actions
  @action
  toggleEgressWorkerFilter() {
    this.egressWorkerFilterEnabled = !this.egressWorkerFilterEnabled;
    this.ingressWorkerFilterEnabled = !this.ingressWorkerFilterEnabled;
    if (!this.egressWorkerFilterEnabled || !this.ingressWorkerFilterEnabled) {
      this.args.model.egress_worker_filter = '';
    }
  }

  //actions
  @action
  toggleIngressWorkerFilter() {
    this.igressWorkerFilterEnabled = !this.igressWorkerFilterEnabled;
  }
  // =actions
  @action
  migrateWorkerFilters() {
    this.egressWorkerFilterEnabled = true;
    this.ingressWorkerFilterEnabled = true;
    // When update is clicked, copy worker filter value into egress filter and clear the worker_filter
    this.args.model.egress_worker_filter = this.args.model.worker_filter;
    this.args.model.ingress_worker_filter = this.args.model.worker_filter;

    this.args.model.worker_filter = '';
  }

  /**
   * Call passed cancel function.
   * Unset selected filters.
   */
  @action
  cancel() {
    this.args.cancel();
    // Reset the tracked variable for toggles after rollback
    this.egressWorkerFilterEnabled =
      this.args.model.egress_worker_filter?.length;

    this.ingressWorkerFilterEnabled =
      this.args.model.egress_worker_filter?.length;
  }
}
