import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ScopesScopeHostCatalogsNewRoute extends Route {
  // =services

  @service router;

  // =attributes

  queryParams = {
    type: {
      refreshModel: true,
    },
  };

  // =methods

  /**
   * Creates a new unsaved host catalog belonging to the current scope.
   * @return {HostCatalogModel}
   */
  model(params) {
    const scopeModel = this.modelFor('scopes.scope');
    if (!params.type) params.type = 'static';
    return this.store.createRecord('host-catalog', {
      type: params.type,
      scopeModel,
    });
  }

  afterModel(model) {
    this.router.replaceWith({ queryParams: { type: model.compositeType } });
  }

  /**
   * Update type of host catalog
   * @param {string} type
   */
  @action
  async changeType(type) {
    console.log(type, 'GET TYPE HERE');
    await this.router.replaceWith({ queryParams: { type } });
  }
}
