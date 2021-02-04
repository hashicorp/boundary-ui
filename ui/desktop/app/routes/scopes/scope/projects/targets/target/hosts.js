import Route from '@ember/routing/route';
import { all } from 'rsvp';

export default class ScopesScopeProjectsTargetsTargetHostsRoute extends Route {
  // =methods

  /**
   * Loads all host-sets and associated hosts under the current target.
   * @return {Promise{[HostModel]}}
   */
  async model() {
    const { host_sets } = this.modelFor('scopes.scope.projects.targets.target');
    // Load all host-sets
    const hostSets = await all(
      host_sets.map(({ host_set_id }) => 
        this.store.findRecord('host-set', host_set_id)
      )
    );

    // Extract host ids from all host sets
    const hostIds = hostSets.map(({host_ids}) =>
      host_ids.content.map((hostId) =>
        hostId.value
      ) 
    )

    // Load unique hosts
    const uniqueHostIds = new Set(hostIds.flat());
    return all(
      [...uniqueHostIds].map((hostId) => 
        this.store.findRecord('host', hostId)
      )
    );
  }
}
