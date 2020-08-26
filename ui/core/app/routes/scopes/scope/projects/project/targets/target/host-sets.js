import Route from '@ember/routing/route';
import { all } from 'rsvp';

export default class ScopesScopeProjectsProjectTargetsTargetHostSetsRoute extends Route {
  // =methods

  /**
   * Loads all host-sets and associated host-catalogs under the current target
   * and it's parent scope.
   * @return {Promise{[HostSetModel, HostCatalogModel]}}
   */
  beforeModel() {
    const hostSets = [], hostCatalogs = [];
    const target = this.modelFor('scopes.scope.projects.project.targets.target');
    const scopeID = this.modelFor('scopes.scope.projects.project').id;

    target.host_sets.map((hostSet) => {
      hostSets.push(
        this.store.findRecord(
          'host-set',
          hostSet.host_set_id,
          { adapterOptions : { scopeID, hostCatalogID: hostSet.host_catalog_id } }
        )
      );

      hostCatalogs.push(
        this.store.findRecord(
          'host-catalog',
          hostSet.host_catalog_id,
          { adapterOptions : { scopeID } }
        )
      );
    });

    return all(hostSets.concat(hostCatalogs));
  }

  /**
   * Load current target and it's associated host-sets and host-catalogs
   * @return {Promise{[TargetModel]}}
   */
  model() {
    return this.modelFor('scopes.scope.projects.project.targets.target');
  }
}
