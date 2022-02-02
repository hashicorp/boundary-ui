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
  model() {
    const scopeModel = this.modelFor('scopes.scope');
    return this.store.createRecord('host-catalog', { scopeModel });
  }

  afterModel(model, transition) {
    this.changeType(transition.to.queryParams?.type);
  }

  /**
   * Update type of host catalog
   * @param {string} type
   */
  @action
  async changeType(type) {
    const model = this.modelFor('scopes.scope.host-catalogs.new');
    if(!type) type = 'static'; // Unknown host catalog type defaults to 'static'
    if (model.isUnknown) type = 'aws'; //Is this the default case for plugin type?
    model.compositeType = type;
    await this.router.replaceWith({ queryParams: { type } });
  }
}
