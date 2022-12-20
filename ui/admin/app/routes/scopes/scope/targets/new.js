import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ScopesScopeTargetsNewRoute extends Route {
  // =services

  @service store;
  @service router;
  @service features;

  // =methods

  // =attributes
  queryParams = {
    type: {
      refreshModel: true,
    },
  };
  /**
   * Creates a new unsaved target in current scope.
   * Also rollback/destroy any new, unsaved instances from this route before
   * creating another, but reuse name/description if available.
   * @return {TargetModel}
   */

  model({ type }) {
    let name, description;
    const scopeModel = this.modelFor('scopes.scope');

    // default type is SSH if the feature is enabled, otherwise TCP
    if (!type) type = this.features.isEnabled('ssh-target') ? 'ssh' : 'tcp';

    if (this.currentModel?.isNew) {
      ({ name, description } = this.currentModel);
      this.currentModel.rollbackAttributes();
    }

    const record = this.store.createRecord('target', {
      type,
      name,
      description,
    });
    record.scopeModel = scopeModel;
    return record;
  }

  /**
   * Update type of target
   * @param {string} type
   */
  @action
  changeType(type) {
    this.router.replaceWith({ queryParams: { type } });
  }
}
