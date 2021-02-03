import Route from '@ember/routing/route';
import { all, hash } from 'rsvp';
import { A } from '@ember/array';

export default class ScopesScopeProjectsTargetsTargetHostsRoute extends Route {
  // =methods

  /**
   * Loads all host-sets and associated hosts under the current target.
   * @return {Promise{[HostModel]}}
   */
  async model() {
    const { host_sets } = this.modelFor('scopes.scope.projects.targets.target');
    const hostSetsPromises = await all(
      host_sets.map(({ host_set_id }) => 
        this.store.findRecord('host-set', host_set_id)
      )
    );

    // Extract host ids from all host set
    const hostIds = A();
    hostSetsPromises.map(({ host_ids }) => 
      host_ids.forEach(({ value }) => hostIds.push(value) )
    );
    
    // Fetch all hosts
    const hostPromises = await all(
      hostIds.uniq().map((hostId) => 
        this.store.findRecord('host', hostId)
      )
    )

    return all(hostPromises);
  }
}
