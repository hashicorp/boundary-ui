import Route from '@ember/routing/route';
import { all, hash } from 'rsvp';

export default class ScopesScopeProjectsProjectTargetsTargetHostSetsRoute extends Route {
  // =methods

  /**
   * Loads all host-sets and associated host-catalogs under the current target
   * and it's parent scope.
   * @return {Promise{[HostSetModel, HostCatalogModel]}}
   */
  beforeModel() {
    const { scopeID, host_sets } =
      this.modelFor('scopes.scope.projects.project.targets.target');
    const promises = host_sets
      .map(({ host_set_id, host_catalog_id: hostCatalogID }) =>
        hash({
          // TODO:  multiple host sets may belong to the same catalog,
          // resulting in the catalog being loaded multiple times.
          // An improvement would be to find the unique set of catalogs first.
          hostCatalog: this.store.findRecord(
            'host-catalog',
            hostCatalogID,
            { adapterOptions: { scopeID } }
          ),
          hostSet: this.store.findRecord(
            'host-set',
            host_set_id,
            { adapterOptions: { scopeID, hostCatalogID } }
          )
        })
      );
    return all(promises);
  }

  /**
   * Returns the previously loaded target instance.
   * @return {TargetModel}
   */
  model() {
    return this.modelFor('scopes.scope.projects.project.targets.target');
  }
}
