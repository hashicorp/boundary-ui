import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ScopesScopeTargetsNewRoute extends Route {
  // =services

  @service router;
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

  model({ type = 'tcp' }) {
    const scopeModel = this.modelFor('scopes.scope');
    let name, description;
    if (this.currentModel?.isNew) {
      ({ name, description } = this.currentModel);
      this.currentModel.rollbackAttributes();
    }

    return this.store.createRecord('target', {
      scopeModel,
      type,
      name,
      description,
    });
  }

  /**
   * Update type of target
   * @param {string} type
   */
  @action
  changeType(type) {
    //  if (type === 'plugin') type = 'aws';
    this.router.replaceWith({ queryParams: { type } });
  }
}
