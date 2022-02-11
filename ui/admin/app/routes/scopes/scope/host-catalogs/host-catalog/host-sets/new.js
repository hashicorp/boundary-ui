import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ScopesScopeHostCatalogsHostCatalogHostSetsNewRoute extends Route {
  // =services
  @service router;

  // =methods
  /**
   * Creates a new unsaved host set in current host catalog scope.
   * @return {HostSetModel}
   */
  model() {
    const { id: host_catalog_id, compositeType } = this.modelFor(
      'scopes.scope.host-catalogs.host-catalog'
    );
    if (this.currentModel?.isNew) {
      this.currentModel.rollbackAttributes();
    }
    console.log('typedwed', compositeType);
    return this.store.createRecord('host-set', {
      compositeType,
      host_catalog_id,
    });
  }

  /**
   * Renders new host-set specific templates for header, navigation, and action page sections.
   * @override
   * @param {object} controller
   * @param {object} model
   */
  renderTemplate(controller, model) {
    super.renderTemplate(...arguments);

    this.render(
      'scopes/scope/host-catalogs/host-catalog/host-sets/new/-header',
      {
        into: 'scopes/scope/host-catalogs/host-catalog',
        outlet: 'header',
        model: model,
      }
    );

    this.render('_empty', {
      into: 'scopes/scope/host-catalogs/host-catalog',
      outlet: 'navigation',
      model: model,
    });

    this.render('_empty', {
      into: 'scopes/scope/host-catalogs/host-catalog',
      outlet: 'actions',
      model: model,
    });
  }
  /**
   * Update type of host set
   * @param {string} type
   */
  @action
  async changeType(type) {
    await this.router.replaceWith({ queryParams: { type } });
  }
}
