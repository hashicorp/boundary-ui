import Route from '@ember/routing/route';
import { all, hash } from 'rsvp';
import { inject as service } from '@ember/service';

export default class ScopesScopeProjectsTargetsTargetHostsRoute extends Route {
  // =services

  @service ipc;
  @service session;
  @service origin;
  @service notify;
  @service confirm;

  // =methods

  /**
   * Loads all host-sets and associated hosts under the current target.
   * @return {Promise{[HostModel]}}
   */
  async model() {
    const target = this.modelFor('scopes.scope.projects.targets.target');
    // Load all host-sets
    const hostSets = await all(
      target.host_sets.map(({ host_set_id }) =>
        this.store.findRecord('host-set', host_set_id)
      )
    );

    // Extract host ids from all host sets
    const hostIds = hostSets.map(({ host_ids }) =>
      host_ids.content.map((hostId) => hostId.value)
    );

    // Load unique hosts
    const uniqueHostIds = new Set(hostIds.flat());

    return hash({
      target,
      hosts: all(
        [...uniqueHostIds].map((hostId) =>
          this.store.findRecord('host', hostId)
        )
      ),
    });
  }
}
