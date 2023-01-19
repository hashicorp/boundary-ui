import Component from '@glimmer/component';
import { TYPES_TARGET } from 'api/models/target';
import { loading } from 'ember-loading';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { notifyError } from 'core/decorators/notify';
import { tracked } from '@glimmer/tracking';
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
  // =services

  @service confirm;
  @service intl;

  // =properties
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

  get showEgressFilter() {
    return !this.args.model.worker_filter?.length && !this.args.model.isNew;
  }

  //actions
  @action
  toggleEgressWorkerFilter() {
    this.egressWorkerFilterEnabled = !this.egressWorkerFilterEnabled;
  }

  // =actions
  @action
  migrateWorkerFilters() {
    this.egressWorkerFilterEnabled = true;
    // When update is clicked, copy worker filter value into egress filter and clear the worker_filter
    this.args.model.egress_worker_filter = this.args.model.worker_filter;
    this.args.model.worker_filter = '';
  }

  @action
  @loading
  @notifyError(({ message }) => message)
  async submit() {
    const target = this.args.model;
    const numHostSources = target.host_sources?.length;
    const address = target.address;
    if (address && numHostSources) {
      try {
        await this.confirm.confirm(
          this.intl.t(
            'resources.target.questions.delete-host-sources.message',
            { numHostSources }
          ),
          {
            title: 'resources.target.questions.delete-host-sources.title',
            confirm: 'actions.remove-resources',
          }
        );
      } catch (e) {
        // if the user denies, do nothing and return
        return;
      }

      await target.removeHostSources(
        target.host_sources.map((hs) => hs.host_source_id)
      );
      // After saving the host sources, the model gets reset to an empty address,
      // so we need to update the address with the previous value before saving
      target.address = address;
    }
    await this.args.submit(target, this.egressWorkerFilterEnabled);
  }
}
