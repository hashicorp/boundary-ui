import Component from '@glimmer/component';
import { TYPES_TARGET } from 'api/models/target';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

// NOTE: this is all a temporary solution till we have a resource type helper.
const types = [...TYPES_TARGET].reverse();
const icons = {
  ssh: 'terminal-screen',
  tcp: 'network',
};
export default class FormTargetComponent extends Component {
  // =properties
  @tracked egressWorkerFilterEnabled = this.args.model.egress_worker_filter;
  @tracked ingressWorkerFilterEnabled = this.args.model.ingress_worker_filter;

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

  //note: these getters will go away when we refactor worker diagram
  /**
   * determines when the enterprise dual filter diagrams should be shown
   * @type {boolean}
   */
  get workerDiagramDualFilter() {
    return this.features.isEnabled('target-worker-filters-v2-ingress');
  }
  /**
   * determines when the hcp dual filter diagrams should be shown
   * @type {boolean}
   */
  get workerDiagramHCPDualFilter() {
    return this.features.isEnabled('target-worker-filters-v2-hcp');
  }

  //actions
  @action
  toggleEgressFilter() {
    this.egressWorkerFilterEnabled = !this.egressWorkerFilterEnabled;
    if (!this.egressWorkerFilterEnabled) {
      this.args.model.egress_worker_filter = '';
    }
  }

  @action
  toggleIngressFilter() {
    this.ingressWorkerFilterEnabled = !this.ingressWorkerFilterEnabled;
    if (!this.ingressWorkerFilterEnabled) {
      this.args.model.ingress_worker_filter = '';
    }
  }
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

    this.egressWorkerFilterEnabled = this.args.model.egress_worker_filter;

    this.ingressWorkerFilterEnabled = this.args.model.ingress_worker_filter;
  }
}
