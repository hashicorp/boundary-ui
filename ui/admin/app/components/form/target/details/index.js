import Component from '@glimmer/component';
import { TYPES_TARGET } from 'api/models/target';
import { loading } from 'ember-loading';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { notifyError } from 'core/decorators/notify';

// NOTE: this is all a temporary solution till we have a resource type helper.
const types = [...TYPES_TARGET].reverse();
const icons = {
  ssh: 'terminal-screen',
  tcp: 'network',
};

export default class FormTargetComponent extends Component {
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

  @action
  @loading
  @notifyError(({ message }) => message)
  async submit() {
    const target = this.args.model;
    const numHostSources = target.host_sources?.length;
    if (target.address && numHostSources) {
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
    }

    await this.args.submit();
  }
}
