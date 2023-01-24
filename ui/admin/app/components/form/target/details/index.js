import Component from '@glimmer/component';
import { TYPES_TARGET, FILTER_TYPES_TARGET } from 'api/models/target';
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
  @tracked egressWorkerFilterEnabled =
    this.args.model.egress_worker_filter?.length;
  @tracked ingressWorkerFilterEnabled =
    this.args.model.ingress_worker_filter?.length;
  @tracked isEnterprise = this.features.isEnabled(
    'target-worker-filters-v2-ingress'
  );
  @tracked isHCP = this.features.isEnabled('target-worker-filters-v2-hcp');
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

  get filters() {
    return FILTER_TYPES_TARGET;
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

  /**
   * determines when the filters should be shown
   * @type {boolean}
   */
  get showTargetFilters() {
    return !this.args.model.worker_filter?.length;
  }

  /**
   * determines when the dual filters should be shown
   * @type {boolean}
   */
  get showDualTargetWorkerFilters() {
    return this.isHCP || this.isEnterprise;
  }

  /**
   * determines when the single filter should be shown
   * @type {boolean}
   */
  get showOSSTargetWorkerFilters() {
    return (
      this.features.isEnabled('target-worker-filters-v2') &&
      FILTER_TYPES_TARGET.filter((type) => type !== 'ingress_worker_filter')
    );
  }

  //actions
  @action
  toggleFilter(type) {
    if (type === 'egress_worker_filter') {
      this.egressWorkerFilterEnabled = !this.egressWorkerFilterEnabled;
    } else {
      this.ingressWorkerFilterEnabled = !this.ingressWorkerFilterEnabled;
    }

    if (!this.egressWorkerFilterEnabled) {
      this.args.model.egress_worker_filter = '';
    }
    if (!this.ingressWorkerFilterEnabled) {
      this.args.model.ingress_worker_filter = '';
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
      this.args.model.ingress_worker_filter?.length;
  }
}
