import Route from '@ember/routing/route';
import { all } from 'rsvp';

export default class ScopesScopeProjectsProjectTargetsTargetHostSetsRoute extends Route {
  // =methods

  /**
   *
   * Loads all host-sets under the current target and it's parent scope.
   * @return {Promise{[HostSetModel]}}
   */
  async model() {
    const target = this.modelFor('scopes.scope.projects.project.targets.target');
    const scopeID = this.modelFor('scopes.scope.projects.project').id;

    const hostSets = target.host_sets.map((hostSet) =>
      this.store.findRecord(
        'host-set',
        hostSet.host_set_id,
        { adapterOptions : { scopeID, hostCatalogID: hostSet.host_catalog_id } }
      )
    );

    return all(hostSets);
  }
}
