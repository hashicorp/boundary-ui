import Route from '@ember/routing/route';
import { all, hash } from 'rsvp';
import { later } from '@ember/runloop';
import { action } from '@ember/object';
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
    const { target } = this.modelFor('scopes.scope.projects.targets.target');
    // Load all host-sets
    const hostSets = await all(
      target.host_sets.map(({ host_set_id }) => 
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

    return hash({
      target,
      hosts: all(
        [...uniqueHostIds].map((hostId) => 
          this.store.findRecord('host', hostId)
        )
      )
    })
  }

  /**
   * Establish a session to host within target.
   * @param {TargetModel} target
   * @param {HostModel} host
   */
  @action
  async connect(target, host) {
    // TODO: Connect: Refactor into an addon
    try {
      // Check for CLI
      const cliExists = await this.ipc.invoke('cliExists');
      if (!cliExists) throw new Error('Cannot find Boundary CLI.');

      // Create target session
      const connectionDetails = await this.ipc.invoke('connect', {
        host_id: host.id,
        target_id: target.id,
        token: this.session.data.authenticated.token,
        addr: this.origin.rendererOrigin
      });

      // Associate the connection details with the session
      const { session_id, address, port } = connectionDetails;
      await this.store.findRecord('session', session_id);

      // Update the session record with proxy information from the CLI
      // This is read-only information that shouldn't dirty the session,
      // so we use store.push here.  In the future, it may make sense to push
      // this off to the API so that we don't have to manually persist the
      // proxy details.
      later(() => {
        this.store.push({
          data: {
            id: session_id,
            type: 'session',
            attributes: {
              proxy_address: address,
              proxy_port: port
            }
          }
        });
      }, 150);

      // Show the user a modal with basic connection info.
      // We don't await because this modal is purely informational.
      this.confirm.confirm(connectionDetails, { isConnectSuccess: true });

    } catch(e) {
      this.confirm.confirm(e.message, { isConnectError: true })
        // Retry
        .then(() => this.connect(target, host))
        .catch(() => null /* no op */);
    }
  }
}
