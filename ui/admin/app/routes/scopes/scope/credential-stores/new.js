import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ScopesScopeCredentialStoresNewRoute extends Route {
  // =services

  @service router;
  @service features;
  // =attributes

  queryParams = {
    type: {
      refreshModel: true,
    },
  };

  // =methods
  /**
   * Creates a new unsaved credential-store
   * Also rollback/destroy any new, unsaved instances from this route before
   * creating another, but reuse name/description if available.
   */
  model({ type = 'static' }) {
    const scopeModel = this.modelFor('scopes.scope');
    let name, description;
    if (this.currentModel?.isNew) {
      ({ name, description } = this.currentModel);
      this.currentModel.rollbackAttributes();
    }
    //hide static type credential stores if the feature flag isn't enabled
    if (!this.features.isEnabled('static-credentials')) {
      type = 'vault';
    }
    return this.store.createRecord('credential-store', {
      type,
      scopeModel,
      name,
      description,
    });
  }

  /**
   * Update type of credential store
   * @param {string} type
   */
  @action
  changeType(type) {
    this.router.replaceWith({ queryParams: { type } });
  }
}
